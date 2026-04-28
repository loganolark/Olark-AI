import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteSection from './QuoteSection';

describe('QuoteSection — initial trigger state', () => {
  it('renders the trigger card with "Build Your Quote" + tier-default headline (essentials)', () => {
    render(<QuoteSection tier="essentials" />);
    expect(screen.getByTestId('quote-trigger')).toBeInTheDocument();
    expect(screen.getByText(/Build Your Quote/i)).toBeInTheDocument();
    expect(screen.getByText(/Get a Custom Quote in 60 Seconds/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get My Custom Quote/i })).toBeInTheDocument();
  });

  it('uses the commercial-specific headline for tier="commercial"', () => {
    render(<QuoteSection tier="commercial" />);
    expect(screen.getByText(/Build a Commercial Quote/i)).toBeInTheDocument();
  });

  it('does not render the QuoteBuilder before expansion', () => {
    render(<QuoteSection tier="essentials" />);
    expect(screen.queryByTestId('quote-builder')).not.toBeInTheDocument();
  });

  it('respects custom headline + subhead props', () => {
    render(
      <QuoteSection
        tier="essentials"
        headline="Custom Headline"
        subhead="Custom subhead copy."
      />,
    );
    expect(screen.getByText('Custom Headline')).toBeInTheDocument();
    expect(screen.getByText('Custom subhead copy.')).toBeInTheDocument();
  });
});

describe('QuoteSection — expansion', () => {
  it('clicking "Get My Custom Quote" hides the trigger and reveals the QuoteBuilder', async () => {
    const user = userEvent.setup();
    render(<QuoteSection tier="essentials" />);
    await user.click(screen.getByRole('button', { name: /Get My Custom Quote/i }));
    expect(screen.queryByTestId('quote-trigger')).not.toBeInTheDocument();
    expect(screen.getByTestId('quote-builder')).toBeInTheDocument();
    // Company question is the first thing the builder shows
    expect(
      screen.getByRole('textbox', { name: /What is your company name/i }),
    ).toBeInTheDocument();
  });

  it('passes the right tier prop to the QuoteBuilder (advanced)', async () => {
    const user = userEvent.setup();
    render(<QuoteSection tier="advanced" />);
    await user.click(screen.getByRole('button', { name: /Get My Custom Quote/i }));
    // The QuoteBuilder always starts with the company text question regardless
    // of tier; tier-specific branching only kicks in after company is answered.
    // To prove the right tier prop was passed, complete `company` and check the
    // next question is "What will you primarily use Aiden for?" (advanced tree).
    await user.type(
      screen.getByRole('textbox', { name: /What is your company name/i }),
      'Acme',
    );
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    expect(
      await screen.findByText(/What will you primarily use Aiden for/i, undefined, {
        timeout: 1500,
      }),
    ).toBeInTheDocument();
  });
});

describe('QuoteSection — anchor + scroll target', () => {
  it('renders the section with id="quote-section" for nav anchor link', () => {
    const { container } = render(<QuoteSection tier="essentials" />);
    expect(container.querySelector('#quote-section')).not.toBeNull();
  });
});
