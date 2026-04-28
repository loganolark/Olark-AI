import type { TierSignal } from '@/types/quiz';

export type ConversionVariant =
  | 'commercial-high-intent'
  | 'commercial-quiz-only'
  | 'lead-gen'
  | 'essentials'
  | 'anonymous';

/**
 * Payload of the `olark_session_signals` cookie — written by PathFinderQuiz at
 * step 5 entry (consent-gated) and read by ConversionPageShell at SSR time.
 *
 * Distinct from the `localStorage['olark_quiz_state']` artifact (Story 4.2),
 * which holds the full QuizState for cross-session quiz resume.
 */
export interface SessionSignalsCookie {
  tier_signal: TierSignal;
  demo_run: boolean;
  quiz_completed: true;
}
