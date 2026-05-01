import React from 'react';

interface HeroStat {
  value: string;
  label: string;
}

const STATS: HeroStat[] = [
  { value: '4.2×', label: 'more qualified RFQs' },
  { value: '< 2 sec', label: 'median first response' },
  { value: '87%', label: 'questions resolved without a human' },
];

/**
 * Three headline stats displayed under the hero CTAs — the at-a-glance
 * proof points from the brief mockup. Lives inside the SectionHero
 * `children` slot on the homepage so it shares the hero's centred layout
 * and the gradient background. Numbers are static for now; an eventual
 * count-up animation would slot in via a useInView + requestAnimationFrame
 * pattern without changing this component's API.
 */
export default function HeroStatsRow() {
  return (
    <ul
      role="list"
      aria-label="Aiden outcomes at a glance"
      data-testid="hero-stats-row"
      style={{
        listStyle: 'none',
        margin: '1rem 0 0',
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 'clamp(1rem, 4vw, 2.5rem)',
        textAlign: 'center',
        maxWidth: '640px',
        marginInline: 'auto',
        width: '100%',
      }}
    >
      {STATS.map((s) => (
        <li key={s.label}>
          <div
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 800,
              fontSize: 'clamp(1.5rem, 3.5vw, 2.125rem)',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: 'var(--od-gold)',
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              marginTop: '0.375rem',
              fontSize: '0.8125rem',
              lineHeight: 1.4,
              color: 'var(--od-muted)',
              fontWeight: 500,
            }}
          >
            {s.label}
          </div>
        </li>
      ))}
    </ul>
  );
}
