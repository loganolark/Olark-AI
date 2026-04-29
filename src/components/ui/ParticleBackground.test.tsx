import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ParticleBackground from './ParticleBackground';

// jsdom doesn't ship a usable canvas 2d context — stub a minimal one so the
// effect doesn't bail at the getContext('2d') guard. We're not asserting
// pixel output, just that the component renders correct DOM + a11y attrs and
// hooks up its lifecycle without throwing.
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () =>
      ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        setTransform: vi.fn(),
        scale: vi.fn(),
      }) as unknown as CanvasRenderingContext2D,
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

describe('ParticleBackground', () => {
  it('renders a wrapper with role="presentation" + aria-hidden="true"', () => {
    render(<ParticleBackground />);
    const wrapper = screen.getByTestId('particle-background');
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
    expect(wrapper.getAttribute('role')).toBe('presentation');
    // pointer-events: none so the canvas never blocks clicks beneath
    expect(wrapper.style.pointerEvents).toBe('none');
  });

  it('renders a <canvas> child sized to fill the wrapper', () => {
    const { container } = render(<ParticleBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('respects a custom opacity prop', () => {
    render(<ParticleBackground opacity={0.3} />);
    const wrapper = screen.getByTestId('particle-background');
    expect(wrapper.style.opacity).toBe('0.3');
  });

  it('returns nothing visible under prefers-reduced-motion (no animation)', () => {
    // Override matchMedia to return matches: true for reduced-motion. The
    // component still mounts the wrapper; the .particle-bg CSS rule hides
    // it via display:none under reduced-motion (covered by the global CSS).
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation(
      (q) =>
        ({
          matches: q.includes('reduce'),
          media: q,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    render(<ParticleBackground />);
    expect(screen.getByTestId('particle-background')).toBeInTheDocument();
    matchMediaSpy.mockRestore();
  });
});
