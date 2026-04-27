'use client';

import React, { useState } from 'react';
import CTAButton from '@/components/ui/CTAButton';
import TrainingStateDisplay from '@/components/url-demo/TrainingStateDisplay';
import type { DemoStatus, URLDemoWidgetProps } from '@/types/demo';

function normalizeUrl(raw: string): string {
  return raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
}

function isValidUrl(url: string): boolean {
  const normalized = normalizeUrl(url);
  return /^[^.]+\.[^.]+/.test(normalized) && normalized.length > 3;
}

export default function URLDemoWidget({ onDemoComplete }: URLDemoWidgetProps) {
  const [status, setStatus] = useState<DemoStatus>('idle');
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [fallbackSubmitted, setFallbackSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidUrl(inputValue)) {
      setValidationError('Enter a URL like acme.com');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }
    setValidationError(null);
    const normalized = normalizeUrl(inputValue);
    setSubmittedUrl(normalized);
    setStatus('submitting');
    try {
      const res = await fetch('/api/aiden/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      });
      const data = (await res.json()) as {
        data: { sessionId: string } | null;
        error: { code: string } | null;
      };
      if (!res.ok || data.error) {
        throw new Error(data.error?.code ?? 'TRAIN_FAILED');
      }
      setSessionId(data.data!.sessionId);
      setStatus('training');
    } catch (err) {
      void import('@sentry/nextjs').then(({ captureException }) => captureException(err));
      setStatus('fallback');
    }
  }

  function handleFallbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    void fetch('/api/hubspot/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fallbackEmail, olark_demo_url: submittedUrl }),
    });
    setFallbackSubmitted(true);
  }

  function handleTrainingComplete() {
    setStatus('ready');
    onDemoComplete?.(sessionId);
  }

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .input-shake { animation: shake 400ms ease-out; }
      `}</style>

      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          border: '1px solid var(--od-border)',
          borderRadius: '16px',
          padding: '3.5rem 2rem',
          background: 'var(--od-card)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* ─── Idle / Submitting ─── */}
        {(status === 'idle' || status === 'submitting') && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="yourcompany.com"
              aria-label="Enter your company website URL"
              aria-invalid={!!validationError}
              aria-describedby={validationError ? 'url-error' : undefined}
              className={isShaking ? 'input-shake' : undefined}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                borderRadius: '8px',
                background: 'var(--od-dark)',
                color: 'var(--od-white)',
                border: validationError ? '1.5px solid #E8325A' : '1.5px solid var(--od-border)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              disabled={status !== 'idle'}
            />
            {validationError && (
              <p id="url-error" role="alert" style={{ color: '#E8325A', fontSize: '0.875rem', margin: 0 }}>
                {validationError}
              </p>
            )}
            <CTAButton
              variant="primary"
              size="lg"
              type="submit"
              loading={status === 'submitting'}
            >
              See Aiden on Your Site
            </CTAButton>
          </form>
        )}

        {/* ─── Training ─── */}
        {status === 'training' && (
          <TrainingStateDisplay url={submittedUrl} onComplete={handleTrainingComplete} />
        )}

        {/* ─── Ready (training complete — chat UI added in Story 3.3) ─── */}
        {status === 'ready' && (
          <p style={{ color: 'var(--od-text)', fontSize: '0.9375rem', margin: 0 }}>
            Aiden is ready. Chat coming soon.
          </p>
        )}

        {/* ─── Fallback ─── */}
        {status === 'fallback' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-poppins), ui-sans-serif, sans-serif',
                fontWeight: 900,
                fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
                letterSpacing: '-0.02em',
                color: 'var(--od-white)',
                margin: 0,
              }}
            >
              We&apos;ll set up your custom demo within 24 hours
            </h2>
            {!fallbackSubmitted ? (
              <form onSubmit={handleFallbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="email"
                  value={fallbackEmail}
                  onChange={(e) => setFallbackEmail(e.target.value)}
                  placeholder="you@company.com"
                  aria-label="Your work email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    background: 'var(--od-dark)',
                    color: 'var(--od-white)',
                    border: '1.5px solid var(--od-border)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <CTAButton variant="primary" size="md" type="submit">
                  Get My Demo →
                </CTAButton>
              </form>
            ) : (
              <p style={{ color: 'var(--od-text)', fontSize: '0.9375rem', margin: 0 }}>
                You&apos;re on the list — check your inbox within 24 hours.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
