import type { TierVariant } from '@/types/tier';

export interface TierContentEntry {
  headline: string;
  tagline: string;
  capabilities: string[];
  ctaHref: string;
  ctaLabel: string;
}

/**
 * Canonical tier data shown in the big TierCard component.
 *
 * Surfaced on /get-started as the dynamic recommendation card after the
 * visitor's quiz/cookie variant is known. Previously each product page
 * (/essentials, /lead-gen, /commercial) hand-rolled its own copy in a
 * #capabilities section — those have been consolidated here so the
 * conversion page is the single source for the post-recommendation card.
 */
export const TIER_CONTENT: Record<TierVariant, TierContentEntry> = {
  essentials: {
    headline: 'Essentials',
    tagline:
      'For SMB teams who want chat that just works — qualified leads, no babysitting, no upgrade dance.',
    capabilities: [
      'One-click install — paste a script tag, you’re live',
      'Pre-trained on your site, FAQs, and pricing',
      'Routes qualified visitors to your rep automatically',
      'Self-serve dashboard — no implementation engineer required',
      'Live in 48 hours, not 6 months',
    ],
    ctaHref: '#booking',
    ctaLabel: 'Book Your Onboarding Call →',
  },
  'lead-gen': {
    headline: 'Lead-Gen',
    tagline:
      'For growth-stage teams whose pipeline is bigger than their bandwidth — give every rep a teammate that does the qualifying upstream.',
    capabilities: [
      'Visitors qualified by company size, role, and intent before your rep sees them',
      'Handoff briefs include the visitor’s questions, objections, and stated needs',
      'Tier signals route to the right rep — no triage queue',
      'Context-loaded chat history attached to every contact in your CRM',
      'Pipeline-ready leads, not raw form fills',
    ],
    ctaHref: '#booking',
    ctaLabel: 'Book Your Onboarding Call →',
  },
  commercial: {
    headline: 'Commercial',
    tagline:
      'For teams that need provable pipeline impact — full signal trail, rep intelligence on every contact, and an implementation timeline you can hand to engineering.',
    capabilities: [
      'Full signal trail — every visitor interaction logged and queryable',
      'Rep intelligence brief on every contact — context, objections, stated needs',
      'Deep HubSpot CRM integration — deals, activities, segmented routing',
      'Objection-handling flows tuned to your product and sales motion',
      'Tier-segmented routing gives your reps better leads, not more leads',
    ],
    ctaHref: '#booking',
    ctaLabel: 'Scope My Build →',
  },
};
