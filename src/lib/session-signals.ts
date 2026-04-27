import { parseQuizStateCookie } from './conversion-variant';
import type { QuizStateCookie } from '@/types/conversion';

export function readDemoSignals(): { demoDepth: number; demoUrl: string } {
  if (typeof window === 'undefined') return { demoDepth: 0, demoUrl: '' };
  try {
    const raw = sessionStorage.getItem('olark_demo_session');
    if (!raw) return { demoDepth: 0, demoUrl: '' };
    const parsed = JSON.parse(raw) as { exchangeCount?: number; url?: string };
    return {
      demoDepth: typeof parsed.exchangeCount === 'number' ? parsed.exchangeCount : 0,
      demoUrl: typeof parsed.url === 'string' ? parsed.url : '',
    };
  } catch {
    return { demoDepth: 0, demoUrl: '' };
  }
}

export function hasDemoRun(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem('olark_demo_session');
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { sessionId?: string };
    return Boolean(parsed && typeof parsed.sessionId === 'string' && parsed.sessionId.length > 0);
  } catch {
    return false;
  }
}

export function readPagesVisited(): string {
  if (typeof window === 'undefined') return '';
  try {
    const stored = sessionStorage.getItem('olark_pages_visited');
    if (stored) return stored;
  } catch {
    /* fall through */
  }
  return window.location.pathname || '';
}

export function readQuizCookie(): QuizStateCookie | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('olark_quiz_state='));
  if (!match) return null;
  return parseQuizStateCookie(match.split('=')[1]);
}
