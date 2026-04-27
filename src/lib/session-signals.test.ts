import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  readDemoSignals,
  hasDemoRun,
  readPagesVisited,
  readQuizCookie,
} from './session-signals';

function makeMockSessionStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  };
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.stubGlobal('sessionStorage', makeMockSessionStorage());
  document.cookie = 'olark_quiz_state=; Path=/; Max-Age=0';
});

describe('readDemoSignals', () => {
  it('returns zeros when no demo session is stored', () => {
    expect(readDemoSignals()).toEqual({ demoDepth: 0, demoUrl: '' });
  });

  it('returns parsed depth + url when stored', () => {
    sessionStorage.setItem(
      'olark_demo_session',
      JSON.stringify({ sessionId: 'abc', exchangeCount: 3, url: 'acme.com' }),
    );
    expect(readDemoSignals()).toEqual({ demoDepth: 3, demoUrl: 'acme.com' });
  });

  it('returns zeros on corrupt JSON', () => {
    sessionStorage.setItem('olark_demo_session', 'not-json');
    expect(readDemoSignals()).toEqual({ demoDepth: 0, demoUrl: '' });
  });
});

describe('hasDemoRun', () => {
  it('returns false when no demo session is stored', () => {
    expect(hasDemoRun()).toBe(false);
  });

  it('returns true when sessionId is present', () => {
    sessionStorage.setItem(
      'olark_demo_session',
      JSON.stringify({ sessionId: 'abc' }),
    );
    expect(hasDemoRun()).toBe(true);
  });

  it('returns false when sessionId is missing', () => {
    sessionStorage.setItem('olark_demo_session', JSON.stringify({}));
    expect(hasDemoRun()).toBe(false);
  });
});

describe('readPagesVisited', () => {
  it('returns the stored value when present', () => {
    sessionStorage.setItem('olark_pages_visited', '/essentials,/lead-gen');
    expect(readPagesVisited()).toBe('/essentials,/lead-gen');
  });

  it('falls back to window.location.pathname when missing', () => {
    expect(readPagesVisited()).toBe(window.location.pathname);
  });
});

describe('readQuizCookie', () => {
  it('returns null when cookie is absent', () => {
    expect(readQuizCookie()).toBeNull();
  });

  it('parses a valid cookie value', () => {
    const value = encodeURIComponent(
      JSON.stringify({ tier_signal: 'commercial', demo_run: true, quiz_completed: true }),
    );
    document.cookie = `olark_quiz_state=${value}; Path=/`;
    expect(readQuizCookie()).toEqual({
      tier_signal: 'commercial',
      demo_run: true,
      quiz_completed: true,
    });
  });
});
