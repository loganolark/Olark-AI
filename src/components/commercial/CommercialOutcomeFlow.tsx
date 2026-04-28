'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

type DotColor = 'gold' | 'pink' | 'teal';

interface FlowStep {
  icon: string;
  dotColor: DotColor;
  title: string;
  body: string;
}

const FLOW_STEPS: FlowStep[] = [
  {
    icon: '📧',
    dotColor: 'gold',
    title: 'A prospect clicks an email',
    body: 'Aiden recognizes the source and opens with a personalized greeting tied to that campaign.',
  },
  {
    icon: '🤖',
    dotColor: 'pink',
    title: 'The bot qualifies intent',
    body: 'Targeted questions determine whether this is a buying signal, a support need, or a research inquiry.',
  },
  {
    icon: '🔀',
    dotColor: 'pink',
    title: 'Smart routing kicks in',
    body: 'Department recognition and regional context connect the prospect to the right rep automatically.',
  },
  {
    icon: '🤝',
    dotColor: 'pink',
    title: 'The rep takes over, fully briefed',
    body: 'The rep joins a warm conversation with full context. No prep. No missed details. No awkward catch-up.',
  },
  {
    icon: '📊',
    dotColor: 'teal',
    title: 'The CRM updates itself',
    body: 'The record is complete before the rep even opens their dashboard.',
  },
];

const DOT_BG: Record<DotColor, string> = {
  gold: 'rgba(245,194,0,0.18)',
  pink: 'rgba(232,50,90,0.18)',
  teal: 'rgba(91,192,190,0.2)',
};

const DOT_BORDER: Record<DotColor, string> = {
  gold: '1px solid rgba(245,194,0,0.45)',
  pink: '1px solid rgba(232,50,90,0.45)',
  teal: '1px solid rgba(91,192,190,0.5)',
};

const SUMMARY_BULLETS = [
  'No missed context at handoff, ever',
  'No dead ends for customers mid-conversation',
  'No CRM gaps from manual entry failures',
  'Faster speed-to-lead',
  'Reps spend more time closing, less time context-switching',
  'Every conversation ends in a pipeline action',
];

export default function CommercialOutcomeFlow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { threshold: 0.2, once: true });
  const reduced = useReducedMotion();
  const animate = inView && !reduced;
  const summaryDelayMs = reduced ? 0 : FLOW_STEPS.length * 200 + 200;

  return (
    <section
      className="product-section"
      style={{ backgroundColor: 'var(--od-navy)' }}
    >
      <div ref={ref} style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
            The Outcome
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              margin: '0 0 1.25rem',
            }}
          >
            What This Looks Like in Practice
          </h2>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--od-text)',
              margin: 0,
            }}
          >
            One prospect. One interaction. A fully automated path from first
            click to pipeline entry.
          </p>
        </div>

        <ol
          role="list"
          style={{
            listStyle: 'none',
            margin: '0 0 2rem',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {FLOW_STEPS.map((step, i) => {
            const delayMs = reduced ? 0 : i * 200;
            const isLast = i === FLOW_STEPS.length - 1;
            return (
              <li
                key={step.title}
                data-testid="commercial-flow-step"
                style={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  opacity: reduced || animate ? 1 : 0,
                  transform:
                    reduced || animate ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: DOT_BG[step.dotColor],
                      border: DOT_BORDER[step.dotColor],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      lineHeight: 1,
                    }}
                    aria-hidden="true"
                  >
                    {step.icon}
                  </div>
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '56px',
                        bottom: '-1.25rem',
                        width: '2px',
                        marginLeft: '-1px',
                        background:
                          'linear-gradient(to bottom, rgba(245,194,0,0.3), rgba(232,50,90,0.3))',
                      }}
                    />
                  )}
                </div>
                <div style={{ paddingTop: '0.5rem' }}>
                  <h3
                    style={{
                      margin: '0 0 0.375rem',
                      fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                      fontWeight: 700,
                      fontSize: '1.0625rem',
                      color: 'var(--od-white)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--od-muted)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div
          data-testid="commercial-outcome-summary"
          style={{
            background: 'var(--od-card)',
            border: '1px solid var(--od-border)',
            borderLeft: '3px solid var(--od-gold)',
            borderRadius: '0.75rem',
            padding: '1.75rem 1.75rem 1.5rem',
            opacity: reduced || animate ? 1 : 0,
            transform:
              reduced || animate ? 'translateY(0)' : 'translateY(8px)',
            transition: `opacity 500ms cubic-bezier(0.16,1,0.3,1) ${summaryDelayMs}ms, transform 500ms cubic-bezier(0.16,1,0.3,1) ${summaryDelayMs}ms`,
          }}
        >
          <h3
            style={{
              margin: '0 0 1rem',
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 800,
              fontSize: '1.125rem',
              color: 'var(--od-white)',
              letterSpacing: '-0.01em',
            }}
          >
            SDR Prep Is Nearly Eliminated.
          </h3>
          <ul
            role="list"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
            }}
          >
            {SUMMARY_BULLETS.map((b) => (
              <li
                key={b}
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
                    color: 'var(--od-gold)',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '0.0625rem',
                  }}
                >
                  ✓
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
