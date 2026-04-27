import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  writeQuizSession,
  readQuizSession,
  writeQuizState,
  readQuizState,
  clearQuizState,
  getTierSignalFromAnswers,
} from './quiz-state';
import type { QuizState } from '@/types/quiz';

const mockState: QuizState = {
  currentStep: 2,
  answers: { olark_company_size: '11-50' },
  emailCaptured: false,
  sessionId: 'sess-abc',
  startedAt: '2026-04-27T00:00:00.000Z',
};

function makeMockStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  };
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.stubGlobal('localStorage', makeMockStorage());
  vi.stubGlobal('sessionStorage', makeMockStorage());
});

// ─── sessionStorage helpers ───────────────────────────────────────────────────

describe('writeQuizSession / readQuizSession', () => {
  it('round-trips state through sessionStorage', () => {
    writeQuizSession(mockState);
    expect(readQuizSession()).toEqual(mockState);
  });

  it('readQuizSession returns null when nothing written', () => {
    expect(readQuizSession()).toBeNull();
  });

  it('readQuizSession returns null on corrupt JSON', () => {
    sessionStorage.setItem('olark_quiz_session', 'not-json');
    expect(readQuizSession()).toBeNull();
  });

  it('writeQuizSession is a no-op when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined);
    expect(() => writeQuizSession(mockState)).not.toThrow();
  });

  it('readQuizSession returns null when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined);
    expect(readQuizSession()).toBeNull();
  });
});

// ─── localStorage helpers ─────────────────────────────────────────────────────

describe('writeQuizState / readQuizState', () => {
  it('round-trips state through localStorage', () => {
    writeQuizState(mockState);
    expect(readQuizState()).toEqual(mockState);
  });

  it('readQuizState returns null when nothing written', () => {
    expect(readQuizState()).toBeNull();
  });

  it('readQuizState returns null on corrupt JSON', () => {
    localStorage.setItem('olark_quiz_state', 'not-json');
    expect(readQuizState()).toBeNull();
  });

  it('writeQuizState is a no-op when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined);
    expect(() => writeQuizState(mockState)).not.toThrow();
  });

  it('readQuizState returns null when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined);
    expect(readQuizState()).toBeNull();
  });
});

describe('clearQuizState', () => {
  it('removes the localStorage key', () => {
    writeQuizState(mockState);
    clearQuizState();
    expect(readQuizState()).toBeNull();
  });

  it('is a no-op when nothing stored', () => {
    expect(() => clearQuizState()).not.toThrow();
  });

  it('is a no-op when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined);
    expect(() => clearQuizState()).not.toThrow();
  });
});

// ─── getTierSignalFromAnswers ─────────────────────────────────────────────────

describe('getTierSignalFromAnswers', () => {
  it('returns commercial for size 500+', () => {
    expect(getTierSignalFromAnswers({ olark_company_size: '500+' })).toBe('commercial');
  });

  it('returns commercial for size 201-500', () => {
    expect(getTierSignalFromAnswers({ olark_company_size: '201-500' })).toBe('commercial');
  });

  it('returns commercial for full_pipeline use case', () => {
    expect(getTierSignalFromAnswers({ olark_use_case: 'full_pipeline' })).toBe('commercial');
  });

  it('returns commercial for high inbound volume', () => {
    expect(getTierSignalFromAnswers({ olark_inbound_volume: 'high' })).toBe('commercial');
  });

  it('returns lead_gen for size 11-50', () => {
    expect(getTierSignalFromAnswers({ olark_company_size: '11-50' })).toBe('lead_gen');
  });

  it('returns lead_gen for size 51-200', () => {
    expect(getTierSignalFromAnswers({ olark_company_size: '51-200' })).toBe('lead_gen');
  });

  it('returns lead_gen for outbound_support use case', () => {
    expect(getTierSignalFromAnswers({ olark_use_case: 'outbound_support' })).toBe('lead_gen');
  });

  it('returns lead_gen for medium inbound volume', () => {
    expect(getTierSignalFromAnswers({ olark_inbound_volume: 'medium' })).toBe('lead_gen');
  });

  it('returns essentials for small company + inbound_qual + low volume', () => {
    expect(
      getTierSignalFromAnswers({
        olark_company_size: '1-10',
        olark_use_case: 'inbound_qual',
        olark_inbound_volume: 'low',
      }),
    ).toBe('essentials');
  });

  it('returns essentials for empty answers (default)', () => {
    expect(getTierSignalFromAnswers({})).toBe('essentials');
  });

  it('commercial takes priority over lead_gen signals', () => {
    expect(
      getTierSignalFromAnswers({ olark_company_size: '11-50', olark_inbound_volume: 'high' }),
    ).toBe('commercial');
  });
});
