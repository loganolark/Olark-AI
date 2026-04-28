import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import CommercialAidenQuote from './CommercialAidenQuote';

describe('CommercialAidenQuote', () => {
  it('renders the full quote text', () => {
    render(<CommercialAidenQuote />);
    const block = screen.getByTestId('commercial-aiden-quote');
    expect(block.textContent).toContain('Aiden does not replace the human moment.');
    expect(block.textContent).toContain('It sets it up for success.');
    expect(block.textContent).toContain(
      'When the rep takes over, they are arriving at a conversation',
    );
  });

  it('renders the gold-highlighted phrase as a styled span', () => {
    render(<CommercialAidenQuote />);
    const highlight = screen.getByText('It sets it up for success.');
    expect(highlight.tagName).toBe('SPAN');
    expect(highlight.style.color).toBe('var(--od-gold)');
    expect(highlight.style.fontWeight).toBe('700');
  });

  it('renders the cite attribution', () => {
    render(<CommercialAidenQuote />);
    const block = screen.getByTestId('commercial-aiden-quote');
    const cite = within(block).getByText(
      /From the Commercial Presales Desk at Olark/i,
    );
    expect(cite.tagName).toBe('CITE');
  });
});
