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
    // Use real recommenders so tests exercise the actual band + plan
    // derivation logic.
    getTierSignalFromAnswers: actual.getTierSignalFromAnswers,
    getRecommendedPlanFromAnswers: actual.getRecommendedPlanFromAnswers,
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

// All quiz-test answers below pick the "Signature" path — small sales team,
// one CRM, single-team routing — because that's the simpler default that
// exercises the full quiz flow without firing Bespoke triggers. Bespoke
// branching has its own coverage in quiz-state.test.ts.

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

const Q1_LABEL = 'A small team (6–15 reps)';
const Q1_VALUE = '6-15';
const Q2_LABEL = 'One CRM (HubSpot, Salesforce, or similar)';
const Q2_VALUE = 'single_crm';
const Q3_LABEL = 'One team — all leads land in the same place';
const Q3_VALUE = 'single_team';

// ─── Initial render ────────────────────────────────────────────────────────

describe('PathFinderQuiz — initial render', () => {
  it('renders question 1 with 4 option cards (sales team size) and no back button', () => {
    render(<PathFinderQuiz />);
    expect(
      screen.getByRole('radiogroup', { name: /How big is your sales team/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
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
    const option = screen.getByRole('radio', { name: Q1_LABEL });
    await user.click(option);
    expect(option).toHaveAttribute('aria-checked', 'true');
    const others = screen.getAllByRole('radio').filter((r) => r !== option);
    others.forEach((r) => expect(r).toHaveAttribute('aria-checked', 'false'));
  });

  it('auto-advances to question 2 ~300ms after selection', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: Q1_LABEL }));
    expect(
      await screen.findByRole('radiogroup', { name: /your stack look like/i }, { timeout: 1500 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Step 2 of 5/i)).toBeInTheDocument();
  });

  it('writes to sessionStorage and localStorage on every selection', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: Q1_LABEL }));
    expect(writeQuizSession).toHaveBeenCalled();
    expect(writeQuizState).toHaveBeenCalled();
    const sessionPayload = vi.mocked(writeQuizSession).mock.calls[0][0];
    expect(sessionPayload.answers).toEqual({ olark_company_size: Q1_VALUE });
    expect(sessionPayload.currentStep).toBe(2);
    expect(sessionPayload.emailCaptured).toBe(false);
  });
});

// ─── Accumulated pills ─────────────────────────────────────────────────────

describe('PathFinderQuiz — accumulated answers bar', () => {
  it("shows a pill with the human label of the previous step's answer", async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: Q1_LABEL }));
    await screen.findByRole('radiogroup', { name: /your stack look like/i }, { timeout: 1500 });
    expect(screen.getByText(Q1_LABEL)).toBeInTheDocument();
    expect(screen.getByText(/Your answers so far/i)).toBeInTheDocument();
  });
});

// ─── Back navigation between question steps ────────────────────────────────

describe('PathFinderQuiz — back navigation between question steps', () => {
  it('back from step 2 returns to step 1 with prior answer pre-selected', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: Q1_LABEL }));
    await screen.findByRole('radiogroup', { name: /your stack look like/i }, { timeout: 1500 });
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(
      screen.getByRole('radiogroup', { name: /How big is your sales team/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: Q1_LABEL })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('back from step 3 to step 2 removes the just-back-navigated answer from the pill bar', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: Q1_LABEL }));
    await screen.findByRole('radiogroup', { name: /your stack look like/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: Q2_LABEL }));
    await screen.findByRole(
      'radiogroup',
      { name: /route leads today/i },
      { timeout: 1500 },
    );
    expect(screen.getByText(Q1_LABEL)).toBeInTheDocument();
    expect(screen.getByText(Q2_LABEL)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /back/i }));
    const radiogroupQ2 = await screen.findByRole(
      'radiogroup',
      { name: /your stack look like/i },
      { timeout: 1500 },
    );
    const pillBar = document.querySelector('.quiz-pill-bar') as HTMLElement | null;
    expect(pillBar).not.toBeNull();
    expect(within(pillBar!).queryByText(Q2_LABEL)).not.toBeInTheDocument();
    expect(within(pillBar!).getByText(Q1_LABEL)).toBeInTheDocument();
    expect(
      within(radiogroupQ2).getByRole('radio', { name: Q2_LABEL }),
    ).toBeInTheDocument();
  });
});

// ─── Keyboard navigation ───────────────────────────────────────────────────

describe('PathFinderQuiz — keyboard navigation', () => {
  it('ArrowDown moves focus to next radio; Enter selects and advances', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    const radiogroup = screen.getByRole('radiogroup', {
      name: /How big is your sales team/i,
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
    const target = screen.getByRole('radio', { name: 'A full sales floor (16–50 reps)' });
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
        olark_company_size: Q1_VALUE,
        olark_use_case: Q2_VALUE,
      },
      emailCaptured: false,
      sessionId: 'resumed-session',
      startedAt: '2026-04-26T00:00:00.000Z',
    });
    render(<PathFinderQuiz />);
    expect(
      screen.getByRole('radiogroup', { name: /route leads today/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(Q1_LABEL)).toBeInTheDocument();
    expect(screen.getByText(Q2_LABEL)).toBeInTheDocument();
    expect(screen.getByText(/Step 3 of 5/i)).toBeInTheDocument();
  });

  it('ignores corrupt resume state (currentStep > 3 without emailCaptured) and starts fresh', () => {
    vi.mocked(readQuizState).mockReturnValue({
      currentStep: 4,
      answers: { olark_company_size: Q1_VALUE },
      emailCaptured: false,
      sessionId: 'x',
      startedAt: '2026-04-26T00:00:00.000Z',
    });
    render(<PathFinderQuiz />);
    expect(
      screen.getByRole('radiogroup', { name: /How big is your sales team/i }),
    ).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toHaveAttribute('aria-checked', 'false'));
  });

  it('Story 7.2 bouncer return: resumes at step 4 (email) when currentStep>=4 and emailCaptured=true', () => {
    vi.mocked(readQuizState).mockReturnValue({
      currentStep: 4,
      answers: {
        olark_company_size: Q1_VALUE,
        olark_use_case: Q2_VALUE,
        olark_inbound_volume: 'regional',
      },
      emailCaptured: true,
      sessionId: 'bouncer-session',
      startedAt: '2026-04-26T00:00:00.000Z',
    });
    render(<PathFinderQuiz />);
    // Step 4 = email capture; question radiogroups are absent
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Your work email/i)).toBeInTheDocument();
    // The email field is empty — NFR-S3 says we don't persist email; user re-enters.
    const input = screen.getByLabelText(/Your work email/i) as HTMLInputElement;
    expect(input.value).toBe('');
    // All 3 prior answers are pre-loaded (visible as pills via the accumulated bar).
    expect(screen.getByText(/Step 4 of 5/i)).toBeInTheDocument();
  });
});

// ─── Step 3 → step 4 (email capture) ───────────────────────────────────────

async function answerAllThree(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: Q1_LABEL }));
  await screen.findByRole('radiogroup', { name: /your stack look like/i }, { timeout: 1500 });
  await user.click(screen.getByRole('radio', { name: Q2_LABEL }));
  await screen.findByRole('radiogroup', { name: /route leads today/i }, { timeout: 1500 });
  await user.click(screen.getByRole('radio', { name: Q3_LABEL }));
}

describe('PathFinderQuiz — advances to email-capture step 4', () => {
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
      olark_company_size: Q1_VALUE,
      olark_use_case: Q2_VALUE,
      olark_inbound_volume: Q3_VALUE,
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
        { name: /route leads today/i },
        { timeout: 1500 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: Q3_LABEL }),
    ).toHaveAttribute('aria-checked', 'true');
  });
});

// ─── Step 4 → step 5 (plan reveal) ─────────────────────────────────────────

describe('PathFinderQuiz — email submit advances to plan reveal', () => {
  it('renders the plan reveal with the Aiden Signature recommendation after valid email submit', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });
    await user.type(screen.getByLabelText(/Your work email/i), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: /Send my fit report/i }));
    expect(
      await screen.findByRole(
        'heading',
        { name: /Based on what you told us: Aiden Signature/i },
        { timeout: 1500 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Let.s scope your build/i }),
    ).toHaveAttribute('href', '/get-started');
    expect(
      screen.getByRole('link', { name: /See Aiden Signature details/i }),
    ).toHaveAttribute('href', '/commercial');
  });

  it('back from step 5 returns to step 4 with email pre-filled', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });
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
  it('with consent denied: completes the full quiz with zero fetch calls and zero trackEvent calls', async () => {
    setConsent(false);
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });
    await user.type(screen.getByLabelText(/Your work email/i), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: /Send my fit report/i }));
    await screen.findByRole('heading', { name: /Based on what you told us/i }, { timeout: 1500 });
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('does not fire HubSpot during steps 1–3 even when consent is granted (no email yet)', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: Q1_LABEL }));
    await screen.findByRole('radiogroup', { name: /your stack look like/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: Q2_LABEL }));
    await screen.findByRole('radiogroup', { name: /route leads today/i }, { timeout: 1500 });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('with consent granted: email submit fires the first HubSpot upsert (partial); completion fires the second (full); both carry the recommended_plan field', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });

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
    expect(firstBody.olark_company_size).toBe(Q1_VALUE);
    expect(firstBody.olark_use_case).toBe(Q2_VALUE);
    expect(firstBody.olark_inbound_volume).toBe(Q3_VALUE);
    // Both fields fire on partial when all three answers are present.
    expect(firstBody.olark_tier_signal).toBe('commercial');
    expect(firstBody.olark_recommended_plan).toBe('signature');

    const secondCall = fetchMock.mock.calls[1];
    const secondBody = JSON.parse((secondCall[1] as RequestInit).body as string);
    expect(secondBody.email).toBe('dana@example.com');
    expect(secondBody.olark_quiz_partial).toBe(false);
    expect(secondBody.olark_tier_signal).toBe('commercial');
    expect(secondBody.olark_recommended_plan).toBe('signature');
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
    await user.click(screen.getByRole('radio', { name: Q1_LABEL }));
    await screen.findByRole('radiogroup', { name: /your stack look like/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: Q2_LABEL }));
    const startedCalls = vi.mocked(trackEvent).mock.calls.filter(
      ([name]) => name === 'quiz_started',
    );
    expect(startedCalls).toHaveLength(1);
  });

  it('fires quiz_question_answered for every answer with step + value', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: Q1_LABEL }));
    await screen.findByRole('radiogroup', { name: /your stack look like/i }, { timeout: 1500 });
    await user.click(screen.getByRole('radio', { name: Q2_LABEL }));
    const answered = vi.mocked(trackEvent).mock.calls.filter(
      ([name]) => name === 'quiz_question_answered',
    );
    expect(answered).toHaveLength(2);
    expect(answered[0][1]).toMatchObject({
      step: 1,
      property_key: 'olark_company_size',
      value: Q1_VALUE,
    });
    expect(answered[1][1]).toMatchObject({
      step: 2,
      property_key: 'olark_use_case',
      value: Q2_VALUE,
    });
  });

  it('fires quiz_email_captured and quiz_completed in order on full completion', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
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
    expect(completedCalls[0][1]).toMatchObject({ tier_signal: 'commercial' });
    expect(names.indexOf('quiz_email_captured')).toBeLessThan(
      names.indexOf('quiz_completed'),
    );
  });
});

// ─── olark_session_signals cookie write (Story 6.1) ─────────────────────────────

describe('PathFinderQuiz — writes olark_session_signals cookie at completion', () => {
  function clearQuizCookie() {
    document.cookie = 'olark_session_signals=; Path=/; Max-Age=0';
  }
  function getQuizCookie(): string | null {
    const match = document.cookie.split('; ').find((r) => r.startsWith('olark_session_signals='));
    return match ? match.split('=')[1] : null;
  }

  async function answerAllThreeAndSubmit(user: ReturnType<typeof userEvent.setup>) {
    await answerAllThree(user);
    await screen.findByLabelText(/Your work email/i, undefined, { timeout: 1500 });
    await user.type(screen.getByLabelText(/Your work email/i), 'dana@example.com');
    await user.click(screen.getByRole('button', { name: /Send my fit report/i }));
    await screen.findByRole('heading', { name: /Based on what you told us/i }, { timeout: 1500 });
  }

  it('writes the cookie when consent.analytics is true and the quiz completes', async () => {
    clearQuizCookie();
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThreeAndSubmit(user);
    const cookie = getQuizCookie();
    expect(cookie).not.toBeNull();
    const decoded = JSON.parse(decodeURIComponent(cookie as string));
    expect(decoded.tier_signal).toBe('commercial');
    expect(decoded.quiz_completed).toBe(true);
    expect(typeof decoded.demo_run).toBe('boolean');
    clearQuizCookie();
  });

  it('does NOT write the cookie when consent.analytics is false', async () => {
    clearQuizCookie();
    setConsent(false);
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThreeAndSubmit(user);
    expect(getQuizCookie()).toBeNull();
    clearQuizCookie();
  });
});

// ─── Page abandonment via beforeunload ─────────────────────────────────────

describe('PathFinderQuiz — beforeunload abandonment', () => {
  it('fires quiz_abandoned with last_step when the user leaves mid-quiz with consent + email', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await answerAllThree(user);
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
    await answerAllThree(user);
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
    await user.click(screen.getByRole('radio', { name: Q1_LABEL }));
    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
