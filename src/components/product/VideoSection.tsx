import React from 'react';
import VideoEmbedThumbnail from './VideoEmbedThumbnail';
import type { VideoLightboxPage } from '@/components/ui/VideoLightbox';

export interface VideoChecklistItem {
  title: string;
  body: string;
}

export interface VideoSectionProps {
  label: string;
  title: string;
  intro: string;
  mediaId: string;
  page: VideoLightboxPage;
  variant?: 'split' | 'solo';
  checklist?: VideoChecklistItem[];
  /** Visual style for checklist items: 'check' (gold checkmark) or 'chat' (chat bubble) */
  checklistStyle?: 'check' | 'chat';
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{ stroke: 'var(--od-gold)', strokeWidth: 2.4, flexShrink: 0 }}
    >
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}

export default function VideoSection({
  label,
  title,
  intro,
  mediaId,
  page,
  variant = 'split',
  checklist,
  checklistStyle = 'check',
}: VideoSectionProps) {
  const copy = (
    <div>
      <p
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: 'var(--od-gold)',
          margin: '0 0 1rem',
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
          fontWeight: 900,
          fontSize: 'clamp(1.625rem, 4vw, 2.25rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: 'var(--od-white)',
          margin: '0 0 1.25rem',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: '1rem',
          lineHeight: 1.7,
          color: 'var(--od-text)',
          margin: 0,
        }}
      >
        {intro}
      </p>

      {checklist && checklist.length > 0 && (
        <ul
          data-testid="video-section-checklist"
          data-checklist-style={checklistStyle}
          style={{
            listStyle: 'none',
            margin: '1.5rem 0 0',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
          }}
        >
          {checklist.map((item) => (
            <li
              key={item.title}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                color: 'var(--od-text)',
                fontSize: '0.9375rem',
                lineHeight: 1.55,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  flex: '0 0 24px',
                  borderRadius: '50%',
                  background:
                    checklistStyle === 'chat'
                      ? 'rgba(232,50,90,0.18)'
                      : 'rgba(245,194,0,0.15)',
                  border:
                    checklistStyle === 'chat'
                      ? '1px solid rgba(232,50,90,0.4)'
                      : '1px solid rgba(245,194,0,0.4)',
                  marginTop: '0.125rem',
                }}
              >
                {checklistStyle === 'chat' ? (
                  <span style={{ color: 'var(--od-pink)', fontSize: '0.75rem' }}>💬</span>
                ) : (
                  <CheckIcon />
                )}
              </span>
              <span>
                <strong style={{ color: 'var(--od-white)', fontWeight: 600 }}>
                  {item.title}
                </strong>{' '}
                <span style={{ color: 'var(--od-text)' }}>{item.body}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const thumbnail = (
    <VideoEmbedThumbnail mediaId={mediaId} title={title} page={page} />
  );

  if (variant === 'solo') {
    return (
      <section
        className="product-section"
        data-testid="video-section"
        data-variant="solo"
        style={{ backgroundColor: 'var(--od-dark)' }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--od-gold)',
              margin: '0 0 1rem',
            }}
          >
            {label}
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.625rem, 4vw, 2.25rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              margin: '0 0 1rem',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--od-text)',
              margin: '0 auto 2rem',
              maxWidth: '640px',
            }}
          >
            {intro}
          </p>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>{thumbnail}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="product-section"
      data-testid="video-section"
      data-variant="split"
      style={{ backgroundColor: 'var(--od-dark)' }}
    >
      <div className="fs-grid" style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {copy}
        {thumbnail}
      </div>
    </section>
  );
}
