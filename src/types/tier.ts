export type TierVariant = 'essentials' | 'lead-gen' | 'commercial';

export interface TierCardProps {
  tier: TierVariant;
  featured?: boolean;
  headline: string;
  tagline: string;
  capabilities: string[];
  ctaHref: string;
  ctaLabel: string;
}
