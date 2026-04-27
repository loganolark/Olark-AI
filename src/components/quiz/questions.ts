import type { TierSignal } from '@/types/quiz';

export const QUIZ_TOTAL_STEPS = 5;

export const TIER_LABELS: Record<TierSignal, string> = {
  essentials: 'Essentials',
  lead_gen: 'Lead-Gen',
  commercial: 'Commercial',
};

export const TIER_PRODUCT_PATHS: Record<TierSignal, string> = {
  essentials: '/essentials',
  lead_gen: '/lead-gen',
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

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    step: 1,
    propertyKey: 'olark_company_size',
    headline: 'How big is your company?',
    options: [
      { value: '1-10', label: '1–10 employees' },
      { value: '11-50', label: '11–50 employees' },
      { value: '51-200', label: '51–200 employees' },
      { value: '201-500', label: '201–500 employees' },
      { value: '500+', label: '500+ employees' },
    ],
  },
  {
    step: 2,
    propertyKey: 'olark_use_case',
    headline: 'What’s the primary job you want Aiden to do?',
    options: [
      { value: 'inbound_qual', label: 'Qualify inbound visitors' },
      { value: 'outbound_support', label: 'Augment outbound + post-sale support' },
      { value: 'full_pipeline', label: 'Run my full pipeline (inbound → handoff)' },
    ],
  },
  {
    step: 3,
    propertyKey: 'olark_inbound_volume',
    headline: 'How much inbound traffic does your site get monthly?',
    options: [
      { value: 'low', label: 'Under 5,000 visits' },
      { value: 'medium', label: '5,000–50,000 visits' },
      { value: 'high', label: '50,000+ visits' },
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
