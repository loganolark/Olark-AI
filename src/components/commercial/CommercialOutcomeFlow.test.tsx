import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommercialOutcomeFlow from './CommercialOutcomeFlow';

vi.mock('@/lib/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('@/lib/hooks/use-in-view', () => ({
  useInView: vi.fn(() => true),
}));

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useInView } from '@/lib/hooks/use-in-view';

describe('CommercialOutcomeFlow', () => {
  it('renders section label, headline, and intro', () => {
    render(<CommercialOutcomeFlow />);
    expect(screen.getByText('The Outcome')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /What This Looks Like in Practice/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /One prospect\. One interaction\. A fully automated path/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders 5 flow steps in correct order with correct emojis and titles', () => {
    render(<CommercialOutcomeFlow />);
    const steps = screen.getAllByTestId('commercial-flow-step');
    expect(steps).toHaveLength(5);

    const expectedTitles = [
      'A prospect clicks an email',
      'The bot qualifies intent',
      'Smart routing kicks in',
      'The rep takes over, fully briefed',
      'The CRM updates itself',
    ];
    const expectedIcons = ['📧', '🤖', '🔀', '🤝', '📊'];

    steps.forEach((step, i) => {
      expect(step.textContent).toContain(expectedTitles[i]);
      expect(step.textContent).toContain(expectedIcons[i]);
    });
  });

  it('renders the outcome-summary panel with h3 and 6 bullets', () => {
    render(<CommercialOutcomeFlow />);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /SDR Prep Is Nearly Eliminated\./i,
      }),
    ).toBeInTheDocument();
    const summary = screen.getByTestId('commercial-outcome-summary');
    const bullets = summary.querySelectorAll('li');
    expect(bullets).toHaveLength(6);
    const bulletTexts = Array.from(bullets).map(
      (b) => b.querySelector('span:last-child')?.textContent,
    );
    expect(bulletTexts).toEqual([
      'No missed context at handoff, ever',
      'No dead ends for customers mid-conversation',
      'No CRM gaps from manual entry failures',
      'Faster speed-to-lead',
      'Reps spend more time closing, less time context-switching',
      'Every conversation ends in a pipeline action',
    ]);
  });

  it('applies static state under reduced-motion (even when not yet in view)', () => {
    vi.mocked(useInView).mockReturnValueOnce(false);
    vi.mocked(useReducedMotion).mockReturnValueOnce(true);
    render(<CommercialOutcomeFlow />);
    const steps = screen.getAllByTestId('commercial-flow-step');
    steps.forEach((s) => {
      expect(s.style.opacity).toBe('1');
      expect(s.style.transform).toBe('translateY(0)');
    });
  });
});
