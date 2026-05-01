import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizTierReveal from './QuizTierReveal';

// After the industrial-supplier pivot the homepage quiz speaks plan-level
// (Signature / Bespoke). The legacy `tierSignal` prop is still accepted (for
// HubSpot enum compatibility) but is rendered hidden — the visible
// recommendation comes from the new `recommendedPlan` prop.

describe('QuizTierReveal — Signature plan recommendation', () => {
  it('renders the Aiden Signature headline and routes the details CTA to /commercial', () => {
    render(
      <QuizTierReveal tierSignal="commercial" recommendedPlan="signature" />,
    );
    expect(
      screen.getByRole('heading', { name: /Based on what you told us: Aiden Signature/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Let.s scope your build/i }),
    ).toHaveAttribute('href', '/get-started');
    expect(
      screen.getByRole('link', { name: /See Aiden Signature details/i }),
    ).toHaveAttribute('href', '/commercial');
  });
});

describe('QuizTierReveal — Bespoke plan recommendation', () => {
  it('renders the Aiden Bespoke headline and routes the details CTA to /commercial', () => {
    render(
      <QuizTierReveal tierSignal="commercial" recommendedPlan="bespoke" />,
    );
    expect(
      screen.getByRole('heading', { name: /Based on what you told us: Aiden Bespoke/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /See Aiden Bespoke details/i }),
    ).toHaveAttribute('href', '/commercial');
  });
});

describe('QuizTierReveal — band signal still surfaced for analytics', () => {
  it('exposes the band-level label hidden in DOM under data-testid="quiz-tier-band"', () => {
    render(
      <QuizTierReveal tierSignal="commercial" recommendedPlan="signature" />,
    );
    const band = screen.getByTestId('quiz-tier-band');
    expect(band.getAttribute('data-tier-signal')).toBe('commercial');
    expect(band.textContent).toMatch(/Commercial/i);
  });
});

describe('QuizTierReveal — interactions', () => {
  it('fires onScopeClick when the primary CTA is clicked', async () => {
    const user = userEvent.setup();
    const onScopeClick = vi.fn();
    render(
      <QuizTierReveal
        tierSignal="commercial"
        recommendedPlan="signature"
        onScopeClick={onScopeClick}
      />,
    );
    await user.click(screen.getByRole('link', { name: /Let.s scope your build/i }));
    expect(onScopeClick).toHaveBeenCalledTimes(1);
  });

  it('fires onTierDetailsClick when the secondary CTA is clicked', async () => {
    const user = userEvent.setup();
    const onTierDetailsClick = vi.fn();
    render(
      <QuizTierReveal
        tierSignal="commercial"
        recommendedPlan="bespoke"
        onTierDetailsClick={onTierDetailsClick}
      />,
    );
    await user.click(screen.getByRole('link', { name: /See Aiden Bespoke details/i }));
    expect(onTierDetailsClick).toHaveBeenCalledTimes(1);
  });

  it('renders a back button when onBack is provided', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(
      <QuizTierReveal
        tierSignal="commercial"
        recommendedPlan="signature"
        onBack={onBack}
      />,
    );
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
