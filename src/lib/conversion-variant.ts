import type { ConversionVariant, SessionSignalsCookie } from '@/types/conversion';

export function selectVariant(cookie: SessionSignalsCookie | null): ConversionVariant {
  if (!cookie) return 'anonymous';
  if (cookie.tier_signal === 'commercial' && cookie.demo_run === true) {
    return 'commercial-high-intent';
  }
  if (cookie.tier_signal === 'commercial') return 'commercial-quiz-only';
  if (cookie.tier_signal === 'lead_gen') return 'lead-gen';
  if (cookie.tier_signal === 'essentials') return 'essentials';
  return 'anonymous';
}

export function parseSessionSignalsCookie(raw: string | undefined): SessionSignalsCookie | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<SessionSignalsCookie>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.quiz_completed !== true) return null;
    if (
      parsed.tier_signal !== 'essentials' &&
      parsed.tier_signal !== 'lead_gen' &&
      parsed.tier_signal !== 'commercial'
    ) {
      return null;
    }
    if (typeof parsed.demo_run !== 'boolean') return null;
    return {
      tier_signal: parsed.tier_signal,
      demo_run: parsed.demo_run,
      quiz_completed: true,
    };
  } catch {
    return null;
  }
}
