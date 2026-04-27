import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import * as hubspotLib from '@/lib/hubspot';
import * as Sentry from '@sentry/nextjs';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/hubspot');

const mockUpsert = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(hubspotLib.getHubSpotClient).mockReturnValue({
    crm: { contacts: { batchApi: { upsert: mockUpsert } } },
  } as never);
});

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/hubspot/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/hubspot/contact', () => {
  it('returns 200 with contactId on success', async () => {
    mockUpsert.mockResolvedValueOnce({ results: [{ id: 'contact-123' }] });
    const res = await POST(makeRequest({ email: 'test@example.com' }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { contactId: string }; error: null };
    expect(body.data.contactId).toBe('contact-123');
    expect(body.error).toBeNull();
  });

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({ olark_company_size: '1-10' }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { data: null; error: { code: string } };
    expect(body.error.code).toBe('INVALID_REQUEST');
    expect(body.data).toBeNull();
  });

  it('calls upsert with correct idProperty', async () => {
    mockUpsert.mockResolvedValueOnce({ results: [{ id: 'c-1' }] });
    await POST(makeRequest({ email: 'a@b.com' }));
    expect(mockUpsert).toHaveBeenCalledWith({
      inputs: [expect.objectContaining({ id: 'a@b.com', idProperty: 'email' })],
    });
  });

  it('stringifies number and boolean properties', async () => {
    mockUpsert.mockResolvedValueOnce({ results: [{ id: 'c-1' }] });
    await POST(
      makeRequest({ email: 'a@b.com', olark_demo_depth: 3, olark_quiz_partial: false }),
    );
    expect(mockUpsert).toHaveBeenCalledWith({
      inputs: [
        expect.objectContaining({
          properties: expect.objectContaining({
            olark_demo_depth: '3',
            olark_quiz_partial: 'false',
          }),
        }),
      ],
    });
  });

  it('returns 500 and calls Sentry on unhandled error', async () => {
    mockUpsert.mockRejectedValueOnce(new Error('API down'));
    const res = await POST(makeRequest({ email: 'a@b.com' }));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { data: null; error: { code: string } };
    expect(body.error.code).toBe('SERVER_ERROR');
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
});
