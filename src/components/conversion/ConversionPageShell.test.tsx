import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { cookies } from 'next/headers';
import ConversionPageShell from './ConversionPageShell';

function makeCookieStore(quizCookieValue?: string) {
  return {
    get: vi.fn((name: string) =>
      name === 'olark_session_signals' && quizCookieValue !== undefined
        ? { value: quizCookieValue }
        : undefined,
    ),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
  };
}

function encodeQuizCookie(payload: object): string {
  return encodeURIComponent(JSON.stringify(payload));
}

async function renderShell() {
  const node = await ConversionPageShell();
  return render(node as React.ReactElement);
}

beforeEach(() => {
  vi.mocked(cookies).mockReset();
});

describe('ConversionPageShell — variant selection', () => {
  it('renders "anonymous" variant when no cookie is present', async () => {
    vi.mocked(cookies).mockReturnValue(makeCookieStore() as never);
    await renderShell();
    expect(
      screen.getByRole('heading', { level: 1, name: /See What Aiden Does for Your Team/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-variant="anonymous"]')).not.toBeNull();
  });

  it('renders "commercial-high-intent" when cookie has commercial + demo_run', async () => {
    vi.mocked(cookies).mockReturnValue(
      makeCookieStore(
        encodeQuizCookie({ tier_signal: 'commercial', demo_run: true, quiz_completed: true }),
      ) as never,
    );
    await renderShell();
    expect(
      screen.getByRole('heading', { level: 1, name: /Let.s Build Your Aiden Deployment/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-variant="commercial-high-intent"]')).not.toBeNull();
  });

  it('renders "commercial-quiz-only" when cookie has commercial without demo_run', async () => {
    vi.mocked(cookies).mockReturnValue(
      makeCookieStore(
        encodeQuizCookie({ tier_signal: 'commercial', demo_run: false, quiz_completed: true }),
      ) as never,
    );
    await renderShell();
    expect(
      screen.getByRole('heading', { level: 1, name: /Your Team Is Ready for Aiden/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-variant="commercial-quiz-only"]')).not.toBeNull();
  });

  it('renders "lead-gen" variant when cookie has tier_signal=lead_gen', async () => {
    vi.mocked(cookies).mockReturnValue(
      makeCookieStore(
        encodeQuizCookie({ tier_signal: 'lead_gen', demo_run: false, quiz_completed: true }),
      ) as never,
    );
    await renderShell();
    expect(
      screen.getByRole('heading', { level: 1, name: /Your Extra SDR Is Ready to Deploy/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-variant="lead-gen"]')).not.toBeNull();
  });

  it('renders "essentials" variant when cookie has tier_signal=essentials', async () => {
    vi.mocked(cookies).mockReturnValue(
      makeCookieStore(
        encodeQuizCookie({ tier_signal: 'essentials', demo_run: false, quiz_completed: true }),
      ) as never,
    );
    await renderShell();
    expect(
      screen.getByRole('heading', { level: 1, name: /Start in Minutes, See Results Today/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-variant="essentials"]')).not.toBeNull();
  });

  it('falls back to "anonymous" on malformed cookie', async () => {
    vi.mocked(cookies).mockReturnValue(makeCookieStore('not-json') as never);
    await renderShell();
    expect(document.querySelector('[data-variant="anonymous"]')).not.toBeNull();
  });
});

describe('ConversionPageShell — tier badge per variant', () => {
  it('renders "Essentials Tier" PillBadge when variant=essentials', async () => {
    vi.mocked(cookies).mockReturnValue(
      makeCookieStore(
        encodeQuizCookie({ tier_signal: 'essentials', demo_run: false, quiz_completed: true }),
      ) as never,
    );
    await renderShell();
    expect(screen.getByTestId('conversion-tier-badge')).toBeInTheDocument();
    expect(screen.getByText(/Essentials Tier/i)).toBeInTheDocument();
  });

  it('renders "Lead-Gen Tier" PillBadge when variant=lead-gen', async () => {
    vi.mocked(cookies).mockReturnValue(
      makeCookieStore(
        encodeQuizCookie({ tier_signal: 'lead_gen', demo_run: false, quiz_completed: true }),
      ) as never,
    );
    await renderShell();
    expect(screen.getByText(/Lead-Gen Tier/i)).toBeInTheDocument();
  });

  it('renders "Commercial Tier" PillBadge for both commercial variants', async () => {
    vi.mocked(cookies).mockReturnValue(
      makeCookieStore(
        encodeQuizCookie({ tier_signal: 'commercial', demo_run: true, quiz_completed: true }),
      ) as never,
    );
    await renderShell();
    expect(screen.getByText(/Commercial Tier/i)).toBeInTheDocument();
  });

  it('renders NO tier badge when variant=anonymous', async () => {
    vi.mocked(cookies).mockReturnValue(makeCookieStore() as never);
    await renderShell();
    expect(screen.queryByTestId('conversion-tier-badge')).toBeNull();
  });
});

describe('ConversionPageShell — single contextual CTA per variant', () => {
  it('anonymous variant shows "Talk to Logan →" CTA pointing to #booking', async () => {
    vi.mocked(cookies).mockReturnValue(makeCookieStore() as never);
    await renderShell();
    const cta = screen.getByRole('link', { name: /Talk to Logan/i });
    expect(cta).toHaveAttribute('href', '#booking');
    // Old dual-CTA labels must not appear
    expect(screen.queryByRole('link', { name: /Start Your Account/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Scope My Build/i })).toBeNull();
  });

  it('essentials variant shows "Book Your Onboarding Call →" CTA', async () => {
    vi.mocked(cookies).mockReturnValue(
      makeCookieStore(
        encodeQuizCookie({ tier_signal: 'essentials', demo_run: false, quiz_completed: true }),
      ) as never,
    );
    await renderShell();
    expect(
      screen.getByRole('link', { name: /Book Your Onboarding Call/i }),
    ).toHaveAttribute('href', '#booking');
  });

  it('commercial variants show "Scope My Build →" CTA', async () => {
    vi.mocked(cookies).mockReturnValue(
      makeCookieStore(
        encodeQuizCookie({ tier_signal: 'commercial', demo_run: true, quiz_completed: true }),
      ) as never,
    );
    await renderShell();
    expect(screen.getByRole('link', { name: /Scope My Build/i })).toHaveAttribute(
      'href',
      '#booking',
    );
  });
});

describe('ConversionPageShell — trust strip & next-steps & booking card', () => {
  beforeEach(() => {
    vi.mocked(cookies).mockReturnValue(makeCookieStore() as never);
  });

  it('renders the 3-item trust strip', async () => {
    await renderShell();
    const strip = screen.getByTestId('conversion-trust-strip');
    expect(strip).toBeInTheDocument();
    expect(strip.querySelectorAll('li')).toHaveLength(3);
    expect(screen.getByText(/30-minute scoping call/i)).toBeInTheDocument();
    expect(screen.getByText(/No prep required/i)).toBeInTheDocument();
    expect(screen.getByText(/Direct line to Logan/i)).toBeInTheDocument();
  });

  it('renders the "What Happens Next" 3-step ordered list', async () => {
    await renderShell();
    const steps = screen.getByTestId('conversion-next-steps');
    expect(steps).toBeInTheDocument();
    expect(steps.querySelectorAll('li')).toHaveLength(3);
    expect(
      screen.getByRole('heading', { level: 3, name: /Pick a time that works/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /We confirm by email/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /30 minutes . custom plan/i }),
    ).toBeInTheDocument();
  });

  it('wraps the HubSpot embed in a card surface anchored at #booking', async () => {
    await renderShell();
    const card = screen.getByTestId('conversion-booking-card');
    expect(card).toBeInTheDocument();
    expect(card.id).toBe('booking');
    // The HubSpot embed lives inside the card
    expect(card.querySelector('[data-testid="hubspot-meeting-embed"]')).not.toBeNull();
  });
});
