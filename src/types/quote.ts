/**
 * Quote builder domain types.
 *
 * Distinct from `TierSignal` in `src/types/quiz.ts` (which is a HubSpot enum):
 *   - `QuizTier` — the tier selected on the product page (the QuoteBuilder input).
 *   - `Plan` — the actual plan a visitor qualifies for after the quote quiz.
 *
 * A "commercial" QuizTier may produce a `signature` or `bespoke` Plan. A
 * "advanced" QuizTier (now also surfaced on /commercial after the SMB-page
 * collapse) may produce `advanced` or `pro`.
 */

export type Plan = 'essentials' | 'advanced' | 'pro' | 'signature' | 'bespoke';

export type QuizTier = 'essentials' | 'advanced' | 'commercial';

export interface PlanData {
  name: string;
  base: number;
  includedSeats: number;
  seatPrice: number;
  tagline: string;
  features: string[];
  managed: string[];
  inheritedLabel?: string;
  inheritedFrom?: string;
  inheritedFeatures?: string[];
}

export type QuoteQuestionType = 'text' | 'text-optional' | 'number' | 'options';

export interface QuoteOption {
  value: string;
  label: string;
}

export interface QuoteQuestion {
  id: string;
  type: QuoteQuestionType;
  text: string;
  step?: string;
  placeholder?: string;
  options?: QuoteOption[];
}

export interface QuoteHistoryItem {
  qShort: string;
  aLabel: string;
}

export type QuoteTrack = 'advanced' | 'pro' | 'signature' | 'bespoke' | null;

export interface QuoteState {
  answers: Record<string, string>;
  history: QuoteHistoryItem[];
  track: QuoteTrack;
}

/**
 * The 5 plans, transcribed verbatim from aiden-landing.html (lines 4255–4337).
 * Single source of truth for pricing math + result-card content.
 */
export const PLAN_DATA: Record<Plan, PlanData> = {
  essentials: {
    name: 'Aiden Essentials',
    base: 3600,
    includedSeats: 1,
    seatPrice: 276,
    tagline: 'The complete AI foundation for every business.',
    features: [
      'Aiden Chatbot for one website',
      'Live Search — Website Ingest',
      'Document Ingest',
      'Real-time AI Web Search',
      'Stock Answers',
      'Multilingual Chatbot',
      'Unlimited Chats & Knowledge Uploads',
      'AI Admin Portal',
      'AI Reporting',
      'Live Onboarding Included',
      'Quarterly Business Reviews',
      'Priority Support',
    ],
    managed: [
      'Live Onboarding: Training session for your team.',
      'Quarterly Business Review: Proactive performance reviews.',
      'Priority Support: Same business day responses.',
    ],
  },
  advanced: {
    name: 'Aiden Advanced',
    base: 4800,
    includedSeats: 2,
    seatPrice: 276,
    tagline: 'Intelligent routing and sales flow customization.',
    features: [
      'All Essentials features included',
      'Up to 10 customizable routing buttons',
      'Customizable Support & Sales Flows',
      'Smart escalation to live agents',
      '2 included agent seats',
      'Live Onboarding Included',
      'Quarterly Business Reviews',
      'Priority Support',
    ],
    managed: [
      'Live Onboarding: Training session for your team.',
      'Quarterly Business Review: Proactive performance reviews.',
      'Priority Support: Same business day responses.',
    ],
  },
  pro: {
    name: 'Aiden Pro',
    base: 7200,
    includedSeats: 3,
    seatPrice: 276,
    tagline: 'Multi-team routing, departmental flows, and integrations.',
    features: [
      'All Advanced features included',
      'Up to 30 customizable routing buttons',
      'Departmental routing by sales & support need',
      'Smart escalation to live agents',
      'One standard integration (no custom config)',
      '3 included agent seats',
      'Live Onboarding Included',
      'Quarterly Business Reviews',
      'Priority Support',
    ],
    inheritedLabel: 'All Advanced features included',
    inheritedFrom: 'Aiden Advanced',
    inheritedFeatures: [
      'Aiden Chatbot for one website',
      'Live Search — Website Ingest',
      'Document Ingest',
      'Real-time AI Web Search',
      'Stock Answers',
      'Multilingual Chatbot',
      'Unlimited Chats & Knowledge Uploads',
      'AI Admin Portal',
      'AI Reporting',
      'Up to 10 customizable routing buttons',
      'Customizable Support & Sales Flows',
      'Smart escalation to live agents',
      '2 included agent seats',
    ],
    managed: [
      'Live Onboarding: Training session for your team.',
      'Quarterly Business Review: Proactive performance reviews.',
      'Priority Support: Same business day responses.',
    ],
  },
  signature: {
    name: 'Aiden Signature',
    base: 9900,
    includedSeats: 3,
    seatPrice: 600,
    tagline: 'The full commercial AI platform for CRM-connected sales teams.',
    features: [
      'All Pro features included',
      'Live Chat Translation PowerUp',
      'Visitor Cobrowsing PowerUp',
      'Up to 30 routing buttons with custom lead capture flows',
      'One standard CRM integration (HubSpot or Salesforce)',
      'Dedicated Onboarding Manager',
      'Dedicated Account Manager',
      'First Priority Support Queue',
      '4 hours maintenance per quarter',
      '3 included agent seats',
    ],
    managed: [
      'Dedicated onboarding & account manager.',
      'Live Training: Full team onboarding call.',
      'Quarterly Business Review.',
      'Priority Support + phone support by appointment.',
    ],
  },
  bespoke: {
    name: 'Aiden Bespoke',
    base: 16500,
    includedSeats: 5,
    seatPrice: 600,
    tagline: 'Fully custom AI for complex organizations with advanced integration needs.',
    features: [
      'All Signature features included',
      'Up to 50 customizable routing buttons',
      'Geo routing & Account/Domain routing',
      'SSO included',
      'Two CRM/ticketing system integrations',
      'Procurement & Legal access',
      'Custom SOW option for integrations',
      'Dedicated Account Manager',
      'First Priority Support Queue',
      '8 hours maintenance per quarter',
      '5 included agent seats',
    ],
    inheritedLabel: 'All Signature features included',
    inheritedFrom: 'Aiden Signature',
    inheritedFeatures: [
      'Aiden Chatbot for one website',
      'Live Search — Website Ingest',
      'Document Ingest',
      'Real-time AI Web Search',
      'Stock Answers',
      'Multilingual Chatbot',
      'Unlimited Chats & Knowledge Uploads',
      'AI Admin Portal',
      'AI Reporting',
      'Live Chat Translation PowerUp',
      'Visitor Cobrowsing PowerUp',
      'Up to 30 routing buttons with custom lead capture flows',
      'One standard CRM integration (HubSpot or Salesforce)',
      'Departmental routing by sales & support need',
      'Dedicated Onboarding Manager',
      'Dedicated Account Manager',
      'First Priority Support Queue',
      '4 hours maintenance per quarter',
      '3 included agent seats',
    ],
    managed: [
      'Dedicated account manager.',
      'Live Training: Full team onboarding call.',
      'Quarterly Business Review.',
      'Advanced Technical Support for API & integrations.',
      'Priority Support + phone support by appointment.',
    ],
  },
};
