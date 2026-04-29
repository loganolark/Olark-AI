import { NextResponse } from 'next/server';

/**
 * Server-side proxy that resolves a Wistia media ID to its high-resolution
 * poster URL.
 *
 * Why this exists: Wistia's public /swatch endpoint returns an intentionally
 * tiny ~16x9 placeholder. Hot-linking it for a thumbnail looks blurry. The
 * full poster lives at an asset-delivery URL referenced in Wistia's metadata,
 * which isn't CORS-enabled for arbitrary origins — hence this server-side
 * hop.
 *
 * Resolution strategy (first wins):
 *   1. oembed JSON — returns `thumbnail_url` keyed off the documented public
 *      endpoint. We then upgrade that URL's image_crop_resized param to
 *      1920x1080 so the CDN serves a retina-ready thumbnail.
 *   2. jsonp metadata fallback — if oembed fails, parse the
 *      Wistia.iframeInit(...) wrapper and pick the largest still_image asset
 *      (or media.posterURL).
 *
 * Response shape: { url: string | null, source?: 'oembed' | 'jsonp' }
 *   url=null when both lookups fail (the client falls back to the swatch).
 *
 * Cached aggressively (1 day public) — Wistia poster URLs are stable.
 */

const MEDIA_ID_PATTERN = /^[a-z0-9]{8,16}$/i;
const TARGET_RESIZE = '1920x1080';

interface WistiaIframeInit {
  media?: {
    posterURL?: string;
    assets?: Array<{
      type?: string;
      width?: number;
      url?: string;
    }>;
  };
}

function pickBestStillImage(data: WistiaIframeInit): string | null {
  const assets = data.media?.assets ?? [];
  const stills = assets.filter((a) => a.type === 'still_image' && typeof a.url === 'string');
  if (stills.length > 0) {
    // Largest width wins.
    const largest = stills.reduce((best, cur) => {
      const bestWidth = best.width ?? 0;
      const curWidth = cur.width ?? 0;
      return curWidth > bestWidth ? cur : best;
    });
    if (typeof largest.url === 'string') return largest.url;
  }
  return data.media?.posterURL ?? null;
}

/**
 * Wistia's image CDN resizes on-demand via `image_crop_resized=WxH`. Force the
 * URL to ask for a 1920x1080 render so the browser receives a sharp asset
 * regardless of the original poster size or what params upstream included.
 *
 * Also strips conflicting params (image_resize, image_crop_resized) that
 * could narrow the output below our target.
 */
function upgradePosterResolution(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    u.searchParams.delete('image_crop_resized');
    u.searchParams.delete('image_resize');
    u.searchParams.set('image_crop_resized', TARGET_RESIZE);
    return u.toString();
  } catch {
    return rawUrl;
  }
}

function parseIframeInitPayload(text: string): WistiaIframeInit | null {
  // Wistia returns JS like: Wistia.iframeInit({...JSON...});
  // Extract the first parenthesised group anchored on the trailing `);`.
  // [\s\S] is used in place of `.` so we match across newlines without
  // depending on the `s` (dotall) flag, which the TS target predates.
  const match = text.match(/Wistia\.iframeInit\(([\s\S]+)\);?\s*$/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as WistiaIframeInit;
  } catch {
    return null;
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const mediaId = url.searchParams.get('mediaId');

  if (!mediaId || !MEDIA_ID_PATTERN.test(mediaId)) {
    return NextResponse.json(
      { url: null, error: 'Invalid mediaId' },
      { status: 400 },
    );
  }

  // 1) Preferred path: Wistia oembed JSON. Documented, stable, returns
  //    thumbnail_url directly.
  const oembedUrl = await tryOembed(mediaId);
  if (oembedUrl) {
    return jsonOk({ url: upgradePosterResolution(oembedUrl), source: 'oembed' });
  }

  // 2) Fallback: parse the JSONP metadata wrapper.
  const jsonpUrl = await tryJsonp(mediaId);
  if (jsonpUrl) {
    return jsonOk({ url: upgradePosterResolution(jsonpUrl), source: 'jsonp' });
  }

  return jsonOk({ url: null });
}

function jsonOk(body: { url: string | null; source?: 'oembed' | 'jsonp' }): NextResponse {
  return NextResponse.json(body, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}

async function tryOembed(mediaId: string): Promise<string | null> {
  try {
    const target = `https://fast.wistia.com/oembed?url=${encodeURIComponent(
      `https://home.wistia.com/medias/${mediaId}`,
    )}&format=json`;
    const res = await fetch(target, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail_url?: unknown };
    if (typeof data.thumbnail_url === 'string' && data.thumbnail_url.length > 0) {
      return data.thumbnail_url;
    }
    return null;
  } catch {
    return null;
  }
}

async function tryJsonp(mediaId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://fast.wistia.com/embed/medias/${encodeURIComponent(mediaId)}.jsonp`,
      { next: { revalidate: 60 * 60 * 24 } },
    );
    if (!res.ok) return null;
    const text = await res.text();
    const data = parseIframeInitPayload(text);
    if (!data) return null;
    return pickBestStillImage(data);
  } catch {
    return null;
  }
}
