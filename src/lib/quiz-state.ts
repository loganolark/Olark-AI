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

export function getTierSignalFromAnswers(answers: Record<string, string>): TierSignal {
  const size = answers.olark_company_size ?? '';
  const useCase = answers.olark_use_case ?? '';
  const volume = answers.olark_inbound_volume ?? '';

  if (size === '201-500' || size === '500+' || useCase === 'full_pipeline' || volume === 'high') {
    return 'commercial';
  }
  if (size === '11-50' || size === '51-200' || useCase === 'outbound_support' || volume === 'medium') {
    return 'lead_gen';
  }
  return 'essentials';
}
