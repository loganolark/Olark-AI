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
      screen.getByRole('heading', { level: 1, name: /Let.s build your Aiden deployment/i }),
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
      screen.getByRole('heading', { level: 1, name: /Your team is ready for Aiden/i }),
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
      screen.getByRole('heading', { level: 1, name: /Your extra SDR is ready to deploy/i }),
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
      screen.getByRole('heading', { level: 1, name: /Start in minutes, see results today/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-variant="essentials"]')).not.toBeNull();
  });

  it('falls back to "anonymous" on malformed cookie', async () => {
    vi.mocked(cookies).mockReturnValue(makeCookieStore('not-json') as never);
    await renderShell();
    expect(document.querySelector('[data-variant="anonymous"]')).not.toBeNull();
  });
});

describe('ConversionPageShell — dual CTA', () => {
  it('renders "Start Your Account →" primary CTA scrolling to the on-page booking embed', async () => {
    vi.mocked(cookies).mockReturnValue(makeCookieStore() as never);
    await renderShell();
    const primary = screen.getByRole('link', { name: /Start Your Account/i });
    // Until a dedicated account-creation flow exists, both CTAs route to the booking embed.
    expect(primary).toHaveAttribute('href', '#booking');
  });

  it('renders "Scope My Build →" secondary CTA routing to #booking', async () => {
    vi.mocked(cookies).mockReturnValue(makeCookieStore() as never);
    await renderShell();
    const secondary = screen.getByRole('link', { name: /Scope My Build/i });
    expect(secondary).toHaveAttribute('href', '#booking');
  });

  it('renders the #booking placeholder anchor for Story 6.2', async () => {
    vi.mocked(cookies).mockReturnValue(makeCookieStore() as never);
    await renderShell();
    expect(document.getElementById('booking')).not.toBeNull();
  });
});
