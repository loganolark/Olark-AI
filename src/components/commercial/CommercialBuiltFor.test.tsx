import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommercialBuiltFor from './CommercialBuiltFor';

vi.mock('@/lib/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('@/lib/hooks/use-in-view', () => ({
  useInView: vi.fn(() => true),
}));

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useInView } from '@/lib/hooks/use-in-view';

describe('CommercialBuiltFor', () => {
  it('renders section label and headline (with line break)', () => {
    render(<CommercialBuiltFor />);
    expect(screen.getByText('Built For')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toContain('This Is a Commercial Product.');
    expect(heading.textContent).toContain('Here’s Who We Built It For.');
  });

  it('renders 3 who-cards with correct icons and titles', () => {
    render(<CommercialBuiltFor />);
    const cards = screen.getAllByTestId('commercial-who-card');
    expect(cards).toHaveLength(3);
    expect(cards[0].textContent).toContain('🗺️');
    expect(cards[0].textContent).toContain('Regional Sales Teams');
    expect(cards[1].textContent).toContain('🏆');
    expect(cards[1].textContent).toContain(
      'High-Value, High-Consideration Products',
    );
    expect(cards[2].textContent).toContain('⚙️');
    expect(cards[2].textContent).toContain('Live Chat at Scale');
  });

  it('applies static state under reduced-motion (even when not yet in view)', () => {
    vi.mocked(useInView).mockReturnValueOnce(false);
    vi.mocked(useReducedMotion).mockReturnValueOnce(true);
    render(<CommercialBuiltFor />);
    const cards = screen.getAllByTestId('commercial-who-card');
    cards.forEach((c) => {
      expect(c.style.opacity).toBe('1');
      expect(c.style.transform).toBe('translateY(0)');
    });
  });
});
