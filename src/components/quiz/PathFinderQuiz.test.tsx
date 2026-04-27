import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/quiz-state', async () => {
  const actual = await vi.importActual<typeof import('@/lib/quiz-state')>('@/lib/quiz-state');
  return {
    readQuizState: vi.fn(),
    readQuizSession: vi.fn(),
    writeQuizState: vi.fn(),
    writeQuizSession: vi.fn(),
    clearQuizState: vi.fn(),
    // Use real tier-derivation to get accurate tier signals in tests.
    getTierSignalFromAnswers: actual.getTierSignalFromAnswers,
  };
});

vi.mock('@/lib/consent', () => ({
  useConsent: vi.fn(),
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

import {
  readQuizState,
  writeQuizState,
  writeQuizSession,
} from '@/lib/quiz-state';
import { useConsent } from '@/lib/consent';
import { trackEvent } from '@/lib/analytics';
import PathFinderQuiz from './PathFinderQuiz';

function setConsent(analytics: boolean) {
  vi.mocked(useConsent).mockReturnValue({
    consent: { analytics, marketing: false },
    hasInteracted: true,
    acceptAll: vi.fn(),
    updateConsent: vi.fn(),
  });
}

beforeEach(() => {
  vi.mocked(readQuizState).mockReset();
  vi.mocked(readQuizState).mockReturnValue(null);
  vi.mocked(writeQuizState).mockClear();
  vi.mocked(writeQuizSession).mockClear();
  vi.mocked(trackEvent).mockClear();
  setConsent(true);
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ data: { contactId: 'c1' }, error: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Initial render ────────────────────────────────────────────────────────

describe('PathFinderQuiz — initial render', () => {
  it('renders question 1 with 5 option cards and no back button', () => {
    render(<PathFinderQuiz />);
    expect(
      screen.getByRole('radiogroup', { name: /How big is your company/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('exposes progress via native <progress> with aria-valuenow=1, aria-valuemax=5', () => {
    const { container } = render(<PathFinderQuiz />);
    const progress = container.querySelector('progress') as HTMLProgressElement | null;
    expect(progress).not.toBeNull();
    expect(progress?.value).toBe(1);
    expect(progress?.max).toBe(5);
    expect(progress?.getAttribute('aria-label')).toMatch(/step 1 of 5/i);
  });

  it('renders progress label "Step 1 of 5"', () => {
    render(<PathFinderQuiz />);
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
  });
});

// ─── Selection + auto-advance ──────────────────────────────────────────────

describe('PathFinderQuiz — selection and auto-advance', () => {
  it('clicking an option marks it aria-checked="true" and others "false"', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    const option = screen.getByRole('radio', { name: '11–50 employees' });
    await user.click(option);
    expect(option).toHaveAttribute('aria-checked', 'true');
    const others = screen.getAllByRole('radio').filter((r) => r !== option);
    others.forEach((r) => expect(r).toHaveAttribute('aria-checked', 'false'));
  });

  it('auto-advances to question 2 ~300ms after selection', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    expect(
      await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Step 2 of 5/i)).toBeInTheDocument();
  });

  it('writes to sessionStorage and localStorage on every selection', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    expect(writeQuizSession).toHaveBeenCalled();
    expect(writeQuizState).toHaveBeenCalled();
    const sessionPayload = vi.mocked(writeQuizSession).mock.calls[0][0];
    expect(sessionPayload.answers).toEqual({ olark_company_size: '11-50' });
    expect(sessionPayload.currentStep).toBe(2);
    expect(sessionPayload.emailCaptured).toBe(false);
  });
});

// ─── Accumulated pills ─────────────────────────────────────────────────────

describe('PathFinderQuiz — accumulated answers bar', () => {
  it('shows a pill with the human label of the previous step\'s answer', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    expect(screen.getByText('11–50 employees')).toBeInTheDocument();
    expect(screen.getByText(/Your answers so far/i)).toBeInTheDocument();
  });
});

// ─── Back navigation between question steps ────────────────────────────────

describe('PathFinderQuiz — back navigation between question steps', () => {
  it('back from step 2 returns to step 1 with prior answer pre-selected', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(
      screen.getByRole('radiogroup', { name: /How big is your company/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '11–50 employees' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('back from step 3 to step 2 removes the just-back-navigated answer from the pill bar', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole(
      'radiogroup',
      { name: /inbound traffic/i },
      { timeout: 1500 },
    );
    expect(screen.getByText('11–50 employees')).toBeInTheDocument();
    expect(screen.getByText('Qualify inbound visitors')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /back/i }));
    const radiogroupQ2 = await screen.findByRole(
      'radiogroup',
      { name: /primary job/i },
      { timeout: 1500 },
    );
    const pillBar = document.querySelector('.quiz-pill-bar') as HTMLElement | null;
    expect(pillBar).not.toBeNull();
    expect(within(pillBar!).queryByText('Qualify inbound visitors')).not.toBeInTheDocument();
    expect(within(pillBar!).getByText('11–50 employees')).toBeInTheDocument();
    expect(
      within(radiogroupQ2).getByRole('radio', { name: 'Qualify inbound visitors' }),
    ).toBeInTheDocument();
  });
});

// ─── Keyboard navigation ───────────────────────────────────────────────────

describe('PathFinderQuiz — keyboard navigation', () => {
  it('ArrowDown moves focus to next radio; Enter selects and advances', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    const radiogroup = screen.getByRole('radiogroup', {
      name: /How big is your company/i,
    });
    const first = within(radiogroup).getAllByRole('radio')[0];
    first.focus();
    await user.keyboard('{ArrowDown}');
    const second = within(radiogroup).getAllByRole('radio')[1];
    expect(document.activeElement).toBe(second);
    await user.keyboard('{Enter}');
    expect(
      await screen.findByText(/Step 2 of 5/i, undefined, { timeout: 1500 }),
    ).toBeInTheDocument();
  });

  it('only one radio in the group has tabindex="0" before any selection (roving focus)', () => {
    render(<PathFinderQuiz />);
    const radios = screen.getAllByRole('radio');
    const tabbable = radios.filter((r) => r.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBe(radios[0]);
  });

  it('after a selection, only the selected radio has tabindex="0"', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    const target = screen.getByRole('radio', { name: '51–200 employees' });
    await user.click(target);
    const radios = screen.getAllByRole('radio');
    const tabbable = radios.filter((r) => r.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBe(target);
  });
});

// ─── localStorage resume ───────────────────────────────────────────────────

describe('PathFinderQuiz — localStorage resume', () => {
  it('mounts directly on Question 3 when readQuizState returns step=3', () => {
    vi.mocked(readQuizState).mockReturnValue({
      currentStep: 3,
      answers: {
        olark_company_size: '11-50',
        olark_use_case: 'inbound_qual',
      },
      emailCaptured: false,
      sessionId: 'resumed-session',
      startedAt: '2026-04-26T00:00:00.000Z',
    });
    render(<PathFinderQuiz />);
    expect(
      screen.getByRole('radiogroup', { name: /inbound traffic/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('11–50 employees')).toBeInTheDocument();
    expect(screen.getByText('Qualify inbound visitors')).toBeInTheDocument();
    expect(screen.getByText(/Step 3 of 5/i)).toBeInTheDocument();
  });

  it('ignores resume state with currentStep > 3 and starts fresh', () => {
    vi.mocked(readQuizState).mockReturnValue({
      currentStep: 4,
      answers: { olark_company_size: '11-50' },
      emailCaptured: false,
      sessionId: 'x',
      startedAt: '2026-04-26T00:00:00.000Z',
    });
    render(<PathFinderQuiz />);
    expect(
      screen.getByRole('radiogroup', { name: /How big is your company/i }),
    ).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toHaveAttribute('aria-checked', 'false'));
  });
});

// ─── Step 3 → step 4 (email capture) ───────────────────────────────────────

describe('PathFinderQuiz — advances to email-capture step 4', () => {
  async function answerAllThree(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole('radiogroup', { name: /inbound traffic/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Under 5,000 visits' }));
  }

  it('renders the email-capture form after question 3 is answered', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
    expect(
      await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByText(/Step 4 of 5/i)).toBeInTheDocument();
  });

  it('still calls onAnswersComplete prop when provided (back-compat)', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<PathFinderQuiz onAnswersComplete={onComplete} />);
    await answerAllThree(user);
    await vi.waitFor(
      () => {
        expect(onComplete).toHaveBeenCalledTimes(1);
      },
      { timeout: 1500 },
    );
    expect(onComplete).toHaveBeenCalledWith({
      olark_company_size: '11-50',
      olark_use_case: 'inbound_qual',
      olark_inbound_volume: 'low',
    });
  });

  it('back from step 4 returns to question 3 with answer pre-selected', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(
      await screen.findByRole(
        'radiogroup',
        { name: /inbound traffic/i },
        { timeout: 1500 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Under 5,000 visits' }),
    ).toHaveAttribute('aria-checked', 'true');
  });
});

// ─── Step 4 → step 5 (tier reveal) ─────────────────────────────────────────

describe('PathFinderQuiz — email submit advances to tier reveal', () => {
  async function answerAllThree(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole('radiogroup', { name: /inbound traffic/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Under 5,000 visits' }));
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });
  }

  it('renders tier reveal with the correct tier label after valid email submit', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
    await user.type(screen.getByLabelText(/Your work email/i), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: /Send my fit report/i }));
    expect(
      await screen.findByRole('heading', { name: /Based on what you told us: Lead-Gen/i }, { timeout: 1500 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Let.s scope your build/i }),
    ).toHaveAttribute('href', '/get-started');
    expect(
      screen.getByRole('link', { name: /See Lead-Gen details/i }),
    ).toHaveAttribute('href', '/lead-gen');
  });

  it('back from step 5 returns to step 4 with email pre-filled', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
    await user.type(screen.getByLabelText(/Your work email/i), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: /Send my fit report/i }));
    await screen.findByRole('heading', { name: /Based on what you told us/i }, { timeout: 1500 });
    await user.click(screen.getByRole('button', { name: /back/i }));
    const input = (await screen.findByLabelText(/Your work email/i)) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('dana@example.com');
  });
});

// ─── Consent gating: HubSpot writes ────────────────────────────────────────

describe('PathFinderQuiz — consent-gated HubSpot writes', () => {
  async function answerAllThree(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole('radiogroup', { name: /inbound traffic/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Under 5,000 visits' }));
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });
  }

  it('with consent denied: completes the full quiz with zero fetch calls and zero trackEvent calls', async () => {
    setConsent(false);
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
    await user.type(screen.getByLabelText(/Your work email/i), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: /Send my fit report/i }));
    await screen.findByRole('heading', { name: /Based on what you told us/i }, { timeout: 1500 });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('does not fire HubSpot during steps 1–3 even when consent is granted (no email yet)', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole('radiogroup', { name: /inbound traffic/i }, { timeout: 1500 });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('with consent granted: email submit fires the first HubSpot upsert (partial); completion fires the second (full)', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);

    // Email submit: first fetch call, partial payload
    await user.type(screen.getByLabelText(/Your work email/i), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: /Send my fit report/i }));

    await vi.waitFor(
      () => {
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
      },
      { timeout: 2000 },
    );

    const fetchMock = vi.mocked(globalThis.fetch);
    const firstCall = fetchMock.mock.calls[0];
    const firstBody = JSON.parse((firstCall[1] as RequestInit).body as string);
    expect(firstCall[0]).toBe('/api/hubspot/contact');
    expect(firstBody.email).toBe('dana@example.com');
    expect(firstBody.olark_quiz_partial).toBe(true);
    expect(firstBody.olark_company_size).toBe('11-50');
    expect(firstBody.olark_use_case).toBe('inbound_qual');
    expect(firstBody.olark_inbound_volume).toBe('low');

    const secondCall = fetchMock.mock.calls[1];
    const secondBody = JSON.parse((secondCall[1] as RequestInit).body as string);
    expect(secondBody.email).toBe('dana@example.com');
    expect(secondBody.olark_quiz_partial).toBe(false);
    expect(secondBody.olark_tier_signal).toBe('lead_gen');
    expect(typeof secondBody.olark_quiz_completed_at).toBe('string');
    expect(secondBody).toHaveProperty('olark_demo_depth');
    expect(secondBody).toHaveProperty('olark_demo_url');
    expect(secondBody).toHaveProperty('olark_pages_visited');
  });
});

// ─── GA4 events ────────────────────────────────────────────────────────────

describe('PathFinderQuiz — GA4 events (consent-gated)', () => {
  it('fires quiz_started exactly once on the first answer', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    const startedCalls = vi.mocked(trackEvent).mock.calls.filter(
      ([name]) => name === 'quiz_started',
    );
    expect(startedCalls).toHaveLength(1);
  });

  it('fires quiz_question_answered for every answer with step + value', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    const answered = vi.mocked(trackEvent).mock.calls.filter(
      ([name]) => name === 'quiz_question_answered',
    );
    expect(answered).toHaveLength(2);
    expect(answered[0][1]).toMatchObject({
      step: 1,
      property_key: 'olark_company_size',
      value: '11-50',
    });
    expect(answered[1][1]).toMatchObject({
      step: 2,
      property_key: 'olark_use_case',
      value: 'inbound_qual',
    });
  });

  it('fires quiz_email_captured and quiz_completed in order on full completion', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole('radiogroup', { name: /inbound traffic/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Under 5,000 visits' }));
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });
    await user.type(screen.getByLabelText(/Your work email/i), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: /Send my fit report/i }));
    await screen.findByRole('heading', { name: /Based on what you told us/i }, { timeout: 1500 });
    const names = vi.mocked(trackEvent).mock.calls.map((c) => c[0]);
    expect(names).toContain('quiz_email_captured');
    const completedCalls = vi.mocked(trackEvent).mock.calls.filter(
      ([name]) => name === 'quiz_completed',
    );
    expect(completedCalls).toHaveLength(1);
    expect(completedCalls[0][1]).toMatchObject({ tier_signal: 'lead_gen' });
    expect(names.indexOf('quiz_email_captured')).toBeLessThan(
      names.indexOf('quiz_completed'),
    );
  });
});

// ─── Page abandonment via beforeunload ─────────────────────────────────────

describe('PathFinderQuiz — beforeunload abandonment', () => {
  it('fires quiz_abandoned with last_step when the user leaves mid-quiz with consent + email', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole('radiogroup', { name: /inbound traffic/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Under 5,000 visits' }));
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });
    await user.type(screen.getByLabelText(/Your work email/i), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: /Send my fit report/i }));
    await screen.findByRole('heading', { name: /Based on what you told us/i }, { timeout: 1500 });

    // Simulate going back to step 4 (so the user has email but is not on step 5)
    await user.click(screen.getByRole('button', { name: /back/i }));
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });

    vi.mocked(trackEvent).mockClear();
    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    const abandonedCalls = vi.mocked(trackEvent).mock.calls.filter(
      ([name]) => name === 'quiz_abandoned',
    );
    expect(abandonedCalls).toHaveLength(1);
    expect(abandonedCalls[0][1]).toMatchObject({ last_step: 4 });
  });

  it('does not fire abandonment when on step 5 (already completed)', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole('radiogroup', { name: /inbound traffic/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: 'Under 5,000 visits' }));
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });
    await user.type(screen.getByLabelText(/Your work email/i), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: /Send my fit report/i }));
    await screen.findByRole('heading', { name: /Based on what you told us/i }, { timeout: 1500 });
    vi.mocked(trackEvent).mockClear();
    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    const abandonedCalls = vi.mocked(trackEvent).mock.calls.filter(
      ([name]) => name === 'quiz_abandoned',
    );
    expect(abandonedCalls).toHaveLength(0);
  });

  it('does not fire abandonment when consent is denied', async () => {
    setConsent(false);
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
