import type { TierSignal } from '@/types/quiz';

export const QUIZ_TOTAL_STEPS = 5;

export const TIER_LABELS: Record<TierSignal, string> = {
  essentials: 'Essentials',
  lead_gen: 'Lead-Gen',
  commercial: 'Commercial',
};

/** The two plans the homepage quiz now recommends. After the
 *  industrial-supplier pivot, every visitor lands on commercial-tier
 *  pricing — Signature or Bespoke — so the quiz reveal speaks plan-level
 *  language instead of the legacy tier-level language. */
export type RecommendedPlan = 'signature' | 'bespoke';

export const PLAN_LABELS: Record<RecommendedPlan, string> = {
  signature: 'Aiden Signature',
  bespoke: 'Aiden Bespoke',
};

export const PLAN_TAGLINES: Record<RecommendedPlan, string> = {
  signature:
    'The full commercial AI platform for CRM-connected industrial sales teams running a single regional or dealer routing layer.',
  bespoke:
    'Fully custom AI for industrial suppliers with multi-system integration, geo / account routing, SSO, and procurement-grade buyer cycles.',
};

/**
 * All quiz outcomes route to the single product page now. The two SMB tiers
 * (essentials, lead_gen) were collapsed when the site pivoted to an
 * industrial-supplier narrative — kept as quiz signals (HubSpot still
 * receives them) but every CTA points at /commercial.
 */
export const TIER_PRODUCT_PATHS: Record<TierSignal, string> = {
  essentials: '/commercial',
  lead_gen: '/commercial',
  commercial: '/commercial',
};

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  step: 1 | 2 | 3;
  propertyKey: string;
  headline: string;
  options: QuizOption[];
}

// Three-question quiz tuned to discriminate Signature from Bespoke for
// the industrial-supplier ICP. Each question maps to one of the three
// big "Bespoke" triggers from the Aiden lineup (PLAN_DATA in
// src/types/quote.ts): multi-system integration, SSO + procurement
// review, geo / account-level routing.
//
// The HubSpot property keys are kept stable from the prior quiz so the
// integration on the receiving side doesn't need a schema migration —
// only the question text and option values change.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    step: 1,
    propertyKey: 'olark_company_size',
    headline: 'How big is your sales team?',
    options: [
      { value: '1-5', label: 'Just me / a few of us (1–5 reps)' },
      { value: '6-15', label: 'A small team (6–15 reps)' },
      { value: '16-50', label: 'A full sales floor (16–50 reps)' },
      { value: '50+', label: '50+ reps across regions' },
    ],
  },
  {
    step: 2,
    propertyKey: 'olark_use_case',
    headline: 'What does your stack look like?',
    options: [
      { value: 'single_crm', label: 'One CRM (HubSpot, Salesforce, or similar)' },
      { value: 'crm_plus_one', label: 'A CRM plus an ERP or ticketing system' },
      { value: 'multi_system', label: 'Multiple CRMs or a custom integration we need built' },
    ],
  },
  {
    step: 3,
    propertyKey: 'olark_inbound_volume',
    headline: 'How does your team route leads today?',
    options: [
      { value: 'single_team', label: 'One team — all leads land in the same place' },
      { value: 'regional', label: 'Regional reps or a dealer network' },
      { value: 'geo_account', label: 'Geo + account / domain routing, with SSO and procurement review' },
    ],
  },
];

export function getQuestionByStep(step: number): QuizQuestion | undefined {
  return QUIZ_QUESTIONS.find((q) => q.step === step);
}

export function getOptionLabel(propertyKey: string, value: string): string | undefined {
  return QUIZ_QUESTIONS.find((q) => q.propertyKey === propertyKey)
    ?.options.find((o) => o.value === value)?.label;
}
