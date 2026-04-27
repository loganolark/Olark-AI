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

describe('HomePage — Rep section', () => {
  it('renders "All You Have to Do Is Eat." verbatim', () => {
    render(<HomePage />);
    expect(screen.getByText(/All You Have to Do Is Eat\./i)).toBeInTheDocument();
  });

  it('rep section uses second-person copy', () => {
    render(<HomePage />);
    // Target the rep section "With Aiden" copy (em-dash), not the Lead-Gen tier card (period)
    expect(screen.getByText(/Your leads arrive with a context brief —/i)).toBeInTheDocument();
  });
});

describe('HomePage — CTA bridge', () => {
  it('renders tier-specific CTA links', () => {
    render(<HomePage />);
    expect(screen.getByRole('link', { name: /Start Today, See Results This Week/i })).toHaveAttribute('href', '/essentials');
    expect(screen.getByRole('link', { name: /Give Your Reps a Teammate/i })).toHaveAttribute('href', '/lead-gen');
    expect(screen.getByRole('link', { name: /Build Your Full Pipeline Signal/i })).toHaveAttribute('href', '/commercial');
  });
});

describe('HomePage — Placeholders', () => {
  it('renders URL demo placeholder section', () => {
    render(<HomePage />);
    expect(screen.getByText(/See Aiden on Your Site →/i)).toBeInTheDocument();
  });

  it('renders quiz placeholder section', () => {
    render(<HomePage />);
    // Hero CTA button also says "Find Your Tier →"; target the heading specifically
    expect(screen.getByRole('heading', { name: /Find Your Tier →/i })).toBeInTheDocument();
  });
});
