import React from 'react';
import CTAButton from '@/components/ui/CTAButton';
import PillBadge from '@/components/ui/PillBadge';
import type { TierCardProps, TierVariant } from '@/types/tier';

const TIER_GRADIENTS: Record<TierVariant, string> = {
  essentials: 'linear-gradient(90deg, var(--od-gold), var(--od-gold-lt))',
  'lead-gen': 'linear-gradient(90deg, var(--od-pink), var(--od-pink-lt))',
  commercial: 'linear-gradient(90deg, var(--od-teal), var(--od-teal-lt))',
};

const TIER_DISPLAY_NAMES: Record<TierVariant, string> = {
  essentials: 'Essentials',
  'lead-gen': 'Lead-Gen',
  commercial: 'Commercial',
};

export default function TierCard({
  tier,
  featured = false,
  headline,
  tagline,
  capabilities,
  ctaHref,
  ctaLabel,
  ctaVariant = 'primary',
  ctaSize = 'lg',
}: TierCardProps) {
  const tierName = TIER_DISPLAY_NAMES[tier];
  return (
    <div
      className="tier-card-shell"
      data-tier={tier}
      data-featured={featured ? 'true' : 'false'}
    >
      {featured && (
        <div className="tier-card__badge-row">
          <PillBadge variant="gold">Most Popular</PillBadge>
        </div>
      )}
      <article role="article" className="tier-card">
        <div
          className="tier-card__gradient-strip"
          style={{ background: TIER_GRADIENTS[tier] }}
          aria-hidden="true"
        />
        <div className="tier-card__body">
          <h2 className="tier-card__headline">{headline}</h2>
          <p className="tier-card__tagline">{tagline}</p>
          <ul className="tier-card__caps">
            {capabilities.map((cap) => (
              <li key={cap}>{cap}</li>
            ))}
          </ul>
          <div className="tier-card__cta">
            <CTAButton
              variant={ctaVariant}
              size={ctaSize}
              href={ctaHref}
              aria-label={`${ctaLabel} — ${tierName} tier`}
            >
              {ctaLabel}
            </CTAButton>
          </div>
        </div>
      </article>
    </div>
  );
}
