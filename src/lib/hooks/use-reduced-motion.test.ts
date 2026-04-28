import { describe, expect, it, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './use-reduced-motion';

type Listener = (e: MediaQueryListEvent) => void;

function installMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches: initialMatches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
    dispatchEvent: () => false,
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue(mql),
  });
  return {
    fire(matches: boolean) {
      mql.matches = matches;
      listeners.forEach((fn) => fn({ matches } as MediaQueryListEvent));
    },
  };
}

describe('useReducedMotion', () => {
  beforeEach(() => {
    installMatchMedia(false);
  });

  it('returns false when reduced motion is not preferred', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when reduced motion is preferred', () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when matchMedia change fires', () => {
    const ctrl = installMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => ctrl.fire(true));
    expect(result.current).toBe(true);
  });
});
