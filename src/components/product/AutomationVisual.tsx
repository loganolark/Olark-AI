'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';

type BadgeVariant = 'gold' | 'pink' | 'muted';

interface Row {
  label: string;
  sub: string;
  badge: string;
  variant: BadgeVariant;
}

const ROWS: Row[] = [
  {
    label: 'FAQ Responses',
    sub: 'Answered directly from your knowledge base',
    badge: 'Automated',
    variant: 'gold',
  },
  {
    label: 'Pricing & Plans',
    sub: 'Always current, always consistent',
    badge: 'Automated',
    variant: 'gold',
  },
  {
    label: 'Order & Account Lookups',
    sub: 'Self-serve, no agent needed',
    badge: 'Hours Saved',
    variant: 'pink',
  },
  {
    label: 'Support Backlog',
    sub: 'Tickets that should never have been tickets',
    badge: 'Eliminated',
    variant: 'muted',
  },
];

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  gold: {
    background: 'rgba(250, 201, 23,0.15)',
    border: '1px solid rgba(250, 201, 23,0.4)',
    color: 'var(--od-gold)',
  },
  pink: {
    background: 'rgba(239, 78, 115,0.15)',
    border: '1px solid rgba(239, 78, 115,0.4)',
    color: 'var(--od-pink)',
  },
  muted: {
    background: 'rgba(160,157,216,0.12)',
    border: '1px solid rgba(160,157,216,0.3)',
    color: 'var(--od-muted)',
  },
};

const SUMMARY_DELAY_MS = 4 * 200 + 250;

export default function AutomationVisual() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      data-testid="automation-visual"
      data-in-view={inView ? 'true' : 'false'}
      style={{
        background: 'rgba(39, 45, 63,0.4)',
        border: '1px solid var(--od-border)',
        borderRadius: '14px',
        padding: '1.5rem',
        minHeight: '320px',
      }}
    >
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}
      >
        {ROWS.map((row, i) => (
          <li
            key={row.label}
            data-row-label={row.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 0.875rem',
              background: 'rgba(74, 67, 153,0.35)',
              border: '1px solid rgba(103, 90, 201,0.25)',
              borderRadius: '10px',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(6px)',
              transition: `opacity 400ms ease ${i * 200}ms, transform 400ms ease ${i * 200}ms`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: 'var(--od-white)',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  marginBottom: '0.125rem',
                }}
              >
                {row.label}
              </div>
              <div style={{ color: 'var(--od-muted)', fontSize: '0.8125rem' }}>
                {row.sub}
              </div>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '100px',
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                ...BADGE_STYLES[row.variant],
              }}
            >
              {row.badge}
            </span>
          </li>
        ))}
      </ul>
      <div
        data-testid="automation-summary"
        style={{
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          color: 'var(--od-text)',
          fontSize: '0.875rem',
          lineHeight: 1.55,
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(6px)',
          transition: `opacity 500ms ease ${SUMMARY_DELAY_MS}ms, transform 500ms ease ${SUMMARY_DELAY_MS}ms`,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          style={{ stroke: 'var(--od-gold)', strokeWidth: 2, flexShrink: 0, marginTop: '0.125rem' }}
        >
          <circle cx="8" cy="8" r="6.5" />
          <line x1="8" y1="5" x2="8" y2="8.5" />
          <circle cx="8" cy="11" r="0.75" fill="var(--od-gold)" />
        </svg>
        <span>
          Your team handles{' '}
          <strong style={{ color: 'var(--od-white)' }}>
            complex, high-value conversations
          </strong>{' '}
          while Aiden handles the rest, 24/7.
        </span>
      </div>
    </div>
  );
}
