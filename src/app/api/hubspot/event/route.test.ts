import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import * as hubspotLib from '@/lib/hubspot';
import * as Sentry from '@sentry/nextjs';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/hubspot');

const mockSend = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(hubspotLib.getHubSpotClient).mockReturnValue({
    events: { send: { basicApi: { send: mockSend } } },
  } as never);
});

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/hubspot/event', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/hubspot/event', () => {
  it('returns 200 with a non-empty eventId on success', async () => {
    mockSend.mockResolvedValueOnce(undefined);
    const res = await POST(makeRequest({ eventName: 'quiz_completed', email: 'test@example.com' }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { eventId: string }; error: null };
    expect(typeof body.data.eventId).toBe('string');
    expect(body.data.eventId.length).toBeGreaterThan(0);
    expect(body.error).toBeNull();
  });

  it('returns 400 when eventName is missing', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com' }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { data: null; error: { code: string } };
    expect(body.error.code).toBe('INVALID_REQUEST');
    expect(body.data).toBeNull();
  });

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({ eventName: 'quiz_completed' }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { data: null; error: { code: string } };
    expect(body.error.code).toBe('INVALID_REQUEST');
    expect(body.data).toBeNull();
  });

  it('forwards properties and occurredAt to HubSpot', async () => {
    mockSend.mockResolvedValueOnce(undefined);
    await POST(
      makeRequest({
        eventName: 'quiz_step',
        email: 'a@b.com',
        properties: { step: '2' },
        occurredAt: '2026-04-27T00:00:00.000Z',
      }),
    );
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'quiz_step',
        email: 'a@b.com',
        properties: { step: '2' },
        occurredAt: expect.any(Date),
      }),
    );
  });

  it('returns 500 and calls Sentry on unhandled error', async () => {
    mockSend.mockRejectedValueOnce(new Error('API down'));
    const res = await POST(makeRequest({ eventName: 'quiz_completed', email: 'a@b.com' }));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { data: null; error: { code: string } };
    expect(body.error.code).toBe('SERVER_ERROR');
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
});
