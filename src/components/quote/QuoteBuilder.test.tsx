import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// QuoteBuilder posts to HubSpot when an email-gated plan is unlocked. Mock
// consent + analytics + global fetch so tests can assert on the call shape
// without making real network requests or needing a ConsentProvider.
vi.mock('@/lib/consent', () => ({
  useConsent: vi.fn(() => ({
    consent: { analytics: true, marketing: false },
    hasInteracted: true,
    acceptAll: vi.fn(),
    updateConsent: vi.fn(),
  })),
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

import { useConsent } from '@/lib/consent';
import { trackEvent } from '@/lib/analytics';
import QuoteBuilder from './QuoteBuilder';

// In-memory localStorage stub. Vitest 4's default localstorage backing can
// throw when a `--localstorage-file` flag is set without a valid path (which
// is the case in this repo's test runner), so we swap in our own simple
// implementation per test for deterministic setup.
function installFreshLocalStorage(): void {
  const store: Record<string, string> = {};
  const stub: Storage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: (i) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
  Object.defineProperty(window, 'localStorage', {
    value: stub,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  vi.mocked(useConsent).mockReturnValue({
    consent: { analytics: true, marketing: false },
    hasInteracted: true,
    acceptAll: vi.fn(),
    updateConsent: vi.fn(),
  });
  vi.mocked(trackEvent).mockClear();
  installFreshLocalStorage();
});

describe('QuoteBuilder — initial render', () => {
  it('shows the company text question first', () => {
    render(<QuoteBuilder tier="essentials" />);
    expect(screen.getByRole('textbox', { name: /What is your company name/i })).toBeInTheDocument();
    expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
  });

  it('Continue button is present and clickable', () => {
    render(<QuoteBuilder tier="essentials" />);
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });
});

describe('QuoteBuilder — text validation', () => {
  it('shakes the input and does not advance on empty submit', async () => {
    const user = userEvent.setup();
    const { container } = render(<QuoteBuilder tier="essentials" />);
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    expect(container.querySelector('.quote-input.shake')).not.toBeNull();
    expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
  });
});

async function answerCompany(user: ReturnType<typeof userEvent.setup>, name = 'Acme') {
  await user.type(screen.getByRole('textbox', { name: /company name/i }), name);
  await user.click(screen.getByRole('button', { name: /Continue/i }));
}

async function answerSeats(user: ReturnType<typeof userEvent.setup>, n: string) {
  const seatsInput = await screen.findByRole(
    'spinbutton',
    { name: /How many user seats/i },
    { timeout: 1500 },
  );
  await user.clear(seatsInput);
  await user.type(seatsInput, n);
  await user.click(screen.getByRole('button', { name: /Continue/i }));
}

describe('QuoteBuilder — Essentials happy path', () => {
  it('completes essentials tier with 5 seats and shows total $4,704', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="essentials" />);
    await answerCompany(user, 'Acme');
    await answerSeats(user, '5');
    expect(await screen.findByTestId('quote-result', undefined, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByTestId('quote-total')).toHaveTextContent('$4,704');
    expect(screen.getByTestId('quote-plan-name')).toHaveTextContent('Aiden Essentials');
    expect(screen.getByText(/Custom quote prepared for/i)).toHaveTextContent('Acme');
  });
});

describe('QuoteBuilder — Advanced tree', () => {
  it('lead_support routes to Aiden Pro', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }));
    // 220ms auto-advance — wait for the seats question to appear
    await answerSeats(user, '4');
    expect(await screen.findByTestId('quote-result', undefined, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByTestId('quote-plan-name')).toHaveTextContent('Aiden Pro');
    // Pro: 7200 + max(0, 4-3) × 276 = 7476
    expect(screen.getByTestId('quote-total')).toHaveTextContent('$7,476');
  });

  it('lead_gen + single team routes to Aiden Advanced', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(screen.getByRole('button', { name: /^Lead Generation$/i }));
    const singleBtn = await screen.findByRole(
      'button',
      { name: /Single team/i },
      { timeout: 1500 },
    );
    await user.click(singleBtn);
    await answerSeats(user, '2');
    expect(await screen.findByTestId('quote-result', undefined, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByTestId('quote-plan-name')).toHaveTextContent('Aiden Advanced');
    expect(screen.getByTestId('quote-total')).toHaveTextContent('$4,800');
  });
});

describe('QuoteBuilder — Commercial tree', () => {
  it('hubspot + territorial=yes routes to Aiden Bespoke with other_integrations step', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="commercial" />);
    await answerCompany(user, 'Acme');
    await user.click(screen.getByRole('button', { name: /^HubSpot$/i }));
    const territorialYes = await screen.findByRole(
      'button',
      { name: /Yes, we have regional teams/i },
      { timeout: 1500 },
    );
    await user.click(territorialYes);
    // other_integrations input
    const integrationsInput = await screen.findByRole(
      'textbox',
      { name: /additional integrations/i },
      { timeout: 1500 },
    );
    await user.type(integrationsInput, 'Zendesk');
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await answerSeats(user, '6');
    expect(await screen.findByTestId('quote-result', undefined, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByTestId('quote-plan-name')).toHaveTextContent('Aiden Bespoke');
    // Bespoke: 16500 + max(0, 6-5) × 600 = 17100
    expect(screen.getByTestId('quote-total')).toHaveTextContent('$17,100');
  });
});

describe('QuoteBuilder — restart', () => {
  it('Start over resets state to question 1', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="essentials" />);
    await answerCompany(user, 'Acme');
    await answerSeats(user, '1');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });

    await user.click(screen.getByRole('button', { name: /Start over/i }));
    expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
    const companyInput = screen.getByRole('textbox', { name: /What is your company name/i }) as HTMLInputElement;
    expect(companyInput.value).toBe('');
  });
});

describe('QuoteBuilder — inheritance toggle', () => {
  it('Pro plan exposes a clickable inheritance toggle', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }));
    await answerSeats(user, '3');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });

    const toggle = screen.getByRole('button', { name: /All Advanced features included/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('QuoteBuilder — onComplete callback', () => {
  it('fires onComplete with derived plan + answers on result', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<QuoteBuilder tier="essentials" onComplete={onComplete} />);
    await answerCompany(user, 'Acme');
    await answerSeats(user, '2');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('essentials', { company: 'Acme', seats: '2' });
  });
});

describe('QuoteBuilder — email gate (pro/signature/bespoke)', () => {
  it('Aiden Pro: pricing card is locked + email gate visible until unlocked', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(
      screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }),
    );
    await answerSeats(user, '4');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });
    // Plan is Aiden Pro → email-gated
    expect(screen.getByTestId('quote-plan-name')).toHaveTextContent('Aiden Pro');
    expect(screen.getByTestId('quote-pricing-card').getAttribute('data-locked')).toBe('true');
    expect(screen.getByTestId('quote-email-gate')).toBeInTheDocument();
  });

  it('Essentials: pricing card is unlocked, no email gate (transactional plan)', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="essentials" />);
    await answerCompany(user, 'Acme');
    await answerSeats(user, '5');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });
    expect(screen.getByTestId('quote-pricing-card').getAttribute('data-locked')).toBe('false');
    expect(screen.queryByTestId('quote-email-gate')).toBeNull();
  });

  it('Bespoke: pricing locked + email gate present', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="commercial" />);
    await answerCompany(user, 'Acme');
    await user.click(screen.getByRole('button', { name: /^HubSpot$/i }));
    await user.click(
      await screen.findByRole(
        'button',
        { name: /Yes, we have regional teams/i },
        { timeout: 1500 },
      ),
    );
    const integrationsInput = await screen.findByRole(
      'textbox',
      { name: /additional integrations/i },
      { timeout: 1500 },
    );
    await user.type(integrationsInput, 'Zendesk');
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await answerSeats(user, '6');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });
    expect(screen.getByTestId('quote-plan-name')).toHaveTextContent('Aiden Bespoke');
    expect(screen.getByTestId('quote-pricing-card').getAttribute('data-locked')).toBe('true');
  });

  it('rejects an invalid email and surfaces an error', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(
      screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }),
    );
    await answerSeats(user, '4');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });
    const input = screen.getByPlaceholderText(/you@company.com/i);
    await user.type(input, 'not-an-email');
    await user.click(screen.getByTestId('quote-email-submit'));
    expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
    // Still locked
    expect(screen.getByTestId('quote-pricing-card').getAttribute('data-locked')).toBe('true');
  });

  it('valid email unlocks pricing, hides the gate, and posts to /api/hubspot/contact', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(window, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));
    // Force the fetch fallback path by removing sendBeacon for this test.
    const originalSendBeacon = navigator.sendBeacon;
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });

    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(
      screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }),
    );
    await answerSeats(user, '4');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });

    const input = screen.getByPlaceholderText(/you@company.com/i);
    await user.type(input, 'logan@olark.com');
    await user.click(screen.getByTestId('quote-email-submit'));

    expect(screen.getByTestId('quote-pricing-card').getAttribute('data-locked')).toBe('false');
    expect(screen.queryByTestId('quote-email-gate')).toBeNull();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/hubspot/contact',
      expect.objectContaining({
        method: 'POST',
        keepalive: true,
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
    const body = JSON.parse((fetchSpy.mock.calls[0]![1] as RequestInit).body as string);
    // Advanced QuizTier maps to lead_gen tier_signal in HubSpot
    expect(body).toEqual({ email: 'logan@olark.com', olark_tier_signal: 'lead_gen' });
    // Analytics event also fires (consent allowed)
    expect(trackEvent).toHaveBeenCalledWith(
      'quote_email_unlock',
      expect.objectContaining({ plan: 'pro', tier_signal: 'lead_gen' }),
    );

    fetchSpy.mockRestore();
    if (originalSendBeacon) {
      Object.defineProperty(navigator, 'sendBeacon', {
        value: originalSendBeacon,
        configurable: true,
      });
    }
  });

  it('does NOT post to HubSpot when analytics consent is denied (still unlocks locally)', async () => {
    vi.mocked(useConsent).mockReturnValue({
      consent: { analytics: false, marketing: false },
      hasInteracted: true,
      acceptAll: vi.fn(),
      updateConsent: vi.fn(),
    });
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(window, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));
    const originalSendBeacon = navigator.sendBeacon;
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });

    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(
      screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }),
    );
    await answerSeats(user, '4');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });

    await user.type(screen.getByPlaceholderText(/you@company.com/i), 'logan@olark.com');
    await user.click(screen.getByTestId('quote-email-submit'));

    // Pricing unlocks locally — visitor sees the numbers
    expect(screen.getByTestId('quote-pricing-card').getAttribute('data-locked')).toBe('false');
    // But no HubSpot push fires when analytics consent is denied
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
    if (originalSendBeacon) {
      Object.defineProperty(navigator, 'sendBeacon', {
        value: originalSendBeacon,
        configurable: true,
      });
    }
  });

  it('PDF download is blocked while locked: shows a friendly notice + focuses the email input', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(
      screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }),
    );
    await answerSeats(user, '4');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });

    // Notice not visible until the user attempts the locked action
    expect(screen.queryByTestId('quote-pdf-locked-notice')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Download a detailed PDF quote/i }));

    const notice = screen.getByTestId('quote-pdf-locked-notice');
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveTextContent(/Add your email above to unlock pricing/i);
    // Email input is focused so the visitor can complete the unlock without
    // having to find it themselves.
    expect(screen.getByPlaceholderText(/you@company.com/i)).toHaveFocus();
    // Pricing card is still locked
    expect(screen.getByTestId('quote-pricing-card').getAttribute('data-locked')).toBe('true');
  });

  it('PDF locked notice clears after the email is submitted and pricing unlocks', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));

    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(
      screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }),
    );
    await answerSeats(user, '4');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });

    // Trigger the notice
    await user.click(screen.getByRole('button', { name: /Download a detailed PDF quote/i }));
    expect(screen.getByTestId('quote-pdf-locked-notice')).toBeInTheDocument();

    // Now unlock by giving email
    await user.type(screen.getByPlaceholderText(/you@company.com/i), 'logan@olark.com');
    await user.click(screen.getByTestId('quote-email-submit'));

    // Notice should be gone
    expect(screen.queryByTestId('quote-pdf-locked-notice')).toBeNull();
    expect(screen.getByTestId('quote-pricing-card').getAttribute('data-locked')).toBe('false');
  });

  it('PDF download proceeds normally for un-gated tiers (essentials)', async () => {
    const user = userEvent.setup();
    // Stub the dynamic PDF lib so the test doesn't crash on jsdom file APIs.
    vi.doMock('@/lib/quote-pdf', () => ({ downloadQuotePDF: vi.fn().mockResolvedValue(undefined) }));

    render(<QuoteBuilder tier="essentials" />);
    await answerCompany(user, 'Acme');
    await answerSeats(user, '5');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });

    await user.click(screen.getByRole('button', { name: /Download a detailed PDF quote/i }));

    // No locked notice for essentials (transactional tier — pricing always
    // visible, PDF always available)
    expect(screen.queryByTestId('quote-pdf-locked-notice')).toBeNull();
  });

  it('persists unlock across mounts via localStorage (returning visitor skips the gate)', async () => {
    // Simulate a prior session where the visitor already provided email
    window.localStorage.setItem('olark_quote_email_captured', 'true');
    const user = userEvent.setup();
    render(<QuoteBuilder tier="advanced" />);
    await answerCompany(user, 'Acme');
    await user.click(
      screen.getByRole('button', { name: /Lead Generation \+ Customer Support/i }),
    );
    await answerSeats(user, '4');
    await screen.findByTestId('quote-result', undefined, { timeout: 1500 });
    // Pro is normally email-gated, but stored unlock means no gate this time
    expect(screen.getByTestId('quote-pricing-card').getAttribute('data-locked')).toBe('false');
    expect(screen.queryByTestId('quote-email-gate')).toBeNull();
  });
});
