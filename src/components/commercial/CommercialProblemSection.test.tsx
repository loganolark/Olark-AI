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
  it('renders the "expensive digital filing cabinets" blockquote with italicised emphasis', () => {
    render(<CommercialProblemSection />);
    const quote = screen.getByTestId('commercial-problem-quote');
    expect(quote.textContent).toContain('Most B2B sites are');
    expect(quote.textContent).toContain('expensive digital filing');
    const em = within(quote).getByText(/expensive digital filing/);
    expect(em.tagName).toBe('EM');
  });

  it('renders the 3 industrial-supplier problem cards (Steel King archetype) in order', () => {
    render(<CommercialProblemSection />);
    const cards = screen.getAllByTestId('commercial-problem-signal');
    expect(cards).toHaveLength(3);
    expect(cards[0].textContent).toContain('Filtering Real Projects from Tire-Kickers');
    expect(cards[0].textContent).toContain('Qualification');
    expect(cards[1].textContent).toContain('Capturing the Spec Without Losing It in Translation');
    expect(cards[1].textContent).toContain('Spec');
    expect(cards[2].textContent).toContain('Routing to the Right Dealer, Not the Wrong Region');
    expect(cards[2].textContent).toContain('Dealer Network');
  });

  it('renders the summary line referencing the dead Contact Us form', () => {
    render(<CommercialProblemSection />);
    expect(
      screen.getByText(/Three pain points the dead Contact Us form was never going to fix\./i),
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
