import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';

function makeRequest(mediaId?: string | null): Request {
  const u = new URL('http://localhost/api/wistia-poster');
  if (mediaId !== null && mediaId !== undefined) {
    u.searchParams.set('mediaId', mediaId);
  }
  return new Request(u.toString());
}

const VALID_ID = 'abc12345';

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/wistia-poster', () => {
  it('rejects an invalid mediaId with 400', async () => {
    const res = await GET(makeRequest('not a valid id with spaces'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ url: null, error: 'Invalid mediaId' });
  });

  it('rejects a missing mediaId with 400', async () => {
    const res = await GET(makeRequest(null));
    expect(res.status).toBe(400);
  });

  it('extracts the largest still_image asset URL from Wistia JSONP', async () => {
    const wistiaPayload = `Wistia.iframeInit(${JSON.stringify({
      media: {
        posterURL: 'https://example.com/fallback.jpg',
        assets: [
          { type: 'still_image', width: 200, url: 'https://wistia.cdn/small.jpg' },
          { type: 'still_image', width: 1280, url: 'https://wistia.cdn/big.jpg' },
          { type: 'still_image', width: 640, url: 'https://wistia.cdn/medium.jpg' },
          { type: 'video', width: 1920, url: 'https://wistia.cdn/video.mp4' },
        ],
      },
    })});`;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(wistiaPayload, { status: 200 }),
    );
    const res = await GET(makeRequest(VALID_ID));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe('https://wistia.cdn/big.jpg');
    // Public 1-day cache header for stable poster URLs
    expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
  });

  it('falls back to posterURL when no still_image assets are present', async () => {
    const wistiaPayload = `Wistia.iframeInit(${JSON.stringify({
      media: {
        posterURL: 'https://example.com/poster.jpg',
        assets: [{ type: 'video', width: 1920, url: 'https://wistia.cdn/video.mp4' }],
      },
    })});`;
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(wistiaPayload, { status: 200 }),
    );
    const res = await GET(makeRequest(VALID_ID));
    expect((await res.json()).url).toBe('https://example.com/poster.jpg');
  });

  it('returns { url: null } gracefully when upstream returns garbage', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('not what we expected', { status: 200 }),
    );
    const res = await GET(makeRequest(VALID_ID));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBeNull();
  });

  it('returns { url: null } when Wistia returns a non-2xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 404 }),
    );
    const res = await GET(makeRequest(VALID_ID));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBeNull();
  });

  it('returns { url: null } when fetch throws', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network blew up'));
    const res = await GET(makeRequest(VALID_ID));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBeNull();
  });
});
