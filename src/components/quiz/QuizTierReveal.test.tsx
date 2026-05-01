import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizTierReveal from './QuizTierReveal';

describe('QuizTierReveal', () => {
  // /essentials and /lead-gen were collapsed into /commercial when the site
  // pivoted to an industrial-supplier narrative — the "details" CTA for the
  // SMB tiers now points at the unified product page.
  it('renders Essentials headline and routes the details CTA to /commercial', () => {
    render(<QuizTierReveal tierSignal="essentials" />);
    expect(
      screen.getByRole('heading', { name: /Based on what you told us: Essentials/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Let.s scope your build/i }),
    ).toHaveAttribute('href', '/get-started');
    expect(
      screen.getByRole('link', { name: /See Essentials details/i }),
    ).toHaveAttribute('href', '/commercial');
  });

  it('renders Lead-Gen headline and routes the details CTA to /commercial', () => {
    render(<QuizTierReveal tierSignal="lead_gen" />);
    expect(
      screen.getByRole('heading', { name: /Based on what you told us: Lead-Gen/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /See Lead-Gen details/i }),
    ).toHaveAttribute('href', '/commercial');
  });

  it('renders Commercial headline and CTA link to /commercial', () => {
    render(<QuizTierReveal tierSignal="commercial" />);
    expect(
      screen.getByRole('heading', { name: /Based on what you told us: Commercial/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /See Commercial details/i }),
    ).toHaveAttribute('href', '/commercial');
  });

  it('fires onScopeClick when the primary CTA is clicked', async () => {
    const user = userEvent.setup();
    const onScopeClick = vi.fn();
    render(<QuizTierReveal tierSignal="commercial" onScopeClick={onScopeClick} />);
    await user.click(screen.getByRole('link', { name: /Let.s scope your build/i }));
    expect(onScopeClick).toHaveBeenCalledTimes(1);
  });

  it('fires onTierDetailsClick when the secondary CTA is clicked', async () => {
    const user = userEvent.setup();
    const onTierDetailsClick = vi.fn();
    render(
      <QuizTierReveal
        tierSignal="commercial"
        onTierDetailsClick={onTierDetailsClick}
      />,
    );
    await user.click(screen.getByRole('link', { name: /See Commercial details/i }));
    expect(onTierDetailsClick).toHaveBeenCalledTimes(1);
  });

  it('renders a back button when onBack is provided', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<QuizTierReveal tierSignal="commercial" onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
