import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import * as aidenLib from '@/lib/aiden';
import * as Sentry from '@sentry/nextjs';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/aiden');

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/aiden/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/aiden/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when sessionId is missing', async () => {
    const res = await POST(makeRequest({ message: 'hello' }));
    expect(res.status).toBe(400);
    const body = await res.json() as { data: null; error: { code: string } };
    expect(body.error.code).toBe('INVALID_REQUEST');
  });

  it('returns 400 when message is missing', async () => {
    const res = await POST(makeRequest({ sessionId: 'abc' }));
    expect(res.status).toBe(400);
    const body = await res.json() as { data: null; error: { code: string } };
    expect(body.error.code).toBe('INVALID_REQUEST');
  });

  it('forwards upstream body when present (streaming path)', async () => {
    const upstream = new Response('streamed content', {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
    vi.mocked(aidenLib.aidenChat).mockResolvedValueOnce(upstream);
    const res = await POST(makeRequest({ sessionId: 'abc', message: 'hello' }));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe('streamed content');
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('returns 500 and calls Sentry on unhandled error', async () => {
    vi.mocked(aidenLib.aidenChat).mockRejectedValueOnce(new Error('upstream down'));
    const res = await POST(makeRequest({ sessionId: 'abc', message: 'hello' }));
    expect(res.status).toBe(500);
    const body = await res.json() as { data: null; error: { code: string } };
    expect(body.error.code).toBe('SERVER_ERROR');
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
});
