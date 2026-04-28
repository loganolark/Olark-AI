import React from 'react';
import PillBadge from '@/components/ui/PillBadge';
import Reveal from '@/components/ui/Reveal';

const PROMISES: string[] = [
  'Free live onboarding included with every Essentials plan',
  'Ongoing support from the Olark team, not a ticket queue',
  'Simple enough to train and manage without a developer',
  'No engineering resources required at any stage',
  'Go live the same day you get access',
];

export interface SupportPromiseProps {
  headline?: string;
}

export default function SupportPromise({
  headline = 'You’re Never on Your Own',
}: SupportPromiseProps) {
  return (
    <section
      id="support-promise"
      className="product-section"
      style={{
        backgroundColor: 'var(--od-dark)',
        borderTop: '1px solid var(--od-border)',
      }}
    >
      <Reveal style={{ maxWidth: '720px', margin: '0 auto' }} threshold={0.15}>
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'var(--od-gold)',
            textAlign: 'center',
            margin: '0 0 1rem',
          }}
        >
          We&rsquo;ve Got You
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
            fontWeight: 900,
            fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--od-white)',
            textAlign: 'center',
            margin: '0 0 1.25rem',
          }}
        >
          {headline}
        </h2>
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--od-text)',
            textAlign: 'center',
            margin: '0 auto 1rem',
          }}
        >
          Getting started with AI should not feel like a solo expedition into the unknown. Every Aiden Essentials plan
          comes with the live support you need to go live fast and keep it that way.
        </p>
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--od-text)',
            textAlign: 'center',
            margin: '0 auto 2.5rem',
          }}
        >
          Whether you are a team of two or a growing business, Aiden is designed so that anyone can deploy it, train it,
          and see results without ever filing a support ticket.
        </p>

        <div
          style={{
            backgroundColor: 'var(--od-card)',
            border: '1px solid var(--od-border)',
            borderRadius: '0.75rem',
            padding: '2rem 1.75rem',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <PillBadge variant="gold">Support That Comes Standard</PillBadge>
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {PROMISES.map((p) => (
              <li
                key={p}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  color: 'var(--od-text)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  style={{
                    stroke: 'var(--od-gold)',
                    strokeWidth: 2,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    flexShrink: 0,
                    marginTop: '0.3125rem',
                  }}
                >
                  <polyline points="3,7.5 6,10 11,4.5" />
                </svg>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
