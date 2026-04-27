'use client';

import React from 'react';
import CTAButton from '@/components/ui/CTAButton';
import type { TierSignal } from '@/types/quiz';
import { TIER_LABELS, TIER_PRODUCT_PATHS } from './questions';

export interface QuizTierRevealProps {
  tierSignal: TierSignal;
  onScopeClick?: () => void;
  onTierDetailsClick?: () => void;
  onBack?: () => void;
}

export default function QuizTierReveal({
  tierSignal,
  onScopeClick,
  onTierDetailsClick,
  onBack,
}: QuizTierRevealProps) {
  const tierLabel = TIER_LABELS[tierSignal];
  const tierPath = TIER_PRODUCT_PATHS[tierSignal];

  return (
    <div className="quiz-tier-fade">
      <p
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: 'var(--od-gold)',
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        Your fit
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
          fontWeight: 900,
          fontSize: 'clamp(1.625rem, 4.25vw, 2.5rem)',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: 'var(--od-white)',
          textAlign: 'center',
          margin: '0 0 1rem',
        }}
      >
        Based on what you told us: {tierLabel}
      </h2>
      <p
        style={{
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          color: 'var(--od-muted)',
          maxWidth: '460px',
          margin: '0 auto 2rem',
          textAlign: 'center',
        }}
      >
        This is a confirmation, not an assignment — you can scope a different fit on the call.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.875rem',
        }}
      >
        <CTAButton
          variant="primary"
          size="lg"
          href="/get-started"
          onClick={onScopeClick}
        >
          Let&rsquo;s scope your build →
        </CTAButton>
        <CTAButton
          variant="secondary"
          size="lg"
          href={tierPath}
          onClick={onTierDetailsClick}
        >
          See {tierLabel} details →
        </CTAButton>
      </div>
      {onBack && (
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <CTAButton variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </CTAButton>
        </div>
      )}
    </div>
  );
}
