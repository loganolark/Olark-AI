'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface Signal {
  icon: string;
  title: string;
  body: string;
  tag: string;
}

const SIGNALS: Signal[] = [
  {
    icon: '🕐',
    title: 'Pre-Chat CRM Lookup',
    body: "Time lost to manual data look-up before every chat, and that's assuming the rep can find it at all.",
    tag: 'Time Lost',
  },
  {
    icon: '🔀',
    title: 'Routing to the Right Rep',
    body: 'Misrouted conversations burn time on both sides and create dead ends for prospects who just wanted a quick answer.',
    tag: 'Misdirected',
  },
  {
    icon: '📭',
    title: 'Missing Context at Handoff',
    body: 'Most live chat treats every visitor the same. Your reps start every single conversation from zero.',
    tag: 'Zero Context',
  },
];

export default function CommercialProblemSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { threshold: 0.3, once: true });
  const reduced = useReducedMotion();
  const animate = inView && !reduced;
  const summaryDelayMs = reduced ? 0 : SIGNALS.length * 150 + 100;

  return (
    <section
      className="product-section"
      style={{ backgroundColor: 'var(--od-dark)' }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <blockquote
          data-testid="commercial-problem-quote"
          style={{
            margin: '0 0 2.5rem',
            padding: 0,
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
            fontWeight: 700,
            fontSize: 'clamp(1.25rem, 3.2vw, 1.75rem)',
            lineHeight: 1.45,
            color: 'var(--od-white)',
            letterSpacing: '-0.01em',
          }}
        >
          How much of your team&rsquo;s day is spent on work that happens{' '}
          <em style={{ fontStyle: 'italic' }}>before</em>{' '}
          the actual sales conversation?
        </blockquote>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'left',
          }}
        >
          {SIGNALS.map((s, i) => {
            const delayMs = reduced ? 0 : i * 150;
            return (
              <div
                key={s.title}
                data-testid="commercial-problem-signal"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  background: 'var(--od-card)',
                  border: '1px solid var(--od-border)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  opacity: reduced || animate ? 1 : 0,
                  transform:
                    reduced || animate ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: '1.5rem',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      margin: '0 0 0.375rem',
                      fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--od-white)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--od-muted)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {s.body}
                  </p>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '100px',
                    padding: '0.25rem 0.625rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(232,50,90,0.12)',
                    border: '1px solid rgba(232,50,90,0.4)',
                    color: 'var(--od-pink)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.tag}
                </span>
              </div>
            );
          })}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 0.25rem 0',
              color: 'var(--od-text)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              opacity: reduced || animate ? 1 : 0,
              transform:
                reduced || animate ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity 400ms cubic-bezier(0.16,1,0.3,1) ${summaryDelayMs}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${summaryDelayMs}ms`,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              aria-hidden="true"
              style={{
                stroke: 'var(--od-pink)',
                strokeWidth: 2,
                flexShrink: 0,
              }}
            >
              <circle cx="7.5" cy="7.5" r="6" />
              <line x1="7.5" y1="4.5" x2="7.5" y2="8" />
              <circle cx="7.5" cy="10" r="0.75" fill="var(--od-pink)" />
            </svg>
            <span>3 friction points before the rep says a single word.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
