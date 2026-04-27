import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import * as aidenLib from '@/lib/aiden';
import * as Sentry from '@sentry/nextjs';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/aiden');

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/aiden/train', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/aiden/train', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with data on success', async () => {
    vi.mocked(aidenLib.aidenTrain).mockResolvedValueOnce({
      sessionId: 'abc-123',
      status: 'training',
    });
    const res = await POST(makeRequest({ url: 'example.com' }));
    expect(res.status).toBe(200);
    const body = await res.json() as { data: { sessionId: string; status: string }; error: null };
    expect(body.data.sessionId).toBe('abc-123');
    expect(body.data.status).toBe('training');
    expect(body.error).toBeNull();
  });

  it('returns 400 when url is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json() as { data: null; error: { code: string } };
    expect(body.error.code).toBe('INVALID_REQUEST');
    expect(body.data).toBeNull();
  });

  it('returns 429 on AbortError (timeout)', async () => {
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    vi.mocked(aidenLib.aidenTrain).mockRejectedValueOnce(abortErr);
    const res = await POST(makeRequest({ url: 'slow.com' }));
    expect(res.status).toBe(429);
    const body = await res.json() as { data: null; error: { message: string; code: string } };
    expect(body.error.code).toBe('AIDEN_TIMEOUT');
    expect(body.error.message).toBe('Training timed out');
  });

  it('does NOT call Sentry on timeout', async () => {
    const abortErr = new Error('aborted');
    abortErr.name = 'AbortError';
    vi.mocked(aidenLib.aidenTrain).mockRejectedValueOnce(abortErr);
    await POST(makeRequest({ url: 'slow.com' }));
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('returns 500 and calls Sentry on unhandled error', async () => {
    vi.mocked(aidenLib.aidenTrain).mockRejectedValueOnce(new Error('network failure'));
    const res = await POST(makeRequest({ url: 'example.com' }));
    expect(res.status).toBe(500);
    const body = await res.json() as { data: null; error: { code: string } };
    expect(body.error.code).toBe('SERVER_ERROR');
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
  });
});
