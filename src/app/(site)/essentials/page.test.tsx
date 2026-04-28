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
    const { container } = render(<EssentialsPage />);
    // Story 8.4 added EssentialsFeatureGroups with feature-card <article>s, so
    // scope to the TierCard's class explicitly rather than getByRole('article').
    expect(container.querySelector('article.tier-card')).not.toBeNull();
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

describe('EssentialsPage — Story 8.4 content expansion', () => {
  it('renders the EssentialsFeatureGroups section with all 3 group labels', () => {
    render(<EssentialsPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: /Everything You Need to Start Smart/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Training')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Usage & Reporting')).toBeInTheDocument();
  });

  it('renders the SupportPromise section', () => {
    render(<EssentialsPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: /You.re Never on Your Own/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Support That Comes Standard/i }),
    ).toBeInTheDocument();
  });

  it('renders the MidPageMeetingCTA with the Essentials title', () => {
    render(<EssentialsPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: /The Smartest First Step in AI Starts Here/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Schedule to Learn More About Aiden/i }),
    ).toHaveAttribute('href', '/get-started');
  });

  it('renders new sections in the correct DOM order: feature groups → support promise → meeting CTA', () => {
    render(<EssentialsPage />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    const featuresIdx = headings.findIndex((t) => /Everything You Need to Start Smart/i.test(t ?? ''));
    const supportIdx = headings.findIndex((t) => /You.re Never on Your Own/.test(t ?? ''));
    const meetingIdx = headings.findIndex((t) =>
      /The Smartest First Step in AI Starts Here/i.test(t ?? ''),
    );
    expect(featuresIdx).toBeGreaterThan(-1);
    expect(supportIdx).toBeGreaterThan(featuresIdx);
    expect(meetingIdx).toBeGreaterThan(supportIdx);
  });
});
