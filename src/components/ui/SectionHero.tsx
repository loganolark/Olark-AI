import React from 'react';
import Reveal from './Reveal';

export interface SectionHeroProps {
  /** Optional badge/pill above the headline — e.g. <PillBadge variant="gold" pulse>...</PillBadge> */
  badge?: React.ReactNode;
  /** Main headline — rendered as <h1>. Poppins weight 900, clamp(2.5rem, 5vw, 4rem) */
  headline: string;
  /** Subhead — DM Sans weight 300, color: var(--od-text) */
  subhead?: string;
  /** Slot for CTAButton(s) — rendered below the subhead */
  cta?: React.ReactNode;
  /** Slot for embedded widgets (e.g. URLDemoWidget in Epic 3) — rendered below CTA */
  children?: React.ReactNode;
  /** Override section id — useful for skip-link anchors */
  id?: string;
  /** Optional decorative layer (e.g. <ParticleBackground />) rendered absolute
   *  behind the hero content. Only used by the homepage today. */
  backgroundEffect?: React.ReactNode;
}

export default function SectionHero({
  badge,
  headline,
  subhead,
  cta,
  children,
  id,
  backgroundEffect,
}: SectionHeroProps) {
  return (
    <section
      id={id}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: [
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(61,54,131,0.4) 0%, transparent 70%)',
          'var(--od-dark)',
        ].join(', '),
        paddingTop: '128px',
        paddingBottom: '80px',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        textAlign: 'center',
      }}
    >
      {backgroundEffect}
      <Reveal
        threshold={0.05}
        offset={16}
        duration={600}
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {badge && (
          <div style={{ marginBottom: '0.75rem' }}>
            {badge}
          </div>
        )}

        <h1
          style={{
            fontFamily: 'var(--font-poppins), ui-sans-serif, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--od-white)',
            margin: 0,
          }}
        >
          {headline}
        </h1>

        {subhead && (
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), ui-sans-serif, sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(1.0625rem, 2.5vw, 1.25rem)',
              lineHeight: 1.6,
              color: 'var(--od-text)',
              margin: 0,
              maxWidth: '640px',
            }}
          >
            {subhead}
          </p>
        )}

        {cta && (
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {cta}
          </div>
        )}

        {children && (
          <div style={{ width: '100%', marginTop: '1rem' }}>
            {children}
          </div>
        )}
      </Reveal>
    </section>
  );
}
