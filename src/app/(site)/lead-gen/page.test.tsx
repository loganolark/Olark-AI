import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LeadGenPage from './page';

describe('LeadGenPage — structure', () => {
  it('has exactly one <h1>', () => {
    render(<LeadGenPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('hero h1 reads "Your Team Just Got an Extra SDR"', () => {
    render(<LeadGenPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Your Team Just Got an Extra SDR/i }),
    ).toBeInTheDocument();
  });

  it('renders the "Lead-Gen Tier" PillBadge in the hero', () => {
    render(<LeadGenPage />);
    expect(screen.getByText(/Lead-Gen Tier/i)).toBeInTheDocument();
  });
});

describe('LeadGenPage — featured TierCard', () => {
  it('renders the "Most Popular" pill (featured=true)', () => {
    render(<LeadGenPage />);
    expect(screen.getByText(/Most Popular/i)).toBeInTheDocument();
  });

  it('lists Lead-Gen-tier capabilities', () => {
    render(<LeadGenPage />);
    expect(screen.getByText(/Visitors qualified by company size/i)).toBeInTheDocument();
    expect(screen.getByText(/Handoff briefs/i)).toBeInTheDocument();
    expect(screen.getByText(/Pipeline-ready leads/i)).toBeInTheDocument();
  });

  it('primary CTA "Give Your Reps a Teammate" routes to /get-started with Lead-Gen-tier aria-label', () => {
    render(<LeadGenPage />);
    const cta = screen.getByRole('link', {
      name: /Give Your Reps a Teammate.*Lead-Gen tier/i,
    });
    expect(cta).toHaveAttribute('href', '/get-started');
  });
});

describe('LeadGenPage — rep section', () => {
  it('renders "All You Have to Do Is Eat." verbatim', () => {
    render(<LeadGenPage />);
    expect(
      screen.getByRole('heading', { name: /All You Have to Do Is Eat\./i }),
    ).toBeInTheDocument();
  });

  it('rep section uses Priya-voice copy describing her workflow', () => {
    render(<LeadGenPage />);
    expect(screen.getByText(/Monday morning, you open your queue/i)).toBeInTheDocument();
    expect(screen.getByText(/cold-opening conversations/i)).toBeInTheDocument();
  });

  it('does NOT contain forbidden replacement-language phrases (NFR-T3)', () => {
    const { container } = render(<LeadGenPage />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/replaces your team/i);
    expect(text).not.toMatch(/automates your sales/i);
    expect(text).not.toMatch(/AI closes for you/i);
  });
});

describe('LeadGenPage — Story 8.4 feature spotlights + meeting CTA', () => {
  it('renders all 3 FeatureSpotlight headings (Routing, Pipeline, Automation)', () => {
    render(<LeadGenPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: /Guide Every Conversation From the Start/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Turn Chats Into Sales Opportunities/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /Automate the Routine\. Elevate the Human\./i }),
    ).toBeInTheDocument();
  });

  it('renders representative pills from each spotlight', () => {
    render(<LeadGenPage />);
    expect(screen.getByText('Smart Routing')).toBeInTheDocument();
    expect(screen.getByText('Hot Handoff')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Base Answers')).toBeInTheDocument();
  });

  it('renders the MidPageMeetingCTA with the Lead-Gen title', () => {
    render(<LeadGenPage />);
    expect(
      screen.getByRole('heading', { level: 2, name: /Put Aiden to Work as Your New Sales/i }),
    ).toBeInTheDocument();
  });

  it('feature spotlights render before the rep section in the DOM', () => {
    render(<LeadGenPage />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    const routingIdx = headings.findIndex((t) =>
      /Guide Every Conversation From the Start/i.test(t ?? ''),
    );
    const repIdx = headings.findIndex((t) => /All You Have to Do Is Eat/i.test(t ?? ''));
    expect(routingIdx).toBeGreaterThan(-1);
    expect(repIdx).toBeGreaterThan(routingIdx);
  });
});
