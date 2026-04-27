'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { readQuizState } from '@/lib/quiz-state';

export default function QuizResumeBanner() {
  const searchParams = useSearchParams();
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!searchParams) return;
    const resume = searchParams.get('resume');
    const sessionParam = searchParams.get('session');
    if (resume !== 'true' || !sessionParam) {
      setStepCount(null);
      return;
    }
    const saved = readQuizState();
    if (!saved || saved.sessionId !== sessionParam) {
      setStepCount(null);
      return;
    }
    if (typeof saved.currentStep === 'number' && saved.currentStep > 0) {
      setStepCount(saved.currentStep);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [searchParams]);

  if (dismissed || stepCount === null) return null;

  return (
    <div
      data-testid="quiz-resume-banner"
      style={{
        background: 'var(--od-card)',
        borderBottom: '1px solid var(--od-border)',
        padding: '0.625rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        fontSize: '0.9375rem',
        color: 'var(--od-text)',
      }}
    >
      <Link
        href="/#quiz"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: '44px',
          padding: '0.5rem 1rem',
          background: 'rgba(245, 194, 0, 0.12)',
          border: '1px solid var(--od-gold)',
          color: 'var(--od-gold)',
          borderRadius: '100px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        You were {stepCount} steps in — pick up where you left off →
      </Link>
      <button
        type="button"
        aria-label="Dismiss resume prompt"
        onClick={() => setDismissed(true)}
        style={{
          background: 'transparent',
          border: 0,
          color: 'var(--od-muted)',
          fontSize: '1.125rem',
          minWidth: '44px',
          minHeight: '44px',
          cursor: 'pointer',
          padding: 0,
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
