import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from './page';

describe('HomePage — How It Works section', () => {
  it('renders section heading', () => {
    render(<HomePage />);
    expect(screen.getByText(/How Aiden Works for Your Team/i)).toBeInTheDocument();
  });

  it('renders Essentials tier card with Learn more link', () => {
    render(<HomePage />);
    expect(screen.getByText('Essentials')).toBeInTheDocument();
    const essentialsLink = screen.getAllByRole('link', { name: /Learn more/i })[0];
    expect(essentialsLink).toHaveAttribute('href', '/essentials');
  });

  it('renders Lead-Gen tier card', () => {
    render(<HomePage />);
    expect(screen.getByText('Lead-Gen')).toBeInTheDocument();
  });

  it('renders Commercial tier card', () => {
    render(<HomePage />);
    expect(screen.getByText('Commercial')).toBeInTheDocument();
  });
});

describe('HomePage — Persona tab switcher (replaces Before/With rep duo)', () => {
  it('renders the PersonaTabSwitcher with all 3 role tabs', () => {
    render(<HomePage />);
    expect(screen.getByTestId('persona-tab-switcher')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^SDR$/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^RevOps Director$/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^VP of Sales$/ })).toBeInTheDocument();
  });

  it('SDR tab is the default-active persona, with "All You Have to Do Is Eat." headline', () => {
    render(<HomePage />);
    expect(screen.getByTestId('persona-panel-sdr')).toBeInTheDocument();
    expect(screen.getByText(/All You Have to Do Is Eat\./i)).toBeInTheDocument();
  });

  it('SDR persona body uses second-person voice ("you walk in briefed")', () => {
    render(<HomePage />);
    expect(screen.getByText(/Monday morning, you open your queue/i)).toBeInTheDocument();
    expect(screen.getByText(/You walk in briefed/i)).toBeInTheDocument();
  });

  it('does NOT render the old Before/With Aiden duo', () => {
    const { container } = render(<HomePage />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/Before Aiden/i);
    // "With Aiden" is generic enough to hit elsewhere; the unique tell of the
    // old layout was the side-by-side eyebrow style around the duo.
    expect(text).not.toMatch(/45-minute discovery calls/i);
  });
});

describe('HomePage — Final CTA (replaces former 3-button CTA bridge)', () => {
  it('renders the "Still Not Sure" headline', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 2, name: /Still Not Sure Which Tier Fits/i }),
    ).toBeInTheDocument();
  });

  it('renders a single primary CTA pointing at the in-page quiz anchor', () => {
    render(<HomePage />);
    const quizCtas = screen.getAllByRole('link', { name: /Take the 60-Second Quiz/i });
    // Hero secondary CTA + final-section primary CTA both point at #quiz — that's intentional reinforcement.
    expect(quizCtas.length).toBeGreaterThanOrEqual(2);
    quizCtas.forEach((cta) => expect(cta).toHaveAttribute('href', '#quiz'));
  });

  it('does NOT render the old 3-button tier-specific CTA bridge', () => {
    render(<HomePage />);
    expect(screen.queryByRole('link', { name: /Start Today, See Results This Week/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Give Your Reps a Teammate/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Build Your Full Pipeline Signal/i })).toBeNull();
  });
});

describe('HomePage — Placeholders', () => {
  it('renders URL demo widget section (loading state while JS loads)', () => {
    render(<HomePage />);
    // next/dynamic with ssr:false renders the loading prop in tests; loading prop shows this text
    expect(screen.getByText(/Loading demo/i)).toBeInTheDocument();
  });

  it('renders Path Finder Quiz section', () => {
    render(<HomePage />);
    // PathFinderQuiz mounts the first question's radiogroup once hydrated.
    expect(screen.getByRole('radiogroup', { name: /How big is your company/i })).toBeInTheDocument();
  });
});
