'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

type RevealTag = 'div' | 'section' | 'article' | 'span' | 'li' | 'header' | 'aside' | 'ol' | 'ul';

export interface RevealProps {
  children: React.ReactNode;
  /** Delay before transition starts (ms). Stagger siblings by passing increasing values. */
  delay?: number;
  /** Transition duration (ms). */
  duration?: number;
  /** IntersectionObserver threshold. Default 0.15 (~15% visible). */
  threshold?: number;
  /** rootMargin offset — useful to trigger before/after element edge. */
  rootMargin?: string;
  /** Initial Y offset in px before reveal. Default 12. */
  offset?: number;
  /** Element type to render. Default 'div'. */
  as?: RevealTag;
  /** Reveal once and stop observing. Default true. */
  once?: boolean;
  /** Render at final state immediately (no animation). Used to opt out without
   *  removing the wrapper — e.g. when an ancestor will animate the same content. */
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
  /** ARIA role — pass-through for cases where Reveal IS the semantic element
   *  (e.g. a tabpanel). */
  role?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export default function Reveal({
  children,
  delay = 0,
  duration = 500,
  threshold = 0.15,
  rootMargin = '0px',
  offset = 12,
  as: Tag = 'div',
  once = true,
  disabled = false,
  className,
  style,
  id,
  'data-testid': testId,
  role,
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { threshold, rootMargin, once });
  const reduced = useReducedMotion();
  const visible = disabled || reduced || inView;

  const baseStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${offset}px)`,
    transition:
      reduced || disabled
        ? 'none'
        : `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    willChange: 'opacity, transform',
    ...style,
  };

  return React.createElement(
    Tag,
    {
      ref,
      id,
      className,
      role,
      'aria-labelledby': ariaLabelledBy,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden,
      'data-reveal': visible ? 'in' : 'out',
      'data-testid': testId,
      style: baseStyle,
    },
    children,
  );
}
