import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import TrainingStateDisplay from './TrainingStateDisplay';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('TrainingStateDisplay — line reveal', () => {
  it('renders container with correct aria attributes', () => {
    render(<TrainingStateDisplay url="example.com" onComplete={vi.fn()} />);
    const container = screen.getByRole('log');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-label', 'Aiden training progress');
  });

  it('shows first line immediately (Scanning...)', () => {
    render(<TrainingStateDisplay url="example.com" onComplete={vi.fn()} />);
    expect(screen.getByText(/Scanning example\.com/i)).toBeInTheDocument();
  });

  it('calls onComplete after all lines reveal', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<TrainingStateDisplay url="example.com" onComplete={onComplete} />);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onComplete).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('TrainingStateDisplay — reduced-motion', () => {
  it('calls onComplete immediately when prefers-reduced-motion is set', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    const onComplete = vi.fn();
    render(<TrainingStateDisplay url="x.com" onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalled();
  });
});
