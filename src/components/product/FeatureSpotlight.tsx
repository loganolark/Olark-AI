import React from 'react';
import Reveal from '@/components/ui/Reveal';

type LabelVariant = 'gold' | 'pink';
type PillVariant = 'default' | 'pink' | 'muted';
type Accent = 'navy' | 'card';

export interface FeatureSpotlightPill {
  label: string;
  variant?: PillVariant;
}

export interface FeatureSpotlightProps {
  label: string;
  labelVariant?: LabelVariant;
  title: string;
  paragraphs: Array<string | React.ReactNode>;
  pills: FeatureSpotlightPill[];
  reverse?: boolean;
  accent?: Accent;
  graphic?: React.ReactNode;
}

const labelColor: Record<LabelVariant, string> = {
  gold: 'var(--od-gold)',
  pink: 'var(--od-pink)',
};

const pillStyles: Record<PillVariant, React.CSSProperties> = {
  default: {
    backgroundColor: 'rgba(250, 201, 23,0.12)',
    border: '1px solid rgba(250, 201, 23,0.28)',
    color: 'var(--od-gold)',
  },
  pink: {
    backgroundColor: 'rgba(239, 78, 115,0.12)',
    border: '1px solid rgba(239, 78, 115,0.28)',
    color: 'var(--od-pink)',
  },
  muted: {
    backgroundColor: 'rgba(160,157,216,0.1)',
    border: '1px solid rgba(160,157,216,0.22)',
    color: 'var(--od-muted)',
  },
};

const accentBg: Record<Accent, string> = {
  navy: 'var(--od-navy)',
  card: 'var(--od-card)',
};

export default function FeatureSpotlight({
  label,
  labelVariant = 'gold',
  title,
  paragraphs,
  pills,
  reverse = false,
  accent = 'navy',
  graphic,
}: FeatureSpotlightProps) {
  const copy = (
    <div>
      <p
        data-feature-label
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: labelColor[labelVariant],
          margin: '0 0 1rem',
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
          fontWeight: 900,
          fontSize: 'clamp(1.625rem, 4vw, 2.25rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: 'var(--od-white)',
          margin: '0 0 1.25rem',
        }}
      >
        {title}
      </h2>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--od-text)',
            margin: i === paragraphs.length - 1 ? '0 0 1.5rem' : '0 0 1rem',
          }}
        >
          {p}
        </p>
      ))}
      {pills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {pills.map((pill) => (
            <span
              key={pill.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '100px',
                padding: '0.25rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                lineHeight: 1.4,
                ...pillStyles[pill.variant ?? 'default'],
              }}
            >
              {pill.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // Render the real graphic naked so it fills the grid cell. The dashed
  // wrapper was a "Visual coming soon" placeholder — kept only as a dev
  // fallback when no graphic is passed (every shipped spotlight passes one).
  const visual = graphic ?? (
    <div
      style={{
        border: '1px dashed var(--od-border)',
        borderRadius: '0.75rem',
        minHeight: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--od-muted)',
        fontSize: '0.875rem',
        fontStyle: 'italic',
      }}
    >
      Visual coming soon
    </div>
  );

  return (
    <section
      className="product-section"
      style={{ backgroundColor: accentBg[accent] }}
    >
      <Reveal
        className="fs-grid"
        style={{ maxWidth: '1080px', margin: '0 auto' }}
      >
        {reverse ? (
          <>
            {visual}
            {copy}
          </>
        ) : (
          <>
            {copy}
            {visual}
          </>
        )}
      </Reveal>
    </section>
  );
}
