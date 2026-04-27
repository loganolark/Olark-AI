import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('@/lib/quiz-state', () => ({
  readQuizState: vi.fn(),
}));

import { useSearchParams } from 'next/navigation';
import { readQuizState } from '@/lib/quiz-state';
import QuizResumeBanner from './QuizResumeBanner';

function setSearchParams(entries: Record<string, string>) {
  const params = new URLSearchParams(entries);
  vi.mocked(useSearchParams).mockReturnValue(params as never);
}

beforeEach(() => {
  vi.mocked(useSearchParams).mockReset();
  vi.mocked(readQuizState).mockReset();
});

describe('QuizResumeBanner', () => {
  it('renders nothing when there are no query params', () => {
    setSearchParams({});
    vi.mocked(readQuizState).mockReturnValue(null);
    const { container } = render(<QuizResumeBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when ?resume=true but no localStorage state exists', () => {
    setSearchParams({ resume: 'true', session: 'abc' });
    vi.mocked(readQuizState).mockReturnValue(null);
    const { container } = render(<QuizResumeBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing on sessionId mismatch', () => {
    setSearchParams({ resume: 'true', session: 'abc' });
    vi.mocked(readQuizState).mockReturnValue({
      currentStep: 3,
      answers: {},
      emailCaptured: false,
      sessionId: 'different-session',
      startedAt: '',
    });
    const { container } = render(<QuizResumeBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the banner with the correct step count when state matches', () => {
    setSearchParams({ resume: 'true', session: 'abc' });
    vi.mocked(readQuizState).mockReturnValue({
      currentStep: 3,
      answers: {},
      emailCaptured: false,
      sessionId: 'abc',
      startedAt: '',
    });
    render(<QuizResumeBanner />);
    expect(screen.getByText(/3 steps in/i)).toBeInTheDocument();
  });

  it('banner anchor href is /#quiz', () => {
    setSearchParams({ resume: 'true', session: 'abc' });
    vi.mocked(readQuizState).mockReturnValue({
      currentStep: 2,
      answers: {},
      emailCaptured: false,
      sessionId: 'abc',
      startedAt: '',
    });
    render(<QuizResumeBanner />);
    expect(
      screen.getByRole('link', { name: /pick up where you left off/i }),
    ).toHaveAttribute('href', '/#quiz');
  });

  it('clicking the dismiss button hides the banner', async () => {
    setSearchParams({ resume: 'true', session: 'abc' });
    vi.mocked(readQuizState).mockReturnValue({
      currentStep: 2,
      answers: {},
      emailCaptured: false,
      sessionId: 'abc',
      startedAt: '',
    });
    const user = userEvent.setup();
    const { container } = render(<QuizResumeBanner />);
    expect(screen.getByTestId('quiz-resume-banner')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Dismiss resume prompt/i }));
    expect(container.firstChild).toBeNull();
  });
});
