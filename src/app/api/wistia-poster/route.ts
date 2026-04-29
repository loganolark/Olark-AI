import { NextResponse } from 'next/server';

/**
 * Server-side proxy that resolves a Wistia media ID to its high-resolution
 * poster URL.
 *
 * Why this exists: Wistia's public swatch endpoint
 * (https://fast.wistia.com/embed/medias/{mediaId}/swatch) returns an
 * intentionally tiny ~16x9 placeholder used by their player as a blur-up.
 * Hot-linking it for a thumbnail looks blurry. The full poster lives at the
 * asset-delivery URL referenced inside Wistia's JSONP metadata, which isn't
 * CORS-enabled for arbitrary origins — hence this server-side hop.
 *
 * Response shape: { url: string | null }
 *   url=null when the lookup fails (the client falls back to the swatch).
 *
 * Cached aggressively (1 day public) — Wistia poster URLs are stable.
 */

const MEDIA_ID_PATTERN = /^[a-z0-9]{8,16}$/i;

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

  try {
    const upstream = await fetch(
      `https://fast.wistia.com/embed/medias/${encodeURIComponent(mediaId)}.jsonp`,
      // Cache server-side per Next.js fetch — same media ID returns same payload.
      { next: { revalidate: 60 * 60 * 24 } },
    );
    if (!upstream.ok) {
      return NextResponse.json({ url: null }, { status: 200 });
    }
    const text = await upstream.text();
    const data = parseIframeInitPayload(text);
    if (!data) {
      return NextResponse.json({ url: null }, { status: 200 });
    }
    const poster = pickBestStillImage(data);
    return NextResponse.json(
      { url: poster ?? null },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      },
    );
  } catch {
    return NextResponse.json({ url: null }, { status: 200 });
  }
}
