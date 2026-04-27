import type { TierSignal } from '@/types/quiz';

export type ConversionVariant =
  | 'commercial-high-intent'
  | 'commercial-quiz-only'
  | 'lead-gen'
  | 'essentials'
  | 'anonymous';

export interface QuizStateCookie {
  tier_signal: TierSignal;
  demo_run: boolean;
  quiz_completed: true;
}
