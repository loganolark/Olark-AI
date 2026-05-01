import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/quiz-state', async () => {
  const actual = await vi.importActual<typeof import('@/lib/quiz-state')>(
    '@/lib/quiz-state',
  );
  return {
    readQuizState: vi.fn(() => null),
    readQuizSession: vi.fn(),
    writeQuizState: vi.fn(),
    writeQuizSession: vi.fn(),
    clearQuizState: vi.fn(),
    getTierSignalFromAnswers: actual.getTierSignalFromAnswers,
    getRecommendedPlanFromAnswers: actual.getRecommendedPlanFromAnswers,
  };
});

vi.mock('@/lib/consent', () => ({
  useConsent: vi.fn(() => ({
    consent: { analytics: false, marketing: false },
    hasInteracted: false,
    acceptAll: vi.fn(),
    updateConsent: vi.fn(),
  })),
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

import HomepageQuizBlock, { QUIZ_START_EVENT } from './HomepageQuizBlock';

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('HomepageQuizBlock — initial state', () => {
  it('shows the QuizPlaceholder, NOT the live PathFinderQuiz', () => {
    render(<HomepageQuizBlock />);
    expect(screen.getByTestId('quiz-placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('path-finder-quiz')).toBeNull();
  });

  it('renders the "Still Not Sure Which Tier Fits?" headline above the quiz card', () => {
    render(<HomepageQuizBlock />);
    const heading = screen.getByRole('heading', {
      level: 2,
      name: /Still Not Sure Which Tier Fits/i,
    });
    const placeholder = screen.getByTestId('quiz-placeholder');
    const cmp = heading.compareDocumentPosition(placeholder);
    expect(cmp & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('does NOT render the old redundant subhead + "Take the 60-Second Quiz" button (collapsed into the placeholder card)', () => {
    render(<HomepageQuizBlock />);
    expect(
      screen.queryByText(/Sixty seconds, then you decide/i),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: /Take the 60-Second Quiz/i }),
    ).toBeNull();
  });
});

describe('HomepageQuizBlock — start triggers', () => {
  it('clicking the placeholder card itself starts the quiz', async () => {
    const user = userEvent.setup();
    render(<HomepageQuizBlock />);
    await user.click(screen.getByTestId('quiz-placeholder'));
    expect(screen.queryByTestId('quiz-placeholder')).toBeNull();
    expect(screen.getByTestId('path-finder-quiz')).toBeInTheDocument();
  });

  it('Enter key on the focused placeholder also starts the quiz', async () => {
    const user = userEvent.setup();
    render(<HomepageQuizBlock />);
    const placeholder = screen.getByTestId('quiz-placeholder');
    placeholder.focus();
    await user.keyboard('{Enter}');
    expect(screen.queryByTestId('quiz-placeholder')).toBeNull();
    expect(screen.getByTestId('path-finder-quiz')).toBeInTheDocument();
  });

  it('Space key on the focused placeholder starts the quiz', async () => {
    const user = userEvent.setup();
    render(<HomepageQuizBlock />);
    const placeholder = screen.getByTestId('quiz-placeholder');
    placeholder.focus();
    await user.keyboard(' ');
    expect(screen.getByTestId('path-finder-quiz')).toBeInTheDocument();
  });

  it('listens for the QUIZ_START_EVENT — dispatching it from anywhere starts the quiz', () => {
    render(<HomepageQuizBlock />);
    expect(screen.getByTestId('quiz-placeholder')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new CustomEvent(QUIZ_START_EVENT));
    });
    expect(screen.queryByTestId('quiz-placeholder')).toBeNull();
    expect(screen.getByTestId('path-finder-quiz')).toBeInTheDocument();
  });
});
