import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeatureSpotlight from './FeatureSpotlight';

const baseProps = {
  label: 'Routing',
  title: 'Guide Every Conversation From the Start',
  paragraphs: ['Para one.', 'Para two.'],
  pills: [
    { label: 'Smart Routing' },
    { label: 'Self-Selection', variant: 'pink' as const },
    { label: 'Zero Manual Triage', variant: 'muted' as const },
  ],
};

describe('FeatureSpotlight', () => {
  it('renders the label, title, and both paragraphs', () => {
    render(<FeatureSpotlight {...baseProps} />);
    expect(screen.getByText('Routing')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Guide Every Conversation From the Start/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Para one.')).toBeInTheDocument();
    expect(screen.getByText('Para two.')).toBeInTheDocument();
  });

  it('renders all pills', () => {
    render(<FeatureSpotlight {...baseProps} />);
    expect(screen.getByText('Smart Routing')).toBeInTheDocument();
    expect(screen.getByText('Self-Selection')).toBeInTheDocument();
    expect(screen.getByText('Zero Manual Triage')).toBeInTheDocument();
  });

  it('renders a placeholder when no graphic is provided', () => {
    render(<FeatureSpotlight {...baseProps} />);
    expect(screen.getByText(/Visual coming soon/i)).toBeInTheDocument();
  });

  it('applies the pink label variant when labelVariant="pink"', () => {
    const { container } = render(
      <FeatureSpotlight {...baseProps} labelVariant="pink" />,
    );
    const label = container.querySelector('[data-feature-label]') as HTMLElement;
    expect(label).not.toBeNull();
    expect(label.style.color).toBe('var(--od-pink)');
  });

  it('applies the gold label variant by default', () => {
    const { container } = render(<FeatureSpotlight {...baseProps} />);
    const label = container.querySelector('[data-feature-label]') as HTMLElement;
    expect(label.style.color).toBe('var(--od-gold)');
  });

  it('renders ReactNode paragraphs (e.g. with <strong>)', () => {
    render(
      <FeatureSpotlight
        {...baseProps}
        paragraphs={[
          <>
            Plain text and <strong>bold phrase</strong> and tail.
          </>,
        ]}
        pills={[]}
      />,
    );
    expect(screen.getByText('bold phrase').tagName).toBe('STRONG');
  });
});
