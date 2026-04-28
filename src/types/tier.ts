export type TierVariant = 'essentials' | 'lead-gen' | 'commercial';

export type TierCardCtaVariant = 'primary' | 'secondary' | 'ghost';
export type TierCardCtaSize = 'sm' | 'md' | 'lg';

export interface TierCardProps {
  tier: TierVariant;
  featured?: boolean;
  headline: string;
  tagline: string;
  capabilities: string[];
  ctaHref: string;
  ctaLabel: string;
  /** Visual treatment for the card CTA. Defaults to 'primary' (gold).
   * Use 'secondary' on preview-context cards (e.g. homepage tier grid)
   * to honor the Punctuation Rule from DESIGN.md when 3 cards stack. */
  ctaVariant?: TierCardCtaVariant;
  /** Size for the card CTA. Defaults to 'lg' for product-page primary CTAs;
   * use 'md' on preview-context cards for visual restraint. */
  ctaSize?: TierCardCtaSize;
}
