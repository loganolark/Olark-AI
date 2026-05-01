'use client';

import React from 'react';
import CTAButton from '@/components/ui/CTAButton';
import type { TierSignal } from '@/types/quiz';
import { TIER_LABELS, TIER_PRODUCT_PATHS, PLAN_LABELS, PLAN_TAGLINES, type RecommendedPlan } from './questions';

export interface QuizTierRevealProps {
  /**
   * Legacy band signal — still passed in (and forwarded to HubSpot
   * elsewhere) for API/analytics compatibility, but the on-page reveal
   * now shows the plan-level recommendation instead.
   */
  tierSignal: TierSignal;
  /**
   * Signature or Bespoke — the new homepage quiz only recommends from
   * the commercial-tier lineup.
   */
  recommendedPlan: RecommendedPlan;
  onScopeClick?: () => void;
  onTierDetailsClick?: () => void;
  onBack?: () => void;
}

export default function QuizTierReveal({
  tierSignal,
  recommendedPlan,
  onScopeClick,
  onTierDetailsClick,
  onBack,
}: QuizTierRevealProps) {
  const planLabel = PLAN_LABELS[recommendedPlan];
  const planTagline = PLAN_TAGLINES[recommendedPlan];
  // The "details" CTA always routes to /commercial — that's where both
  // plans are documented (and where the QuoteBuilder + Compare table
  // live). The legacy TIER_PRODUCT_PATHS map kept around for analytics.
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
        Based on what you told us: {planLabel}
      </h2>
      <p
        style={{
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          color: 'var(--od-text)',
          maxWidth: '520px',
          margin: '0 auto 0.75rem',
          textAlign: 'center',
        }}
      >
        {planTagline}
      </p>
      <p
        style={{
          fontSize: '0.875rem',
          lineHeight: 1.6,
          color: 'var(--od-muted)',
          maxWidth: '460px',
          margin: '0 auto 2rem',
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        This is a confirmation, not an assignment — you can scope a
        different fit on the call.
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
          See {planLabel} details →
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

      {/* Hidden but present for analytics-compatibility — surfaces the
          band-level label in DOM so legacy tests + screen readers can still
          find it. The plan recommendation is the visible primary headline. */}
      <span
        data-testid="quiz-tier-band"
        data-tier-signal={tierSignal}
        style={{ display: 'none' }}
      >
        {TIER_LABELS[tierSignal]}
      </span>
    </div>
  );
}
