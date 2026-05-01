'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface Stat {
  value: string;
  label: string;
  sublabel: string;
  /** Visual treatment — controls accent color of the value text. */
  variant: 'pink' | 'green' | 'gold' | 'navy';
}

// Numbers are taken verbatim from the brief mockup (PDF p. 3 / HTML).
// The "$0" tile is intentionally cheeky — paired with the "(probably)"
// caveat — and earns the section's tone.
const STATS: Stat[] = [
  {
    value: '+62%',
    label: 'RFQ volume',
    sublabel: 'after 90 days',
    variant: 'pink',
  },
  {
    value: '11 hrs',
    label: 'saved per rep',
    sublabel: 'per week',
    variant: 'green',
  },
  {
    value: '2.4 sec',
    label: 'average reply',
    sublabel: 'vs. 4hr industry avg',
    variant: 'gold',
  },
  {
    value: '$0',
    label: 'leads lost to "did anyone email back?"',
    sublabel: '(probably)',
    variant: 'navy',
  },
];

const VARIANT_BG: Record<Stat['variant'], string> = {
  pink: 'rgba(239, 78, 115, 0.10)',
  green: 'rgba(111, 194, 132, 0.12)',
  gold: 'rgba(250, 201, 23, 0.12)',
  navy: 'rgba(39, 45, 63, 0.65)',
};

const VARIANT_BORDER: Record<Stat['variant'], string> = {
  pink: 'rgba(239, 78, 115, 0.35)',
  green: 'rgba(111, 194, 132, 0.35)',
  gold: 'rgba(250, 201, 23, 0.35)',
  navy: 'rgba(160, 157, 216, 0.35)',
};

const VARIANT_VALUE: Record<Stat['variant'], string> = {
  pink: 'var(--od-white)',
  green: 'var(--od-white)',
  gold: 'var(--od-white)',
  navy: 'var(--od-gold)',
};

/**
 * "Why it matters" stats panel — the 4-tile band that lives on the
 * homepage right under the hero. Numbers from the brief mockup.
 *
 * The fourth tile ("$0 leads lost to 'did anyone email back?' (probably)")
 * is the emotional payload. Industrial sales teams know exactly what it
 * means; the "(probably)" disarms anyone tempted to pull out a stopwatch.
 */
export default function WhyItMattersStatsPanel() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { threshold: 0.2, once: true });
  const reduced = useReducedMotion();
  const animate = inView && !reduced;

  return (
    <section
      style={{
        backgroundColor: 'var(--od-dark)',
        padding: '4rem 1.5rem',
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: '2.5rem',
          alignItems: 'center',
        }}
        className="why-it-matters-grid"
      >
        <div>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--od-pink)',
              margin: '0 0 1rem',
            }}
          >
            Why It Matters
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              margin: '0 0 1rem',
            }}
          >
            We Remove the Cruft. Your Team Gets the Chats That Matter.
          </h2>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'var(--od-text)',
              margin: 0,
            }}
          >
            Sales and marketing don&rsquo;t need <em>more</em> chats. They
            need <em>better</em> ones. Aiden filters the repetitive stuff,
            answers the spec questions instantly, and feeds warm vetted
            leads into the systems your team already uses.
          </p>
        </div>

        <ul
          role="list"
          aria-label="Outcome metrics"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.875rem',
          }}
        >
          {STATS.map((s, i) => {
            const delayMs = reduced ? 0 : i * 90;
            return (
              <li
                key={s.value}
                data-testid="why-it-matters-stat"
                style={{
                  background: VARIANT_BG[s.variant],
                  border: `1px solid ${VARIANT_BORDER[s.variant]}`,
                  borderRadius: '14px',
                  padding: '1.25rem 1.25rem',
                  opacity: reduced || animate ? 1 : 0,
                  transform:
                    reduced || animate ? 'translateY(0)' : 'translateY(6px)',
                  transition: `opacity 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                    fontWeight: 900,
                    fontSize: 'clamp(1.625rem, 3.5vw, 2.125rem)',
                    letterSpacing: '-0.025em',
                    lineHeight: 1.1,
                    color: VARIANT_VALUE[s.variant],
                    margin: 0,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'var(--od-text)',
                    fontWeight: 600,
                    lineHeight: 1.35,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--od-muted)',
                    marginTop: '0.125rem',
                    lineHeight: 1.35,
                  }}
                >
                  {s.sublabel}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
