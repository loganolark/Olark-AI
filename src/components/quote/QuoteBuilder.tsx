'use client';

import React, { useEffect, useRef, useState } from 'react';
import CTAButton from '@/components/ui/CTAButton';
import { useConsent } from '@/lib/consent';
import { trackEvent } from '@/lib/analytics';
import {
  PLAN_DATA,
  type Plan,
  type QuizTier,
  type QuoteHistoryItem,
  type QuoteQuestion,
  type QuoteState,
} from '@/types/quote';
import type { HubSpotContactPayload } from '@/types/hubspot';
import { calcPricing, formatUSD } from '@/lib/quote-pricing';
import {
  firstQuestion,
  getPlan,
  nextQuestion,
  RESULT,
} from '@/lib/quote-tree';

const ADVANCE_DELAY_MS = 220;
const BOOKING_HREF = 'https://hello.olark.com/meetings/logan-stuard/aiden';

/** Plans whose pricing is gated behind an email capture. SMB tiers
 *  (essentials, advanced) show pricing openly — they're transactional. The
 *  upper tiers below imply a real sales conversation, so we trade pricing
 *  visibility for a contactable lead. */
const EMAIL_GATED_PLANS: ReadonlyArray<Plan> = ['pro', 'signature', 'bespoke'];

const QUOTE_EMAIL_STORAGE_KEY = 'olark_quote_email_captured';

function readQuoteEmailCaptured(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(QUOTE_EMAIL_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeQuoteEmailCaptured(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(QUOTE_EMAIL_STORAGE_KEY, 'true');
  } catch {
    /* defensive */
  }
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function quizTierToTierSignal(tier: QuizTier): 'essentials' | 'lead_gen' | 'commercial' {
  if (tier === 'advanced') return 'lead_gen';
  return tier;
}

/**
 * Fire-and-forget POST to /api/hubspot/contact when a visitor unlocks gated
 * pricing with their email. Mirrors the wiring used by PathFinderQuiz so the
 * shape, transport, and unmount-resilience all match what the live HubSpot
 * integration already accepts.
 *
 *   • Strongly typed via HubSpotContactPayload — adding fields that aren't on
 *     the type (e.g. an `olark_quote_partial` we made up) would silently get
 *     rejected by HubSpot, so we constrain to documented properties only.
 *   • navigator.sendBeacon when available so the request survives nav/unmount;
 *     fetch+keepalive fallback otherwise.
 *   • Plan-name granularity (pro vs signature vs bespoke) isn't sent because
 *     no HubSpot custom property exists for it yet. olark_tier_signal already
 *     conveys the band (essentials / lead_gen / commercial).
 */
function postQuoteEmailToHubSpot(email: string, tier: QuizTier): void {
  if (typeof window === 'undefined') return;
  const payload: HubSpotContactPayload = {
    email,
    olark_tier_signal: quizTierToTierSignal(tier),
  };
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      const queued = navigator.sendBeacon('/api/hubspot/contact', blob);
      if (queued) return;
    }
    void fetch('/api/hubspot/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* swallow — server logs to Sentry */
    });
  } catch {
    /* defensive — JSON.stringify shouldn't fail with these inputs */
  }
}

export interface QuoteBuilderProps {
  tier: QuizTier;
  onComplete?: (plan: Plan, answers: Record<string, string>) => void;
}

function shortText(text: string): string {
  return text.length > 50 ? `${text.slice(0, 47)}…` : text;
}

export default function QuoteBuilder({ tier, onComplete }: QuoteBuilderProps) {
  const { consent } = useConsent();
  const consentAnalytics = consent.analytics;
  const [step, setStep] = useState<'collecting' | 'result'>('collecting');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<QuoteHistoryItem[]>([]);
  const [track, setTrack] = useState<QuoteState['track']>(null);
  const [current, setCurrent] = useState<QuoteQuestion | null>(() => firstQuestion());
  const [textValue, setTextValue] = useState<string>('');
  const [shake, setShake] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inheritOpen, setInheritOpen] = useState<boolean>(false);
  const [completedPlan, setCompletedPlan] = useState<Plan | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const [emailCaptured, setEmailCaptured] = useState<boolean>(false);
  const [emailValue, setEmailValue] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  // Restore prior email-gate clearance on mount so a returning visitor isn't
  // re-asked across page navigations within the session/site.
  useEffect(() => {
    if (readQuoteEmailCaptured()) {
      setEmailCaptured(true);
    }
  }, []);

  // Reset on tier change. Multiple setStates batched into one re-render by React.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setStep('collecting');
    setAnswers({});
    setHistory([]);
    setTrack(null);
    setCurrent(firstQuestion());
    setTextValue('');
    setSelectedOption(null);
    setInheritOpen(false);
    setCompletedPlan(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [tier]);

  // Focus the input when a text/number question renders
  useEffect(() => {
    if (current && (current.type === 'text' || current.type === 'text-optional' || current.type === 'number')) {
      inputRef.current?.focus();
    }
  }, [current]);

  function commit(qId: string, value: string, label: string, qText: string) {
    const nextAnswers = { ...answers, [qId]: value };
    const nextHistory: QuoteHistoryItem[] = [
      ...history,
      { qShort: shortText(qText), aLabel: label },
    ];
    const machineState: QuoteState = {
      answers: nextAnswers,
      history: nextHistory,
      track,
    };
    const next = nextQuestion(tier, qId, value, machineState);
    setAnswers(nextAnswers);
    setHistory(nextHistory);
    setTrack(machineState.track);
    setTextValue('');
    setSelectedOption(null);

    if (next === RESULT) {
      const plan = getPlan(tier, machineState);
      setCompletedPlan(plan);
      setStep('result');
      onComplete?.(plan, nextAnswers);
      return;
    }
    setCurrent(next);
  }

  function handleOptionClick(value: string, label: string) {
    if (!current || current.type !== 'options') return;
    setSelectedOption(value);
    window.setTimeout(() => {
      commit(current.id, value, label, current.text);
    }, ADVANCE_DELAY_MS);
  }

  function handleTextSubmit() {
    if (!current) return;
    const trimmed = textValue.trim();
    if (!trimmed && current.type !== 'text-optional') {
      setShake(true);
      window.setTimeout(() => setShake(false), 1200);
      inputRef.current?.focus();
      return;
    }
    const value = trimmed || 'None';
    const label = trimmed || 'None specified';
    commit(current.id, value, label, current.text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSubmit();
    }
  }

  function restart() {
    setStep('collecting');
    setAnswers({});
    setHistory([]);
    setTrack(null);
    setCurrent(firstQuestion());
    setTextValue('');
    setSelectedOption(null);
    setInheritOpen(false);
    setCompletedPlan(null);
  }

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = emailValue.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError('Please enter a valid email address.');
      emailInputRef.current?.focus();
      return;
    }
    setEmailError('');
    setEmailCaptured(true);
    writeQuoteEmailCaptured();
    // Consent-gate the HubSpot push the same way PathFinderQuiz does — when
    // the visitor hasn't accepted analytics/marketing we still unlock the
    // pricing locally, but we don't transmit their email off-device.
    if (consentAnalytics && completedPlan) {
      postQuoteEmailToHubSpot(trimmed, tier);
      trackEvent('quote_email_unlock', {
        plan: completedPlan,
        tier_signal: quizTierToTierSignal(tier),
      });
    }
  }

  // ─── Result rendering ──────────────────────────────────────────────────────
  if (step === 'result' && completedPlan) {
    const plan = completedPlan;
    const data = PLAN_DATA[plan];
    const seatsAnswer = answers.seats || '1';
    const pricing = calcPricing(plan, seatsAnswer);
    const company = answers.company || 'Your Company';
    const includedValue = pricing.includedSeats * pricing.seatPrice;
    const requiresEmail = EMAIL_GATED_PLANS.includes(plan);
    const isLocked = requiresEmail && !emailCaptured;

    return (
      <div data-testid="quote-result" className="quote-builder">
        <QuoteHistory history={history} />
        <div className="quote-result-wrap">
          <div className="quote-result-header">
            <div className="quote-result-badge">✦ Your Recommended Plan</div>
            <div className="quote-result-plan" data-testid="quote-plan-name">{data.name}</div>
            <p className="quote-result-company">
              Custom quote prepared for <strong>{company}</strong>
            </p>
            <p className="quote-result-tagline">{data.tagline}</p>
          </div>

          {isLocked && (
            <form
              className="quote-email-gate"
              data-testid="quote-email-gate"
              onSubmit={handleEmailSubmit}
              noValidate
            >
              <p className="quote-email-gate__heading">
                Custom pricing for {data.name} is one click away.
              </p>
              <p className="quote-email-gate__body">
                {data.name} sits at the higher end of the Aiden lineup — drop your
                email and we&rsquo;ll reveal your full custom quote, plus follow up
                with the right rep to walk through it.
              </p>
              <div className="quote-email-gate__form">
                <input
                  ref={emailInputRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="quote-email-gate__input"
                  placeholder="you@company.com"
                  aria-label="Email address"
                  aria-invalid={emailError ? 'true' : 'false'}
                  aria-describedby={emailError ? 'quote-email-error' : undefined}
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                />
                <button
                  type="submit"
                  className="quote-submit-btn"
                  data-testid="quote-email-submit"
                >
                  Reveal Pricing →
                </button>
              </div>
              {emailError && (
                <p
                  id="quote-email-error"
                  role="alert"
                  className="quote-email-gate__error"
                >
                  {emailError}
                </p>
              )}
              <p className="quote-email-gate__fineprint">
                We won&rsquo;t spam you. Your email is used to follow up with the
                right rep about this quote.
              </p>
            </form>
          )}

          <div
            className="quote-pricing-card"
            data-testid="quote-pricing-card"
            data-locked={isLocked ? 'true' : 'false'}
            aria-hidden={isLocked ? 'true' : undefined}
          >
            <div className="quote-pricing-label">Pricing Breakdown</div>
            <div className="quote-pricing-row">
              <span className="qlabel">{data.name} Platform Fee</span>
              <span className="qvalue">{formatUSD(pricing.base)}/yr</span>
            </div>
            <div className="quote-pricing-row">
              <span className="qlabel">
                {pricing.includedSeats} included seat{pricing.includedSeats !== 1 ? 's' : ''} (
                {formatUSD(includedValue)} value/yr)
              </span>
              <span className="qvalue">Included</span>
            </div>
            {pricing.additional > 0 && (
              <div className="quote-pricing-row">
                <span className="qlabel">
                  {pricing.additional} additional seat{pricing.additional !== 1 ? 's' : ''} ×{' '}
                  {formatUSD(pricing.seatPrice)}/yr
                </span>
                <span className="qvalue">{formatUSD(pricing.seatCost)}</span>
              </div>
            )}
            <div className="quote-pricing-row">
              <span className="qlabel">Managed Service (Onboarding, QBR, Priority Support)</span>
              <span className="qvalue">Included</span>
            </div>
            <div className="quote-pricing-row qtotal">
              <span className="qlabel">Total Annual Cost</span>
              <span className="qvalue" data-testid="quote-total">
                {formatUSD(pricing.total)}
              </span>
            </div>
          </div>

          <div className="quote-features">
            <div className="quote-section-sublabel">What&rsquo;s Included in {data.name}</div>
            <div className="quote-features-grid">
              {data.features.map((f) => {
                if (data.inheritedLabel && f === data.inheritedLabel) {
                  return (
                    <React.Fragment key={f}>
                      <button
                        type="button"
                        className={`quote-inherit-toggle ${inheritOpen ? 'open' : ''}`}
                        aria-expanded={inheritOpen}
                        aria-controls="quote-inherit-grid"
                        onClick={() => setInheritOpen((v) => !v)}
                      >
                        <span>
                          {f} — see what&rsquo;s included {inheritOpen ? '↑' : '↓'}
                        </span>
                      </button>
                      <div
                        id="quote-inherit-grid"
                        className="quote-inherited-grid"
                        hidden={!inheritOpen}
                      >
                        {data.inheritedFeatures?.map((fi) => (
                          <div key={fi} className="quote-feature-item inherited">
                            <span className="quote-feature-dot" aria-hidden="true" />
                            <span>{fi}</span>
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  );
                }
                return (
                  <div key={f} className="quote-feature-item">
                    <span className="quote-feature-dot" aria-hidden="true" />
                    <span>{f}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="quote-managed">
            <div className="quote-section-sublabel">Managed Service (Included)</div>
            {data.managed.map((m) => (
              <div key={m} className="quote-managed-item">
                <span aria-hidden="true">✓</span>
                <span>{m}</span>
              </div>
            ))}
          </div>

          <div className="quote-action-row">
            <CTAButton
              variant="ghost"
              size="md"
              disabled={isDownloadingPdf}
              loading={isDownloadingPdf}
              onClick={async () => {
                setIsDownloadingPdf(true);
                try {
                  const { downloadQuotePDF } = await import('@/lib/quote-pdf');
                  await downloadQuotePDF({
                    plan,
                    company,
                    seats: seatsAnswer,
                  });
                } catch (err) {
                  console.error('[QuoteBuilder] PDF generation failed', err);
                } finally {
                  setIsDownloadingPdf(false);
                }
              }}
            >
              Download a detailed PDF quote
            </CTAButton>
            <CTAButton variant="primary" size="md" href={BOOKING_HREF}>
              Book Implementation Call →
            </CTAButton>
          </div>

          <button
            type="button"
            className="quote-restart-btn"
            onClick={restart}
          >
            ← Start over
          </button>
        </div>
      </div>
    );
  }

  // ─── Collecting rendering ──────────────────────────────────────────────────
  if (!current) return null;
  const qNum = history.length + 1;

  return (
    <div data-testid="quote-builder" className="quote-builder">
      <QuoteHistory history={history} />
      <div className="quote-question-card">
        <div className="quote-question-label">Question {qNum}</div>
        <h3 className="quote-question-text">{current.text}</h3>

        {current.type === 'options' && current.options && (
          <div className="quote-options" role="group">
            {current.options.map((o) => {
              const isSelected = selectedOption === o.value;
              const isDisabled = selectedOption !== null && !isSelected;
              return (
                <button
                  key={o.value}
                  type="button"
                  className={`quote-opt ${isSelected ? 'selected' : ''}`}
                  disabled={isDisabled}
                  onClick={() => handleOptionClick(o.value, o.label)}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}

        {(current.type === 'text' || current.type === 'text-optional' || current.type === 'number') && (
          <div className="quote-input-row">
            <input
              ref={inputRef}
              type={current.type === 'number' ? 'number' : 'text'}
              className={`quote-input ${shake ? 'shake' : ''}`}
              placeholder={current.placeholder ?? (current.type === 'text-optional' ? 'Leave blank if none' : '')}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={current.text}
              min={current.type === 'number' ? 1 : undefined}
            />
            <button
              type="button"
              className="quote-submit-btn"
              onClick={handleTextSubmit}
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuoteHistory({ history }: { history: QuoteHistoryItem[] }) {
  if (history.length === 0) return null;
  return (
    <div className="quote-history" aria-label="Previous answers">
      {history.map((h, i) => (
        <div key={i} className="quote-history-item">
          <span className="quote-history-check" aria-hidden="true">
            ✓
          </span>
          <span className="quote-history-text">
            <strong>{h.qShort}:</strong> {h.aLabel}
          </span>
        </div>
      ))}
    </div>
  );
}
