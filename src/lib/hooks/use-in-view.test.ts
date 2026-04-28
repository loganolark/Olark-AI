import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useInView } from './use-in-view';

describe('useInView', () => {
  it('returns true after observing because the test stub fires intersect synchronously', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      // Attach a mounted node so observer.observe() triggers
      if (!ref.current) {
        const node = document.createElement('div');
        document.body.appendChild(node);
        ref.current = node;
      }
      const inView = useInView(ref);
      return { ref, inView };
    });
    expect(result.current.inView).toBe(true);
  });

  it('returns false initially when ref is unattached', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      const inView = useInView(ref);
      return { inView };
    });
    expect(result.current.inView).toBe(false);
  });
});
