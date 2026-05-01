import type { QuizState, TierSignal } from '@/types/quiz';

const QUIZ_SESSION_KEY = 'olark_quiz_session';
const QUIZ_STATE_KEY = 'olark_quiz_state';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function writeQuizSession(state: QuizState): void {
  if (!isClient()) return;
  sessionStorage.setItem(QUIZ_SESSION_KEY, JSON.stringify(state));
}

export function readQuizSession(): QuizState | null {
  if (!isClient()) return null;
  try {
    const raw = sessionStorage.getItem(QUIZ_SESSION_KEY);
    return raw ? (JSON.parse(raw) as QuizState) : null;
  } catch {
    return null;
  }
}

export function writeQuizState(state: QuizState): void {
  if (!isClient()) return;
  localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
}

export function readQuizState(): QuizState | null {
  if (!isClient()) return null;
  try {
    const raw = localStorage.getItem(QUIZ_STATE_KEY);
    return raw ? (JSON.parse(raw) as QuizState) : null;
  } catch {
    return null;
  }
}

export function clearQuizState(): void {
  if (!isClient()) return;
  localStorage.removeItem(QUIZ_STATE_KEY);
}

/**
 * After the industrial-supplier pivot the homepage quiz only sells
 * commercial-tier products (Signature + Bespoke), so the band signal
 * sent to HubSpot is always `commercial`. The previous tier-band routing
 * (essentials / lead_gen / commercial) is gone — kept as a stable
 * 3-value HubSpot enum so existing list segmentation doesn't break.
 *
 * Plan-level discrimination (Signature vs Bespoke) lives in
 * `getRecommendedPlanFromAnswers` below.
 */
export function getTierSignalFromAnswers(_answers: Record<string, string>): TierSignal {
  return 'commercial';
}

/** The two plans the new quiz can recommend. */
export type RecommendedPlan = 'signature' | 'bespoke';

/**
 * Maps the three-question quiz answers to a Signature/Bespoke
 * recommendation. Bespoke triggers any time the visitor signals one of
 * the three Bespoke-defining capabilities — multi-system integration,
 * geo / account-level routing with SSO, or a 50+ rep sales floor.
 * Otherwise Signature is the right fit.
 */
export function getRecommendedPlanFromAnswers(
  answers: Record<string, string>,
): RecommendedPlan {
  const size = answers.olark_company_size ?? '';
  const stack = answers.olark_use_case ?? '';
  const routing = answers.olark_inbound_volume ?? '';

  // Any single Bespoke-grade signal flips the recommendation. The
  // routing answer is the strongest tell (geo + SSO + procurement is
  // the canonical Bespoke profile from PLAN_DATA), but a 50+ team or a
  // multi-system stack also clears the bar on its own.
  if (
    routing === 'geo_account' ||
    stack === 'multi_system' ||
    size === '50+'
  ) {
    return 'bespoke';
  }
  return 'signature';
}
