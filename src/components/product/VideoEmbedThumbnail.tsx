'use client';

import React from 'react';
import { useVideoLightbox, type VideoLightboxPage } from '@/components/ui/VideoLightbox';
import { useWistiaPoster } from '@/lib/hooks/use-wistia-poster';

export interface VideoEmbedThumbnailProps {
  mediaId: string;
  title: string;
  page: VideoLightboxPage;
  aspect?: number;
}

function PlayIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ stroke: 'var(--od-dark)', fill: 'var(--od-dark)' }}
    >
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

export default function VideoEmbedThumbnail({
  mediaId,
  title,
  page,
  aspect = 16 / 9,
}: VideoEmbedThumbnailProps) {
  const { open } = useVideoLightbox();
  // Wistia's `/swatch` endpoint returns a tiny ~16x9 placeholder by design
  // (used as a blur-up by their player). It looks blurry at full thumbnail
  // size, so we resolve the actual poster URL via /api/wistia-poster and
  // swap to it once it loads. Swatch stays as the instant low-res fallback
  // so the box never renders empty.
  const swatchUrl = `https://fast.wistia.com/embed/medias/${mediaId}/swatch`;
  const posterUrl = useWistiaPoster(mediaId);
  const imageSrc = posterUrl ?? swatchUrl;

  return (
    <button
      type="button"
      data-testid="video-embed-thumbnail"
      data-media-id={mediaId}
      onClick={() => open(mediaId, { page, title })}
      aria-label={`Play video: ${title}`}
      className="video-embed-thumb"
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        aspectRatio: String(aspect),
        background: 'var(--od-card)',
        border: '1px solid var(--od-border)',
        borderRadius: '14px',
        overflow: 'hidden',
        padding: 0,
        cursor: 'pointer',
        boxShadow: '0 0 40px rgba(245,194,0,0.18)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        // Force a remount when posterUrl resolves so the browser fetches the
        // higher-res image without inheriting the cached low-res render.
        key={imageSrc}
        src={imageSrc}
        data-poster-source={posterUrl ? 'high-res' : 'swatch'}
        alt=""
        loading="lazy"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 250ms ease-out',
        }}
      />
      <span
        aria-hidden="true"
        className="video-play-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(15,13,46,0.18)',
          transition: 'background-color 200ms ease',
        }}
      >
        <span
          className="video-play-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            minWidth: '44px',
            minHeight: '44px',
            borderRadius: '50%',
            background: 'var(--od-gold)',
            paddingLeft: '4px',
            boxShadow: '0 0 24px rgba(245,194,0,0.5)',
            transition: 'transform 200ms ease',
          }}
        >
          <PlayIcon />
        </span>
      </span>
    </button>
  );
}
