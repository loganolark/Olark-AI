import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommercialHowItWorks from './CommercialHowItWorks';

vi.mock('@/lib/hooks/use-reduced-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('@/lib/hooks/use-in-view', () => ({
  useInView: vi.fn(() => true),
}));

import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { useInView } from '@/lib/hooks/use-in-view';

describe('CommercialHowItWorks', () => {
  it('renders section label, headline, and intro', () => {
    render(<CommercialHowItWorks />);
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Seven Steps From Spec Question to Logged Pipeline/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Aiden runs the full intake-to-handoff workflow for industrial supply/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders all 7 step cards in correct numeric order (01–07)', () => {
    render(<CommercialHowItWorks />);
    const cards = screen.getAllByTestId('commercial-step-card');
    expect(cards).toHaveLength(7);
    const numbers = cards.map((c) => c.getAttribute('data-step-num'));
    expect(numbers).toEqual(['01', '02', '03', '04', '05', '06', '07']);
  });

  it('renders 3 phase labels with correct names', () => {
    render(<CommercialHowItWorks />);
    expect(
      screen.getByText(/Phase 1 — Catalog & Triage/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Phase 2 — Routing & Handoff/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Phase 3 — CRM Logged/i)).toBeInTheDocument();
  });

  it('applies phase-color tags to each step (g1/g2/g3)', () => {
    render(<CommercialHowItWorks />);
    const cards = screen.getAllByTestId('commercial-step-card');
    const phases = cards.map((c) => c.getAttribute('data-phase'));
    expect(phases).toEqual(['1', '1', '1', '2', '2', '2', '3']);
  });

  it('renders all 7 step titles in order', () => {
    render(<CommercialHowItWorks />);
    expect(
      screen.getByText('Aiden Scans Your Site Continuously'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Filter the Spec Question from the Sales Question'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Capture the Specs That Define the Deal'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Pull the Account Record in Real Time'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Send the Lead to the Right Region or Distributor'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Arm the Rep With the Spec Sheet, Not Just a Name'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Update Your CRM Without Lifting a Finger'),
    ).toBeInTheDocument();
  });

  it('applies static state under reduced-motion (even when not yet in view)', () => {
    vi.mocked(useInView).mockReturnValueOnce(false);
    vi.mocked(useReducedMotion).mockReturnValueOnce(true);
    render(<CommercialHowItWorks />);
    const cards = screen.getAllByTestId('commercial-step-card');
    cards.forEach((c) => {
      expect(c.style.opacity).toBe('1');
      expect(c.style.transform).toBe('translateY(0)');
    });
  });

  it('renders the Net Result callout with PillBadge label and 6 outcome bullets', () => {
    render(<CommercialHowItWorks />);
    const callout = screen.getByTestId('commercial-net-result');
    expect(callout).toBeInTheDocument();
    expect(callout.textContent).toContain('Net Result');
    expect(callout.textContent).toContain('Your Sales Engineers Get Their Time Back.');
    const bullets = callout.querySelectorAll('li');
    expect(bullets).toHaveLength(6);
    const bulletTexts = Array.from(bullets).map(
      (b) => b.querySelector('span:last-child')?.textContent,
    );
    expect(bulletTexts).toEqual([
      'Spec questions answered instantly — from your own catalog',
      'No engineer pulled into a chat that should have been a search',
      'Lead-decay killed: zero "did anyone email back?" moments',
      'Every RFQ scored and tagged before it hits the queue',
      'Dealer + territory routing happens in seconds, not Tuesdays',
      'Your CRM sees the spec sheet, not just the contact info',
    ]);
  });
});
