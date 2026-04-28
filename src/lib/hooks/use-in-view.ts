'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

export interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { threshold = 0.4, rootMargin = '0px', once = true }: UseInViewOptions = {},
): boolean {
  const [inView, setInView] = useState<boolean>(false);
  const triggeredRef = useRef<boolean>(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (
      typeof window === 'undefined' ||
      typeof window.IntersectionObserver === 'undefined'
    ) {
      // No IO support → assume in-view so animations resolve to final state
      if (!triggeredRef.current) {
        triggeredRef.current = true;
        setInView(true);
      }
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, once]);

  return inView;
}
