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

interface FetchSpec {
  oembed?: { status?: number; body?: unknown };
  jsonp?: { status?: number; body?: string };
}

/** Stubs global fetch to route Wistia URLs to the per-call spec. */
function stubFetch(spec: FetchSpec): void {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = typeof input === 'string' ? input : (input as Request).url;
    if (url.includes('fast.wistia.com/oembed')) {
      const o = spec.oembed;
      if (!o) return new Response('', { status: 404 });
      return new Response(
        typeof o.body === 'string' ? o.body : JSON.stringify(o.body ?? {}),
        { status: o.status ?? 200, headers: { 'Content-Type': 'application/json' } },
      );
    }
    if (url.includes('/embed/medias/') && url.endsWith('.jsonp')) {
      const j = spec.jsonp;
      if (!j) return new Response('', { status: 404 });
      return new Response(j.body ?? '', { status: j.status ?? 200 });
    }
    return new Response('', { status: 404 });
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/wistia-poster — input validation', () => {
  it('rejects an invalid mediaId with 400', async () => {
    const res = await GET(makeRequest('not a valid id with spaces'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ url: null, error: 'Invalid mediaId' });
  });

  it('rejects a missing mediaId with 400', async () => {
    expect((await GET(makeRequest(null))).status).toBe(400);
  });
});

describe('GET /api/wistia-poster — oembed path (preferred)', () => {
  it('returns the oembed thumbnail_url with image_crop_resized upgraded to 1920x1080', async () => {
    stubFetch({
      oembed: {
        body: {
          thumbnail_url:
            'https://embed-ssl.wistia.com/deliveries/HASH.jpg?image_crop_resized=200x120',
        },
      },
    });
    const res = await GET(makeRequest(VALID_ID));
    const body = (await res.json()) as { url: string; source: string };
    expect(body.source).toBe('oembed');
    const u = new URL(body.url);
    expect(u.hostname).toBe('embed-ssl.wistia.com');
    expect(u.pathname).toBe('/deliveries/HASH.jpg');
    expect(u.searchParams.get('image_crop_resized')).toBe('1920x1080');
  });

  it('appends image_crop_resized when the original URL has no resize params', async () => {
    stubFetch({
      oembed: {
        body: { thumbnail_url: 'https://embed-fastly.wistia.com/deliveries/X.jpg' },
      },
    });
    const res = await GET(makeRequest(VALID_ID));
    const url = ((await res.json()) as { url: string }).url;
    expect(new URL(url).searchParams.get('image_crop_resized')).toBe('1920x1080');
  });

  it('strips image_resize in favour of image_crop_resized', async () => {
    stubFetch({
      oembed: {
        body: {
          thumbnail_url:
            'https://embed-ssl.wistia.com/deliveries/X.jpg?image_resize=200',
        },
      },
    });
    const url = ((await (await GET(makeRequest(VALID_ID))).json()) as { url: string }).url;
    const u = new URL(url);
    expect(u.searchParams.has('image_resize')).toBe(false);
    expect(u.searchParams.get('image_crop_resized')).toBe('1920x1080');
  });

  it('caches the response (1-day public + 1-week SWR)', async () => {
    stubFetch({
      oembed: { body: { thumbnail_url: 'https://example.com/x.jpg' } },
    });
    const res = await GET(makeRequest(VALID_ID));
    expect(res.headers.get('Cache-Control')).toContain('max-age=86400');
    expect(res.headers.get('Cache-Control')).toContain('stale-while-revalidate=604800');
  });
});

describe('GET /api/wistia-poster — jsonp fallback', () => {
  it('falls back to jsonp when oembed returns non-2xx and picks the largest still_image', async () => {
    const wistiaPayload = `Wistia.iframeInit(${JSON.stringify({
      media: {
        posterURL: 'https://example.com/fallback.jpg',
        assets: [
          { type: 'still_image', width: 200, url: 'https://wistia.cdn/small.jpg' },
          { type: 'still_image', width: 1280, url: 'https://wistia.cdn/big.jpg' },
          { type: 'video', width: 1920, url: 'https://wistia.cdn/video.mp4' },
        ],
      },
    })});`;
    stubFetch({
      oembed: { status: 404 },
      jsonp: { body: wistiaPayload },
    });
    const body = (await (await GET(makeRequest(VALID_ID))).json()) as {
      url: string;
      source: string;
    };
    expect(body.source).toBe('jsonp');
    expect(new URL(body.url).pathname).toBe('/big.jpg');
    expect(new URL(body.url).searchParams.get('image_crop_resized')).toBe('1920x1080');
  });

  it('falls back to media.posterURL when jsonp has no still_image assets', async () => {
    const wistiaPayload = `Wistia.iframeInit(${JSON.stringify({
      media: {
        posterURL: 'https://example.com/poster.jpg',
        assets: [{ type: 'video', width: 1920, url: 'https://wistia.cdn/video.mp4' }],
      },
    })});`;
    stubFetch({ oembed: { status: 500 }, jsonp: { body: wistiaPayload } });
    const url = ((await (await GET(makeRequest(VALID_ID))).json()) as { url: string }).url;
    expect(new URL(url).hostname).toBe('example.com');
  });
});

describe('GET /api/wistia-poster — graceful failure', () => {
  it('returns { url: null } when both oembed and jsonp fail', async () => {
    stubFetch({ oembed: { status: 500 }, jsonp: { status: 500 } });
    const res = await GET(makeRequest(VALID_ID));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: null });
  });

  it('returns { url: null } when fetch throws entirely', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network blew up'));
    const res = await GET(makeRequest(VALID_ID));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toBeNull();
  });

  it('returns { url: null } when both upstreams return garbage payloads', async () => {
    stubFetch({
      oembed: { body: 'not json' },
      jsonp: { body: 'not what we expected' },
    });
    const res = await GET(makeRequest(VALID_ID));
    expect((await res.json()).url).toBeNull();
  });
});
