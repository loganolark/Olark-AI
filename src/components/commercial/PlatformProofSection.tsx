'use client';

import React from 'react';
import Reveal from '@/components/ui/Reveal';

interface DashboardShot {
  /** Public path under /public/dashboards/. Swap when high-res exports land. */
  src: string;
  alt: string;
  caption: string;
}

const SHOTS: DashboardShot[] = [
  {
    src: '/dashboards/ai-analyst.png',
    alt: 'AI Analyst dashboard scoring how well Aiden is helping customers across security, integration readiness, and implementation timing.',
    caption:
      'AI Analyst — every conversation scored, topic-clustered, and ranked so you see what your buyers are actually asking.',
  },
  {
    src: '/dashboards/reports.png',
    alt: 'Aiden reporting dashboard showing chat volume, time spent, coverage, and lead capture.',
    caption:
      'Live reporting — chat volume, time-to-answer, coverage, and lead capture, broken out month over month.',
  },
  {
    src: '/dashboards/handoff.png',
    alt: 'Aiden handoff view: a chat being transferred from CoPilot to a human rep with full context summary.',
    caption:
      'Briefed handoff — when a real project shows up, the rep gets the full transcript, the captured specs, and the CRM record before they say hello.',
  },
];

/**
 * Proof-of-platform gallery — three real product shots from the Aiden
 * dashboards. Lives on the product page after the demo video so the visitor
 * can scroll past the marketing pitch into the actual product surface.
 *
 * Image source: pulled from the PDF brief pp. 12–13. Live exports will land
 * in /public/dashboards/ — until then the component renders an aspect-ratio
 * placeholder so the layout doesn't shift when the real assets arrive.
 */
export default function PlatformProofSection() {
  return (
    <section
      id="platform-proof"
      className="product-section"
      style={{ backgroundColor: 'var(--od-dark)' }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
            What&rsquo;s Inside
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              margin: '0 0 1rem',
            }}
          >
            See the Platform, Not Just the Pitch
          </h2>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--od-text)',
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            Three real surfaces from inside Aiden — what your team sees the day
            you go live, not a stock screenshot from a pitch deck.
          </p>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {SHOTS.map((shot, i) => (
            <Reveal
              key={shot.src}
              delay={i * 100}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--od-card)',
                border: '1px solid var(--od-border)',
                borderRadius: '14px',
                overflow: 'hidden',
              }}
            >
              <div
                data-testid="platform-shot-frame"
                style={{
                  position: 'relative',
                  aspectRatio: '16 / 10',
                  background: 'var(--od-dark)',
                  overflow: 'hidden',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    // Until high-res exports land, fall back to a labelled
                    // placeholder so the page renders cleanly in dev.
                    const el = e.currentTarget;
                    el.style.display = 'none';
                    const parent = el.parentElement;
                    if (parent && !parent.querySelector('[data-fallback]')) {
                      const span = document.createElement('span');
                      span.dataset.fallback = 'true';
                      span.style.cssText =
                        'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--od-muted);font-size:0.875rem;letter-spacing:0.05em;text-transform:uppercase;text-align:center;padding:1rem';
                      span.textContent = 'Dashboard image arriving';
                      parent.appendChild(span);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                  }}
                />
              </div>
              <p
                style={{
                  margin: 0,
                  padding: '1rem 1.25rem',
                  fontSize: '0.9375rem',
                  lineHeight: 1.55,
                  color: 'var(--od-text)',
                }}
              >
                {shot.caption}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
