import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteSection from './QuoteSection';

describe('QuoteSection — initial trigger state (merged with former MidPageMeetingCTA copy)', () => {
  it('renders the trigger card with "Quote Builder" eyebrow + "Start Today" PillBadge + essentials merged headline', () => {
    render(<QuoteSection tier="essentials" />);
    expect(screen.getByTestId('quote-trigger')).toBeInTheDocument();
    // Eyebrow identifying the section type — matches the eyebrow pattern used
    // by every other section on the site ("What's Included", "Built For", etc.)
    expect(screen.getByText(/Quote Builder/i)).toBeInTheDocument();
    // Gold pulsing PillBadge below the eyebrow (carries the urgency that used
    // to live on the standalone MidPageMeetingCTA).
    expect(screen.getByText(/Start Today/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The Smartest First Step in AI Starts Here/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get My Custom Quote/i })).toBeInTheDocument();
  });

  it('uses the commercial merged headline ("Ready to Put Aiden to Work...") for tier="commercial"', () => {
    render(<QuoteSection tier="commercial" />);
    expect(
      screen.getByText(/Ready to Put Aiden to Work as Your Commercial Sales Engine/i),
    ).toBeInTheDocument();
  });

  it('uses the lead-gen merged headline for tier="advanced"', () => {
    render(<QuoteSection tier="advanced" />);
    expect(
      screen.getByText(/Put Aiden to Work as Your New Sales/i),
    ).toBeInTheDocument();
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
