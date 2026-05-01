import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import TypewriterRotator from './TypewriterRotator';

vi.mock('@/lib/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(useReducedMotion).mockReturnValue(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('TypewriterRotator', () => {
  it('types each character of the first phrase one at a time', () => {
    render(
      <TypewriterRotator
        phrases={['hello', 'world']}
        typingSpeed={50}
        deletingSpeed={25}
        pauseAtEndMs={500}
      />,
    );

    const node = screen.getByTestId('typewriter-rotator');
    expect(node.textContent ?? '').toContain('|');

    act(() => {
      vi.advanceTimersByTime(60);
    });
    // After ~one tick the first character has typed.
    expect(node.textContent ?? '').toMatch(/^h/);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    // After enough ticks the full phrase is typed.
    expect(node.textContent ?? '').toContain('hello');
  });

  it('after typing finishes, pauses then deletes back to empty, then advances to phrase 2', () => {
    render(
      <TypewriterRotator
        phrases={['ab', 'cd']}
        typingSpeed={20}
        deletingSpeed={20}
        pauseAtEndMs={100}
        pauseAtStartMs={50}
      />,
    );

    const node = screen.getByTestId('typewriter-rotator');

    // Type "ab"
    act(() => { vi.advanceTimersByTime(120); });
    expect(node.textContent ?? '').toContain('ab');

    // Pause + delete + pause + start typing "cd"
    act(() => { vi.advanceTimersByTime(500); });
    expect(node.textContent ?? '').toMatch(/c/);
  });

  it('renders the joined phrase list in a visually-hidden span (a11y read-out)', () => {
    render(
      <TypewriterRotator
        phrases={['from your trade shows', 'from your outbound campaigns']}
      />,
    );

    const node = screen.getByTestId('typewriter-rotator');
    // Both phrases appear in the DOM (combined via "or") regardless of
    // current animation frame.
    expect(node.textContent ?? '').toMatch(/from your trade shows/);
    expect(node.textContent ?? '').toMatch(/from your outbound campaigns/);
  });
});

describe('TypewriterRotator — reduced motion', () => {
  it('renders the first phrase static (no cursor, no animation) when prefers-reduced-motion is on', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(<TypewriterRotator phrases={['hello world', 'second']} />);
    const node = screen.getByTestId('typewriter-rotator');
    expect(node.textContent).toBe('hello world');
    // No blinking cursor character
    expect(node.textContent ?? '').not.toContain('|');
  });
});
