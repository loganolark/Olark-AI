import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizEmailCapture from './QuizEmailCapture';

describe('QuizEmailCapture', () => {
  it('renders label, input, privacy copy, and a disabled submit button by default', () => {
    render(<QuizEmailCapture onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/Your work email/i)).toBeInTheDocument();
    expect(screen.getByText(/No spam\. We.ll send your Aiden fit report/i)).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: /Send my fit report/i });
    expect(submit).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows an inline error after blur with an invalid email and sets aria-invalid', async () => {
    const user = userEvent.setup();
    render(<QuizEmailCapture onSubmit={vi.fn()} />);
    const input = screen.getByLabelText(/Your work email/i);
    await user.type(input, 'not-an-email');
    await user.tab();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'quiz-email-error');
    expect(screen.getByRole('alert')).toHaveTextContent(/Enter a valid email/i);
  });

  it('enables submit and calls onSubmit with a valid email', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<QuizEmailCapture onSubmit={onSubmit} />);
    const input = screen.getByLabelText(/Your work email/i);
    await user.type(input, 'dana@example.com');
    const submit = screen.getByRole('button', { name: /Send my fit report/i });
    expect(submit).not.toHaveAttribute('aria-disabled', 'true');
    await user.click(submit);
    expect(onSubmit).toHaveBeenCalledWith('dana@example.com');
  });

  it('clears the error when the user resumes typing', async () => {
    const user = userEvent.setup();
    render(<QuizEmailCapture onSubmit={vi.fn()} />);
    const input = screen.getByLabelText(/Your work email/i);
    await user.type(input, 'bad');
    await user.tab();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(input);
    await user.type(input, '@example.com');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('pre-fills with initialEmail prop', () => {
    render(<QuizEmailCapture initialEmail="dana@example.com" onSubmit={vi.fn()} />);
    const input = screen.getByLabelText(/Your work email/i) as HTMLInputElement;
    expect(input.value).toBe('dana@example.com');
  });

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<QuizEmailCapture onSubmit={vi.fn()} onBack={onBack} />);
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('does not render a back button when onBack is omitted', () => {
    render(<QuizEmailCapture onSubmit={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });
});
