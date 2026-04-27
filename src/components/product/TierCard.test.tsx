import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TierCard from './TierCard';

const baseProps = {
  headline: 'Smart Chat, Ready in Minutes',
  tagline: 'Live in 48 hours.',
  capabilities: ['One-click install', 'Pre-trained on your FAQs'],
  ctaHref: '/get-started',
  ctaLabel: 'Get Started Today →',
};

// JSDOM normalizes inline `style.background` hex colors to rgb() — assert against rgb form.
describe('TierCard — gradient variants', () => {
  it('renders the gold gradient strip for tier="essentials"', () => {
    const { container } = render(<TierCard tier="essentials" {...baseProps} />);
    const strip = container.querySelector('.tier-card__gradient-strip') as HTMLElement;
    expect(strip).not.toBeNull();
    expect(strip.style.background).toContain('rgb(245, 194, 0)'); // #F5C200
    expect(strip.style.background).toContain('rgb(255, 213, 51)'); // #FFD533
  });

  it('renders the pink gradient strip for tier="lead-gen"', () => {
    const { container } = render(<TierCard tier="lead-gen" {...baseProps} />);
    const strip = container.querySelector('.tier-card__gradient-strip') as HTMLElement;
    expect(strip.style.background).toContain('rgb(232, 50, 90)'); // #E8325A
    expect(strip.style.background).toContain('rgb(255, 107, 138)'); // #FF6B8A
  });

  it('renders the teal gradient strip for tier="commercial"', () => {
    const { container } = render(<TierCard tier="commercial" {...baseProps} />);
    const strip = container.querySelector('.tier-card__gradient-strip') as HTMLElement;
    expect(strip.style.background).toContain('rgb(0, 212, 170)'); // #00D4AA
    expect(strip.style.background).toContain('rgb(0, 236, 189)'); // #00ECBD
  });
});

describe('TierCard — structure and a11y', () => {
  it('has role="article"', () => {
    render(<TierCard tier="essentials" {...baseProps} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('uses the .tier-card class so global hover styles apply', () => {
    const { container } = render(<TierCard tier="essentials" {...baseProps} />);
    expect(container.querySelector('.tier-card')).not.toBeNull();
  });

  it('renders all capabilities as list items', () => {
    render(
      <TierCard
        tier="essentials"
        {...baseProps}
        capabilities={['Cap A', 'Cap B', 'Cap C']}
      />,
    );
    expect(screen.getByText('Cap A')).toBeInTheDocument();
    expect(screen.getByText('Cap B')).toBeInTheDocument();
    expect(screen.getByText('Cap C')).toBeInTheDocument();
  });

  it('renders the headline and tagline', () => {
    render(
      <TierCard
        tier="essentials"
        {...baseProps}
        headline="Custom Headline"
        tagline="Custom tagline copy."
      />,
    );
    expect(screen.getByRole('heading', { name: /Custom Headline/i })).toBeInTheDocument();
    expect(screen.getByText(/Custom tagline copy/i)).toBeInTheDocument();
  });
});

describe('TierCard — featured variant', () => {
  it('renders the "Most Popular" pill above the card when featured=true', () => {
    render(<TierCard tier="lead-gen" featured {...baseProps} />);
    expect(screen.getByText(/Most Popular/i)).toBeInTheDocument();
  });

  it('does NOT render the "Most Popular" pill when featured is omitted', () => {
    render(<TierCard tier="lead-gen" {...baseProps} />);
    expect(screen.queryByText(/Most Popular/i)).not.toBeInTheDocument();
  });
});

describe('TierCard — CTA aria-label', () => {
  it('CTA aria-label includes the Lead-Gen tier display name', () => {
    render(<TierCard tier="lead-gen" featured {...baseProps} />);
    expect(
      screen.getByRole('link', { name: /Lead-Gen tier/i }),
    ).toBeInTheDocument();
  });

  it('CTA aria-label includes the Essentials tier display name', () => {
    render(<TierCard tier="essentials" {...baseProps} />);
    expect(
      screen.getByRole('link', { name: /Essentials tier/i }),
    ).toBeInTheDocument();
  });

  it('CTA aria-label includes the Commercial tier display name', () => {
    render(<TierCard tier="commercial" {...baseProps} />);
    expect(
      screen.getByRole('link', { name: /Commercial tier/i }),
    ).toBeInTheDocument();
  });

  it('CTA href routes to the provided ctaHref', () => {
    render(<TierCard tier="essentials" {...baseProps} ctaHref="/get-started" />);
    expect(
      screen.getByRole('link', { name: /Essentials tier/i }),
    ).toHaveAttribute('href', '/get-started');
  });
});
