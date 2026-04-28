import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import CommercialProblemSection from './CommercialProblemSection';

vi.mock('@/lib/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('@/lib/hooks/use-in-view', () => ({
  useInView: vi.fn(() => true),
}));

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useInView } from '@/lib/hooks/use-in-view';

describe('CommercialProblemSection', () => {
  it('renders the blockquote with italicized "before"', () => {
    render(<CommercialProblemSection />);
    const quote = screen.getByTestId('commercial-problem-quote');
    expect(quote.textContent).toContain(
      'How much of your team’s day is spent on work that happens',
    );
    expect(quote.textContent).toContain('before');
    const em = within(quote).getByText('before');
    expect(em.tagName).toBe('EM');
  });

  it('renders all 3 problem-signal cards in correct order with correct tags', () => {
    render(<CommercialProblemSection />);
    const cards = screen.getAllByTestId('commercial-problem-signal');
    expect(cards).toHaveLength(3);
    expect(cards[0].textContent).toContain('Pre-Chat CRM Lookup');
    expect(cards[0].textContent).toContain('Time Lost');
    expect(cards[1].textContent).toContain('Routing to the Right Rep');
    expect(cards[1].textContent).toContain('Misdirected');
    expect(cards[2].textContent).toContain('Missing Context at Handoff');
    expect(cards[2].textContent).toContain('Zero Context');
  });

  it('renders the summary line with the friction-points text', () => {
    render(<CommercialProblemSection />);
    expect(
      screen.getByText(/3 friction points before the rep says a single word\./i),
    ).toBeInTheDocument();
  });

  it('applies static state under reduced-motion (even when not yet in view)', () => {
    vi.mocked(useInView).mockReturnValueOnce(false);
    vi.mocked(useReducedMotion).mockReturnValueOnce(true);
    render(<CommercialProblemSection />);
    const cards = screen.getAllByTestId('commercial-problem-signal');
    cards.forEach((c) => {
      expect(c.style.opacity).toBe('1');
      expect(c.style.transform).toBe('translateY(0)');
    });
  });
});
