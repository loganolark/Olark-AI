'use client';

import React, { useState } from 'react';
import CTAButton from '@/components/ui/CTAButton';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROR_MESSAGE = 'Enter a valid email like name@company.com';

export interface QuizEmailCaptureProps {
  /** Initial email value to pre-fill (e.g. when user navigates back from step 5). */
  initialEmail?: string;
  onSubmit: (email: string) => void;
  onBack?: () => void;
}

export default function QuizEmailCapture({
  initialEmail = '',
  onSubmit,
  onBack,
}: QuizEmailCaptureProps) {
  const [email, setEmail] = useState<string>(initialEmail);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isValid = EMAIL_REGEX.test(email);
  const showError = validationError !== null;

  function handleBlur() {
    if (!email) {
      setValidationError(null);
      return;
    }
    setValidationError(isValid ? null : ERROR_MESSAGE);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (showError) setValidationError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setValidationError(ERROR_MESSAGE);
      return;
    }
    onSubmit(email.trim());
  }

  return (
    <div className="quiz-slide quiz-slide--forward">
      <h2
        style={{
          fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
          fontWeight: 900,
          fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: 'var(--od-white)',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}
      >
        Where should we send your fit report?
      </h2>

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          maxWidth: '440px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}
      >
        <label
          htmlFor="quiz-email"
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--od-muted)',
            letterSpacing: '0.02em',
          }}
        >
          Your work email
        </label>
        <input
          id="quiz-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={showError}
          aria-describedby={showError ? 'quiz-email-error' : undefined}
          placeholder="name@company.com"
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            background: 'var(--od-card)',
            color: 'var(--od-white)',
            border: `1px solid ${showError ? 'var(--od-pink)' : 'var(--od-border)'}`,
            borderRadius: '10px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 150ms ease-out',
          }}
        />
        {showError && (
          <p
            id="quiz-email-error"
            role="alert"
            style={{
              color: 'var(--od-pink)',
              fontSize: '0.8125rem',
              margin: 0,
            }}
          >
            {validationError}
          </p>
        )}
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--od-muted)',
            margin: '0.25rem 0 0',
            lineHeight: 1.5,
          }}
        >
          No spam. We&rsquo;ll send your Aiden fit report.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '0.5rem',
          }}
        >
          <CTAButton
            variant="primary"
            size="lg"
            type="submit"
            disabled={!isValid}
          >
            Send my fit report →
          </CTAButton>
        </div>
      </form>

      {onBack && (
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <CTAButton variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </CTAButton>
        </div>
      )}
    </div>
  );
}
