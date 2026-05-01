import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  writeQuizSession,
  readQuizSession,
  writeQuizState,
  readQuizState,
  clearQuizState,
  getTierSignalFromAnswers,
  getRecommendedPlanFromAnswers,
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
// Post-pivot: this function always returns 'commercial' (the band signal sent
// to HubSpot), regardless of answers. Plan-level discrimination
// (Signature vs Bespoke) lives in getRecommendedPlanFromAnswers below.

describe('getTierSignalFromAnswers', () => {
  it('always returns commercial — both Signature and Bespoke fall in the commercial band', () => {
    expect(getTierSignalFromAnswers({})).toBe('commercial');
    expect(
      getTierSignalFromAnswers({
        olark_company_size: '1-5',
        olark_use_case: 'single_crm',
        olark_inbound_volume: 'single_team',
      }),
    ).toBe('commercial');
    expect(
      getTierSignalFromAnswers({
        olark_company_size: '50+',
        olark_use_case: 'multi_system',
        olark_inbound_volume: 'geo_account',
      }),
    ).toBe('commercial');
  });
});

// ─── getRecommendedPlanFromAnswers ────────────────────────────────────────────

describe('getRecommendedPlanFromAnswers', () => {
  it('defaults to signature when no Bespoke triggers fire', () => {
    expect(getRecommendedPlanFromAnswers({})).toBe('signature');
    expect(
      getRecommendedPlanFromAnswers({
        olark_company_size: '1-5',
        olark_use_case: 'single_crm',
        olark_inbound_volume: 'single_team',
      }),
    ).toBe('signature');
    expect(
      getRecommendedPlanFromAnswers({
        olark_company_size: '6-15',
        olark_use_case: 'crm_plus_one',
        olark_inbound_volume: 'regional',
      }),
    ).toBe('signature');
  });

  it('flips to bespoke when routing requires geo + account-level + SSO', () => {
    expect(
      getRecommendedPlanFromAnswers({ olark_inbound_volume: 'geo_account' }),
    ).toBe('bespoke');
  });

  it('flips to bespoke when stack requires multi-system / custom integration', () => {
    expect(
      getRecommendedPlanFromAnswers({ olark_use_case: 'multi_system' }),
    ).toBe('bespoke');
  });

  it('flips to bespoke for a 50+ rep sales floor', () => {
    expect(
      getRecommendedPlanFromAnswers({ olark_company_size: '50+' }),
    ).toBe('bespoke');
  });

  it('any single Bespoke signal wins over Signature defaults on the others', () => {
    expect(
      getRecommendedPlanFromAnswers({
        olark_company_size: '1-5',
        olark_use_case: 'single_crm',
        olark_inbound_volume: 'geo_account',
      }),
    ).toBe('bespoke');
  });
});
