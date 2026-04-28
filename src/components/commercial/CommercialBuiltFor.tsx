'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface WhoCard {
  icon: string;
  title: string;
  body: string;
}

const WHO_CARDS: WhoCard[] = [
  {
    icon: '🗺️',
    title: 'Regional Sales Teams',
    body: 'Organizations with multiple territories, departments, or routing rules that need clean delineation between them — without manual triage at every touchpoint.',
  },
  {
    icon: '🏆',
    title: 'High-Value, High-Consideration Products',
    body: 'Companies with long sales cycles and multiple stakeholder touchpoints, where every conversation needs to move a deal forward.',
  },
  {
    icon: '⚙️',
    title: 'Live Chat at Scale',
    body: 'Teams running live chat as a serious revenue channel who need every conversation to end in a pipeline action, not a dead end.',
  },
];

export default function CommercialBuiltFor() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { threshold: 0.2, once: true });
  const reduced = useReducedMotion();
  const animate = inView && !reduced;

  return (
    <section
      className="product-section"
      style={{
        backgroundColor: 'var(--od-navy)',
        borderTop: '1px solid var(--od-border)',
      }}
    >
      <div ref={ref} style={{ maxWidth: '1080px', margin: '0 auto' }}>
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
            Built For
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              margin: 0,
            }}
          >
            <span style={{ display: 'block' }}>
              This Is a Commercial Product.
            </span>{' '}
            <span style={{ display: 'block' }}>
              Here&rsquo;s Who We Built It For.
            </span>
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {WHO_CARDS.map((card, i) => {
            const delayMs = reduced ? 0 : i * 100;
            return (
              <article
                key={card.title}
                data-testid="commercial-who-card"
                style={{
                  background: 'var(--od-card)',
                  border: '1px solid var(--od-border)',
                  borderRadius: '16px',
                  padding: '1.75rem 1.5rem',
                  opacity: reduced || animate ? 1 : 0,
                  transform:
                    reduced || animate ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    fontSize: '2rem',
                    lineHeight: 1,
                    marginBottom: '0.875rem',
                  }}
                >
                  {card.icon}
                </span>
                <h3
                  style={{
                    margin: '0 0 0.5rem',
                    fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                    fontWeight: 700,
                    fontSize: '1.0625rem',
                    color: 'var(--od-white)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--od-muted)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                  }}
                >
                  {card.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
