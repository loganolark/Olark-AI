import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/quiz-state', () => ({
  readQuizState: vi.fn(),
  readQuizSession: vi.fn(),
  writeQuizState: vi.fn(),
  writeQuizSession: vi.fn(),
  clearQuizState: vi.fn(),
  getTierSignalFromAnswers: vi.fn(),
}));

import {
  readQuizState,
  writeQuizState,
  writeQuizSession,
} from '@/lib/quiz-state';
import PathFinderQuiz from './PathFinderQuiz';

beforeEach(() => {
  vi.mocked(readQuizState).mockReset();
  vi.mocked(readQuizState).mockReturnValue(null);
  vi.mocked(writeQuizState).mockClear();
  vi.mocked(writeQuizSession).mockClear();
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

  it('reads from quiz-state once on mount via useEffect (not during render)', () => {
    // After single render, the mount useEffect calls readQuizState exactly once.
    // mockReset() in beforeEach guarantees a clean per-test count.
    render(<PathFinderQuiz />);
    expect(readQuizState).toHaveBeenCalledTimes(1);
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
    const others = screen
      .getAllByRole('radio')
      .filter((r) => r !== option);
    others.forEach((r) => expect(r).toHaveAttribute('aria-checked', 'false'));
  });

  it('auto-advances to question 2 ~300ms after selection', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    expect(
      await screen.findByRole(
        'radiogroup',
        { name: /primary job/i },
        { timeout: 1500 },
      ),
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

// ─── Back navigation ───────────────────────────────────────────────────────

describe('PathFinderQuiz — back navigation', () => {
  it('back button appears on step 2 and returns to step 1 with prior answer pre-selected', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);
    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });
    const backBtn = screen.getByRole('button', { name: /back/i });
    expect(backBtn).toBeInTheDocument();
    await user.click(backBtn);
    expect(
      screen.getByRole('radiogroup', { name: /How big is your company/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '11–50 employees' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('back navigation removes the just-back-navigated answer from the pill bar', async () => {
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
    // Wait for navigation back to Q2
    const radiogroupQ2 = await screen.findByRole(
      'radiogroup',
      { name: /primary job/i },
      { timeout: 1500 },
    );
    // Q2 answer "Qualify inbound visitors" no longer appears as a pill (only as a card option).
    // Scope the absence check to the Q1 pill bar — it should still show only Q1's pill.
    const pillBar = document.querySelector('.quiz-pill-bar') as HTMLElement | null;
    expect(pillBar).not.toBeNull();
    expect(within(pillBar!).queryByText('Qualify inbound visitors')).not.toBeInTheDocument();
    expect(within(pillBar!).getByText('11–50 employees')).toBeInTheDocument();
    // Sanity: the Q2 card option is still there.
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

// ─── Final question + onAnswersComplete ────────────────────────────────────

describe('PathFinderQuiz — final question completion', () => {
  it('calls onAnswersComplete with all 3 answers after step 3 selection', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<PathFinderQuiz onAnswersComplete={onComplete} />);

    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });

    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole('radiogroup', { name: /inbound traffic/i }, { timeout: 1500 });

    await user.click(screen.getByRole('radio', { name: 'Under 5,000 visits' }));

    // onComplete is called via setTimeout(ADVANCE_DELAY_MS)
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

  it('renders awaiting-next placeholder when no onAnswersComplete prop is provided', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);

    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });

    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole('radiogroup', { name: /inbound traffic/i }, { timeout: 1500 });

    await user.click(screen.getByRole('radio', { name: 'Under 5,000 visits' }));

    expect(
      await screen.findByText(/Coming next/i, undefined, { timeout: 1500 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByText('11–50 employees')).toBeInTheDocument();
    expect(screen.getByText('Qualify inbound visitors')).toBeInTheDocument();
    expect(screen.getByText('Under 5,000 visits')).toBeInTheDocument();
  });

  it('back button from awaiting placeholder returns to question 3 with answer pre-selected', async () => {
    const user = userEvent.setup();
    render(<PathFinderQuiz />);

    await user.click(screen.getByRole('radio', { name: '11–50 employees' }));
    await screen.findByRole('radiogroup', { name: /primary job/i }, { timeout: 1500 });

    await user.click(screen.getByRole('radio', { name: 'Qualify inbound visitors' }));
    await screen.findByRole('radiogroup', { name: /inbound traffic/i }, { timeout: 1500 });

    await user.click(screen.getByRole('radio', { name: 'Under 5,000 visits' }));
    await screen.findByText(/Coming next/i, undefined, { timeout: 1500 });

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
