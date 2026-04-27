import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EssentialsPage from './page';

describe('EssentialsPage — structure', () => {
  it('has exactly one <h1>', () => {
    render(<EssentialsPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('hero h1 reads "Smart Chat, Ready in Minutes"', () => {
    render(<EssentialsPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Smart Chat, Ready in Minutes/i }),
    ).toBeInTheDocument();
  });

  it('renders the "Essentials Tier" PillBadge', () => {
    render(<EssentialsPage />);
    expect(screen.getByText(/Essentials Tier/i)).toBeInTheDocument();
  });
});

describe('EssentialsPage — TierCard', () => {
  it('renders the TierCard with role="article"', () => {
    render(<EssentialsPage />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('lists Essentials-tier capabilities', () => {
    render(<EssentialsPage />);
    expect(screen.getByText(/One-click install/i)).toBeInTheDocument();
    expect(screen.getByText(/Live in 48 hours, not 6 months/i)).toBeInTheDocument();
    expect(screen.getByText(/Self-serve dashboard/i)).toBeInTheDocument();
  });

  it('does NOT list cross-tier capabilities or upgrade language', () => {
    render(<EssentialsPage />);
    expect(screen.queryByText(/upgrade available/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/full pipeline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/most popular/i)).not.toBeInTheDocument();
  });
});

describe('EssentialsPage — CTAs', () => {
  it('primary CTA "Get Started Today" routes to /get-started with Essentials-tier aria-label', () => {
    render(<EssentialsPage />);
    const cta = screen.getByRole('link', { name: /Get Started Today.*Essentials tier/i });
    expect(cta).toHaveAttribute('href', '/get-started');
  });

  it('secondary "See Lead-Gen →" link routes to /lead-gen', () => {
    render(<EssentialsPage />);
    const link = screen.getByRole('link', { name: /See Lead-Gen/i });
    expect(link).toHaveAttribute('href', '/lead-gen');
  });
});
