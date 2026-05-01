'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

export interface TypewriterRotatorProps {
  /** Phrases to rotate through (typed → paused → deleted → next). */
  phrases: string[];
  /** Per-character typing speed in ms. */
  typingSpeed?: number;
  /** Per-character deletion speed in ms. */
  deletingSpeed?: number;
  /** Pause after a phrase finishes typing, in ms. */
  pauseAtEndMs?: number;
  /** Pause after a phrase finishes deleting, in ms. */
  pauseAtStartMs?: number;
  /** Cursor glyph appended to the typed text. */
  cursor?: string;
  className?: string;
  style?: React.CSSProperties;
}

type Phase = 'typing' | 'pausing-end' | 'deleting' | 'pausing-start';

/**
 * Terminal-style typewriter rotator. Types a phrase one character at a
 * time, pauses, deletes it, and moves to the next phrase — looping
 * forever. The blinking cursor is a CSS keyframe defined in globals.css
 * (`typewriter-cursor-blink`).
 *
 * Accessibility:
 *   - The animated string is `aria-hidden="true"` so screen readers don't
 *     announce every keystroke as a separate update.
 *   - A visually-hidden sibling span carries the joined phrase list
 *     ("from your trade shows or from your outbound campaigns or …"),
 *     which gives assistive tech the full intent in a single read.
 *   - prefers-reduced-motion collapses the whole component to the first
 *     phrase rendered statically (no typing, no cursor) — so the heading
 *     still reads complete for users who can't or don't want animation.
 */
export default function TypewriterRotator({
  phrases,
  typingSpeed = 60,
  deletingSpeed = 30,
  pauseAtEndMs = 1500,
  pauseAtStartMs = 350,
  cursor = '|',
  className,
  style,
}: TypewriterRotatorProps) {
  const reduced = useReducedMotion();
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<Phase>('typing');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced || phrases.length === 0) return;

    const current = phrases[phraseIdx % phrases.length] ?? '';

    function arm(ms: number, fn: () => void) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(fn, ms);
    }

    if (phase === 'typing') {
      if (text === current) {
        arm(0, () => setPhase('pausing-end'));
      } else {
        arm(typingSpeed, () => setText(current.slice(0, text.length + 1)));
      }
    } else if (phase === 'pausing-end') {
      arm(pauseAtEndMs, () => setPhase('deleting'));
    } else if (phase === 'deleting') {
      if (text === '') {
        arm(0, () => setPhase('pausing-start'));
      } else {
        arm(deletingSpeed, () => setText((t) => t.slice(0, -1)));
      }
    } else if (phase === 'pausing-start') {
      arm(pauseAtStartMs, () => {
        setPhraseIdx((i) => (i + 1) % phrases.length);
        setPhase('typing');
      });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    text,
    phase,
    phraseIdx,
    phrases,
    typingSpeed,
    deletingSpeed,
    pauseAtEndMs,
    pauseAtStartMs,
    reduced,
  ]);

  if (reduced) {
    return (
      <span className={className} style={style} data-testid="typewriter-rotator">
        {phrases[0] ?? ''}
      </span>
    );
  }

  return (
    <span
      data-testid="typewriter-rotator"
      className={className}
      style={style}
    >
      <span aria-hidden="true">
        {text}
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            marginLeft: '0.05em',
            animation: 'typewriter-cursor-blink 1s step-end infinite',
            color: 'inherit',
          }}
        >
          {cursor}
        </span>
      </span>
      {/* Visually hidden read-out for assistive tech — the joined phrase
          list gives screen readers the full intent in a single pass. */}
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        {phrases.join(' or ')}
      </span>
    </span>
  );
}
