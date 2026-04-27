import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommercialPage from './page';

describe('CommercialPage — structure', () => {
  it('has exactly one <h1>', () => {
    render(<CommercialPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('hero h1 reads "Provable Pipeline. Full Signal Trail."', () => {
    render(<CommercialPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Provable Pipeline\. Full Signal Trail\./i }),
    ).toBeInTheDocument();
  });

  it('renders the "Commercial Tier" PillBadge in the hero', () => {
    render(<CommercialPage />);
    expect(screen.getByText(/Commercial Tier/i)).toBeInTheDocument();
  });
});

describe('CommercialPage — Crawl/Walk/Run timeline', () => {
  it('renders all three phase triggers with the AC-specified headlines', () => {
    render(<CommercialPage />);
    expect(
      screen.getByRole('button', { name: /Days 1–2.*Bot live on your site/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Weeks 2–3.*Custom conversation flows/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /Month 1.*Full CRM integration, signal trail active, rep intelligence dashboard live/i,
      }),
    ).toBeInTheDocument();
  });

  it('phases default to collapsed (aria-expanded="false")', () => {
    render(<CommercialPage />);
    const triggers = screen.getAllByRole('button');
    triggers.forEach((t) => expect(t).toHaveAttribute('aria-expanded', 'false'));
  });
});

describe('CommercialPage — capabilities', () => {
  it('lists the four required Commercial capabilities', () => {
    render(<CommercialPage />);
    // "Full signal trail" also appears in the hero h1 — use the longer capability copy to disambiguate.
    expect(screen.getByText(/Full signal trail — every visitor interaction logged/i)).toBeInTheDocument();
    expect(screen.getByText(/Rep intelligence brief/i)).toBeInTheDocument();
    expect(screen.getByText(/HubSpot CRM integration/i)).toBeInTheDocument();
    expect(screen.getByText(/Objection-handling flows/i)).toBeInTheDocument();
  });

  it('does NOT contain forbidden replacement language (NFR-T3)', () => {
    const { container } = render(<CommercialPage />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/replaces your SDR/i);
    expect(text).not.toMatch(/replaces your team/i);
    expect(text).not.toMatch(/AI closes for you/i);
  });
});

describe('CommercialPage — CTA', () => {
  it('primary CTA "Scope Your Build" routes to /get-started with Commercial-tier aria-label', () => {
    render(<CommercialPage />);
    const cta = screen.getByRole('link', { name: /Scope Your Build.*Commercial tier/i });
    expect(cta).toHaveAttribute('href', '/get-started');
  });
});
