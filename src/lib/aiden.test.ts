import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aidenTrain, aidenChat } from './aiden';

describe('aidenTrain', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns sessionId and status on success', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sessionId: 'sess-123', status: 'training' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await aidenTrain('example.com');
    expect(result.sessionId).toBe('sess-123');
    expect(result.status).toBe('training');
  });

  it('sends Authorization header with AIDEN_API_KEY', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sessionId: 'x', status: 'ok' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await aidenTrain('example.com');
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)['Authorization']).toMatch(/^Bearer /);
  });

  it('sends the url in the request body', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sessionId: 'y', status: 'ok' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await aidenTrain('mycompany.com');
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(options.body as string)).toEqual({ url: 'mycompany.com' });
  });

  it('throws AbortError when 10s timeout fires', async () => {
    const mockFetch = vi.fn().mockImplementation(
      (_url: string, opts: RequestInit) =>
        new Promise<Response>((_, reject) => {
          opts.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }),
    );
    vi.stubGlobal('fetch', mockFetch);

    const trainPromise = aidenTrain('slow.com');
    // Advance past the 10s timeout
    vi.advanceTimersByTime(10_001);
    await expect(trainPromise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('throws on non-ok response', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 503 });
    vi.stubGlobal('fetch', mockFetch);
    await expect(aidenTrain('example.com')).rejects.toThrow();
  });
});

describe('aidenChat', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the raw Response object', async () => {
    const mockResponse = new Response(JSON.stringify({ message: 'hello' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(mockResponse));

    const result = await aidenChat('sess-123', 'How does pricing work?');
    expect(result.status).toBe(200);
  });

  it('sends sessionId and message in the request body', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(
      new Response('{}', { status: 200 }),
    );
    vi.stubGlobal('fetch', mockFetch);

    await aidenChat('sess-abc', 'What is your price?');
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(options.body as string)).toEqual({
      sessionId: 'sess-abc',
      message: 'What is your price?',
    });
  });
});
