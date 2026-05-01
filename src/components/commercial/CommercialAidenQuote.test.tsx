import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import CommercialAidenQuote from './CommercialAidenQuote';

describe('CommercialAidenQuote', () => {
  it('renders the full heritage quote text', () => {
    render(<CommercialAidenQuote />);
    const block = screen.getByTestId('commercial-aiden-quote');
    expect(block.textContent).toContain(
      '17 years building live chat taught us one thing',
    );
    expect(block.textContent).toContain('AI just makes it sharper.');
    expect(block.textContent).toContain('Aiden scans your catalog continuously');
  });

  it('renders the gold-highlighted phrase as a styled span', () => {
    render(<CommercialAidenQuote />);
    const highlight = screen.getByText('AI just makes it sharper.');
    expect(highlight.tagName).toBe('SPAN');
    expect(highlight.style.color).toBe('var(--od-gold)');
    expect(highlight.style.fontWeight).toBe('700');
  });

  it('renders the cite attribution', () => {
    render(<CommercialAidenQuote />);
    const block = screen.getByTestId('commercial-aiden-quote');
    const cite = within(block).getByText(/The Aiden by Olark team/i);
    expect(cite.tagName).toBe('CITE');
  });
});
