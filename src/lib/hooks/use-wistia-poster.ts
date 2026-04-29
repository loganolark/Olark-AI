'use client';

import { useEffect, useState } from 'react';

/**
 * Module-level cache so repeated mounts of <VideoEmbedThumbnail /> for the
 * same media ID don't re-hit /api/wistia-poster. Maps mediaId → resolved URL
 * (or null if the lookup failed). `undefined` means "not fetched yet".
 */
const POSTER_CACHE = new Map<string, string | null>();

/** Track in-flight requests so concurrent thumbnails for the same media ID
 *  share a single network round-trip. */
const INFLIGHT = new Map<string, Promise<string | null>>();

async function fetchPoster(mediaId: string): Promise<string | null> {
  if (POSTER_CACHE.has(mediaId)) {
    return POSTER_CACHE.get(mediaId) ?? null;
  }
  const existing = INFLIGHT.get(mediaId);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const res = await fetch(`/api/wistia-poster?mediaId=${encodeURIComponent(mediaId)}`);
      if (!res.ok) {
        POSTER_CACHE.set(mediaId, null);
        return null;
      }
      const data = (await res.json()) as { url?: string | null };
      const url = typeof data.url === 'string' && data.url.length > 0 ? data.url : null;
      POSTER_CACHE.set(mediaId, url);
      return url;
    } catch {
      POSTER_CACHE.set(mediaId, null);
      return null;
    } finally {
      INFLIGHT.delete(mediaId);
    }
  })();

  INFLIGHT.set(mediaId, promise);
  return promise;
}

/**
 * Returns the high-resolution Wistia poster URL for a given media ID, or null
 * while it's still loading / if the lookup failed.
 *
 * Callers should fall back to the swatch URL in the meantime so the thumbnail
 * box never renders empty.
 */
export function useWistiaPoster(mediaId: string): string | null {
  const [url, setUrl] = useState<string | null>(() => POSTER_CACHE.get(mediaId) ?? null);

  useEffect(() => {
    let cancelled = false;
    if (POSTER_CACHE.has(mediaId)) {
      setUrl(POSTER_CACHE.get(mediaId) ?? null);
      return undefined;
    }
    fetchPoster(mediaId).then((resolved) => {
      if (cancelled) return;
      setUrl(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [mediaId]);

  return url;
}
