'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';

const ROUTING_BUBBLES = [
  {
    side: 'left' as const,
    speaker: 'Customer',
    text: 'Hi! I have a few questions before I buy.',
  },
  {
    side: 'right' as const,
    speaker: 'Aiden',
    text: 'Of course — what can I help with?',
    buttons: [
      { label: 'Talk to Sales', variant: 'pink' as const },
      { label: 'Get Support', variant: 'default' as const },
      { label: 'Product Details', variant: 'default' as const },
    ],
  },
  {
    side: 'right' as const,
    speaker: 'Aiden',
    text: 'Great — connecting you with our sales team now.',
  },
];

export default function RoutingVisual() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      data-testid="routing-visual"
      data-in-view={inView ? 'true' : 'false'}
      style={{
        background: 'rgba(15,13,46,0.4)',
        border: '1px solid var(--od-border)',
        borderRadius: '14px',
        padding: '1.5rem',
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {ROUTING_BUBBLES.map((bubble, i) => (
        <div
          key={i}
          className="routing-bubble-wrap"
          data-bubble-index={i}
          style={{
            display: 'flex',
            justifyContent: bubble.side === 'left' ? 'flex-start' : 'flex-end',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(8px)',
            transition: `opacity 400ms ease ${i * 350}ms, transform 400ms ease ${i * 350}ms`,
          }}
        >
          <div
            style={{
              maxWidth: '80%',
              background:
                bubble.side === 'left'
                  ? 'var(--od-card)'
                  : 'rgba(245,194,0,0.12)',
              border:
                bubble.side === 'left'
                  ? '1px solid var(--od-border)'
                  : '1px solid rgba(245,194,0,0.3)',
              padding: '0.625rem 0.875rem',
              borderRadius:
                bubble.side === 'left'
                  ? '12px 12px 12px 2px'
                  : '12px 12px 2px 12px',
              fontSize: '0.875rem',
              color: 'var(--od-text)',
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                fontSize: '0.6875rem',
                color: 'var(--od-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '0.25rem',
              }}
            >
              {bubble.speaker}
            </div>
            <div>{bubble.text}</div>
            {bubble.buttons && (
              <div
                style={{
                  marginTop: '0.625rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.375rem',
                }}
              >
                {bubble.buttons.map((b) => (
                  <span
                    key={b.label}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: '100px',
                      padding: '0.25rem 0.625rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background:
                        b.variant === 'pink'
                          ? 'rgba(232,50,90,0.18)'
                          : 'rgba(120,115,220,0.18)',
                      border:
                        b.variant === 'pink'
                          ? '1px solid rgba(232,50,90,0.4)'
                          : '1px solid var(--od-border)',
                      color:
                        b.variant === 'pink'
                          ? 'var(--od-pink)'
                          : 'var(--od-text)',
                    }}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
