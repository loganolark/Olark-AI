'use client';

import React, { useState } from 'react';
import CTAButton from '@/components/ui/CTAButton';
import TrainingStateDisplay from '@/components/url-demo/TrainingStateDisplay';
import ChatMessage from '@/components/url-demo/ChatMessage';
import { trackEvent } from '@/lib/analytics';
import type { DemoStatus, URLDemoWidgetProps, ChatMsg } from '@/types/demo';

const STARTER_CHIPS = [
  'How does pricing work?',
  'What makes you different from competitors?',
  'How long does implementation take?',
];

function normalizeUrl(raw: string): string {
  return raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '').trim();
}

function isValidUrl(url: string): boolean {
  const normalized = normalizeUrl(url);
  return /^[^.]+\.[^.]+/.test(normalized) && normalized.length > 3;
}

/**
 * Writes the URL demo session to sessionStorage so downstream components
 * (PathFinderQuiz on completion, ConversionPageShell variant selection,
 * HubSpotMeetingEmbed on booking) can include demo signals in their writes.
 *
 * Shape consumed by `src/lib/session-signals.ts` helpers:
 *   { sessionId: string, url: string, exchangeCount: number }
 */
function writeDemoSession(payload: { sessionId: string; url: string; exchangeCount: number }): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem('olark_demo_session', JSON.stringify(payload));
  } catch {
    /* defensive — sessionStorage unavailable (private browsing edge cases) */
  }
}

export default function URLDemoWidget({ onDemoComplete, onUnlockMore, apiEndpoint }: URLDemoWidgetProps) {
  const [status, setStatus] = useState<DemoStatus>('idle');
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [fallbackSubmitted, setFallbackSubmitted] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);

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
    trackEvent('url_demo_submitted', { url: normalized });
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
    setMessages([{
      role: 'aiden',
      content: `I've reviewed ${submittedUrl}. I know your product and I'm ready to answer questions your prospects actually ask. What would you like to test?`,
    }]);
    setStatus('ready');
    trackEvent('url_demo_training_complete');
    writeDemoSession({ sessionId, url: submittedUrl, exchangeCount: 0 });
    onDemoComplete?.(sessionId);
  }

  async function handleSendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const isFirstMessage = messages.filter((m) => m.role === 'user').length === 0;
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setChatInput('');
    setStatus('active');
    setIsTyping(true);
    if (isFirstMessage) trackEvent('url_demo_first_message');

    try {
      const chatEndpoint = apiEndpoint ?? '/api/aiden/chat';
      const res = await fetch(chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: trimmed }),
      });
      let aidenContent = '';
      const contentType = res.headers.get('Content-Type') ?? '';
      if (contentType.includes('application/json')) {
        const data = (await res.json()) as {
          data: { content?: string; message?: string; response?: string } | null;
          error: unknown;
        };
        aidenContent =
          data.data?.content ??
          data.data?.message ??
          data.data?.response ??
          "I'm ready to help — ask me anything about your site.";
      } else {
        aidenContent = (await res.text()) || "I'm ready to help — ask me anything about your site.";
      }
      const newCount = exchangeCount + 1;
      setExchangeCount(newCount);
      setMessages((prev) => [...prev, { role: 'aiden', content: aidenContent }]);
      trackEvent('url_demo_message_count', { count: newCount });
      writeDemoSession({ sessionId, url: submittedUrl, exchangeCount: newCount });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'aiden', content: "I'm having trouble responding right now. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleChatKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage(chatInput);
    }
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
                border: validationError ? '1.5px solid var(--od-pink)' : '1.5px solid var(--od-border)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              disabled={status !== 'idle'}
            />
            {validationError && (
              <p id="url-error" role="alert" style={{ color: 'var(--od-pink)', fontSize: '0.875rem', margin: 0 }}>
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

        {/* ─── Ready / Active (chat UI) ─── */}
        {(status === 'ready' || status === 'active') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Chat thread */}
            <div
              role="log"
              aria-live="polite"
              aria-label="Conversation with Aiden"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxHeight: '320px',
                overflowY: 'auto',
                paddingRight: '0.25rem',
              }}
            >
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {isTyping && <ChatMessage role="aiden" content="" isTyping />}
            </div>

            {/* Post-demo soft prompt (after 2+ exchanges) */}
            {exchangeCount >= 2 && (
              <div
                style={{
                  borderTop: '1px solid var(--od-border)',
                  paddingTop: '1rem',
                  animation: 'fade-in 300ms ease-in both',
                }}
              >
                <p style={{ color: 'var(--od-text)', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>
                  Want to see what Aiden does with your full CRM and inbound pipeline?
                </p>
                <a
                  href="/get-started"
                  onClick={() => {
                    trackEvent('url_demo_unlock_more');
                    onUnlockMore?.();
                  }}
                  style={{
                    color: 'var(--od-gold)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                  }}
                >
                  See the full platform →
                </a>
              </div>
            )}

            {/* Starter chips (visible in ready state only) */}
            {status === 'ready' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {STARTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    role="button"
                    aria-label={chip}
                    onClick={() => void handleSendMessage(chip)}
                    style={{
                      padding: '0.375rem 0.875rem',
                      fontSize: '0.8125rem',
                      borderRadius: '100px',
                      border: '1px solid var(--od-border)',
                      background: 'transparent',
                      color: 'var(--od-text)',
                      cursor: 'pointer',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Chat input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendMessage(chatInput);
              }}
              style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}
            >
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Ask Aiden anything..."
                aria-label="Chat with Aiden"
                rows={1}
                autoFocus={status === 'ready'}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  borderRadius: '8px',
                  background: 'var(--od-dark)',
                  color: 'var(--od-white)',
                  border: '1.5px solid var(--od-border)',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
              <CTAButton variant="primary" size="md" type="submit" loading={isTyping}>
                Send
              </CTAButton>
            </form>
          </div>
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
