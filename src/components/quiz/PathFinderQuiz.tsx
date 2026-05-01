'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import CTAButton from '@/components/ui/CTAButton';
import PillBadge from '@/components/ui/PillBadge';
import {
  readQuizState,
  writeQuizSession,
  writeQuizState,
  getTierSignalFromAnswers,
  getRecommendedPlanFromAnswers,
} from '@/lib/quiz-state';
import {
  readDemoSignals,
  hasDemoRun,
  readPagesVisited,
} from '@/lib/session-signals';
import { useConsent } from '@/lib/consent';
import { trackEvent } from '@/lib/analytics';
import type {
  PathFinderQuizProps,
  QuizState,
  TierSignal,
} from '@/types/quiz';
import type { HubSpotContactPayload } from '@/types/hubspot';
import {
  QUIZ_TOTAL_STEPS,
  TIER_LABELS,
  getOptionLabel,
  getQuestionByStep,
} from './questions';
import QuizEmailCapture from './QuizEmailCapture';
import QuizTierReveal from './QuizTierReveal';

const ADVANCE_DELAY_MS = 300;
const FINAL_QUESTION_STEP = 3;
const EMAIL_STEP = 4;
const REVEAL_STEP = 5;

type Direction = 'forward' | 'back';

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Writes the SSR-readable `olark_session_signals` cookie with personalization
 * signals. Read at request time by Epic 6's ConversionPageShell to select
 * the variant rendered on `/get-started`.
 *
 * Distinct from `localStorage['olark_quiz_state']` (Story 4.2) — that artifact
 * holds the full QuizState for cross-session quiz resume.
 */
function writeSessionSignalsCookie(payload: {
  tier_signal: string;
  demo_run: boolean;
}): void {
  if (typeof document === 'undefined') return;
  try {
    const value = encodeURIComponent(
      JSON.stringify({ ...payload, quiz_completed: true }),
    );
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    document.cookie = `olark_session_signals=${value}; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
  } catch {
    /* defensive */
  }
}

function postHubSpotContact(payload: HubSpotContactPayload): void {
  // Fire-and-forget: never await, never block the quiz UI.
  if (typeof window === 'undefined') return;
  try {
    const body = JSON.stringify(payload);
    void fetch('/api/hubspot/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* swallow — Sentry capture happens server-side in the API route */
    });
  } catch {
    /* JSON.stringify shouldn't fail with our payload, but be defensive */
  }
}

function sendBeaconHubSpot(payload: HubSpotContactPayload): void {
  if (typeof window === 'undefined') return;
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(
        '/api/hubspot/contact',
        new Blob([body], { type: 'application/json' }),
      );
      return;
    }
    void fetch('/api/hubspot/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* defensive */
  }
}

export default function PathFinderQuiz({ onAnswersComplete }: PathFinderQuizProps = {}) {
  const { consent } = useConsent();

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [startedAt, setStartedAt] = useState<string>('');
  const [direction, setDirection] = useState<Direction>('forward');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const [capturedEmail, setCapturedEmail] = useState<string>('');

  const radiogroupRef = useRef<HTMLDivElement | null>(null);
  const quizStartedFiredRef = useRef<boolean>(false);
  const completionFiredRef = useRef<boolean>(false);

  const consentAnalytics = consent.analytics;

  // ─── Mount: hydrate from localStorage if a partial state exists ────────────
  useEffect(() => {
    const saved = readQuizState();
    /* eslint-disable react-hooks/set-state-in-effect */
    // Recoverable states:
    //   currentStep 1–3: resume at the saved question.
    //   currentStep 4+ AND emailCaptured: resume at step 4 (Story 7.2 bouncer return).
    //     Email is intentionally NOT re-hydrated (NFR-S3); user re-enters and proceeds.
    // Anything else (corrupt or out-of-range): start fresh, ignore answers.
    const recoverableQuestion =
      saved &&
      typeof saved.currentStep === 'number' &&
      saved.currentStep >= 1 &&
      saved.currentStep <= FINAL_QUESTION_STEP;
    const recoverableBouncer =
      saved &&
      typeof saved.currentStep === 'number' &&
      saved.currentStep >= EMAIL_STEP &&
      saved.emailCaptured === true;

    if (recoverableQuestion) {
      setStep(saved.currentStep);
      setAnswers(saved.answers ?? {});
      setSessionId(saved.sessionId || generateSessionId());
      setStartedAt(saved.startedAt || new Date().toISOString());
    } else if (recoverableBouncer) {
      setStep(EMAIL_STEP);
      setAnswers(saved.answers ?? {});
      setSessionId(saved.sessionId || generateSessionId());
      setStartedAt(saved.startedAt || new Date().toISOString());
    } else {
      setSessionId(generateSessionId());
      setStartedAt(new Date().toISOString());
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // ─── Consent-gated GA4 helper ──────────────────────────────────────────────
  const track = useCallback(
    (name: string, params?: Record<string, unknown>) => {
      if (!consentAnalytics) return;
      trackEvent(name, params);
    },
    [consentAnalytics],
  );

  // ─── Persist state ─────────────────────────────────────────────────────────
  const persist = useCallback(
    (nextStep: number, nextAnswers: Record<string, string>, emailCaptured: boolean) => {
      const state: QuizState = {
        currentStep: nextStep,
        answers: nextAnswers,
        emailCaptured,
        sessionId: sessionId || generateSessionId(),
        startedAt: startedAt || new Date().toISOString(),
      };
      writeQuizSession(state);
      writeQuizState(state);
    },
    [sessionId, startedAt],
  );

  // ─── HubSpot helpers (consent-gated, fire-and-forget) ──────────────────────
  const buildPartialPayload = useCallback(
    (email: string, currentAnswers: Record<string, string>): HubSpotContactPayload => {
      const allThreeAnswered =
        Boolean(currentAnswers.olark_company_size) &&
        Boolean(currentAnswers.olark_use_case) &&
        Boolean(currentAnswers.olark_inbound_volume);
      const tierSignal: TierSignal | undefined = allThreeAnswered
        ? getTierSignalFromAnswers(currentAnswers)
        : undefined;
      const recommendedPlan = allThreeAnswered
        ? getRecommendedPlanFromAnswers(currentAnswers)
        : undefined;
      return {
        email,
        olark_company_size: currentAnswers.olark_company_size,
        olark_use_case: currentAnswers.olark_use_case,
        olark_inbound_volume: currentAnswers.olark_inbound_volume,
        ...(tierSignal ? { olark_tier_signal: tierSignal } : {}),
        ...(recommendedPlan ? { olark_recommended_plan: recommendedPlan } : {}),
        olark_quiz_partial: true,
      };
    },
    [],
  );

  const buildCompletionPayload = useCallback(
    (email: string, finalAnswers: Record<string, string>): HubSpotContactPayload => {
      const tierSignal = getTierSignalFromAnswers(finalAnswers);
      const recommendedPlan = getRecommendedPlanFromAnswers(finalAnswers);
      const { demoDepth, demoUrl } = readDemoSignals();
      const pagesVisited = readPagesVisited();
      return {
        email,
        olark_company_size: finalAnswers.olark_company_size,
        olark_use_case: finalAnswers.olark_use_case,
        olark_inbound_volume: finalAnswers.olark_inbound_volume,
        olark_tier_signal: tierSignal,
        olark_recommended_plan: recommendedPlan,
        olark_quiz_completed_at: new Date().toISOString(),
        olark_demo_depth: demoDepth,
        olark_demo_url: demoUrl,
        olark_pages_visited: pagesVisited,
        olark_quiz_partial: false,
      };
    },
    [],
  );

  const sendPartial = useCallback(
    (currentAnswers: Record<string, string>, email: string) => {
      if (!consentAnalytics) return;
      if (!email) return;
      postHubSpotContact(buildPartialPayload(email, currentAnswers));
    },
    [consentAnalytics, buildPartialPayload],
  );

  const sendCompletion = useCallback(
    (finalAnswers: Record<string, string>, email: string) => {
      if (!consentAnalytics) return;
      if (!email) return;
      postHubSpotContact(buildCompletionPayload(email, finalAnswers));
    },
    [consentAnalytics, buildCompletionPayload],
  );

  // ─── Selection + auto-advance (steps 1–3) ──────────────────────────────────
  const handleSelect = useCallback(
    (value: string) => {
      const currentQuestion = getQuestionByStep(step);
      if (!currentQuestion) return;

      const nextAnswers = { ...answers, [currentQuestion.propertyKey]: value };
      setAnswers(nextAnswers);

      // quiz_started fires from a useEffect watching `answers`.
      track('quiz_question_answered', {
        step,
        property_key: currentQuestion.propertyKey,
        value,
      });

      if (step === FINAL_QUESTION_STEP) {
        // Final question answered: persist with currentStep=4 (we're moving to email step).
        persist(EMAIL_STEP, nextAnswers, false);
        if (onAnswersComplete) {
          // Backwards-compat hook for any external consumer.
          setTimeout(() => onAnswersComplete(nextAnswers), ADVANCE_DELAY_MS);
        }
        // If email already captured (back-nav re-edit case), fire partial write.
        if (capturedEmail) {
          sendPartial(nextAnswers, capturedEmail);
        }
        setDirection('forward');
        window.setTimeout(() => {
          setStep(EMAIL_STEP);
        }, ADVANCE_DELAY_MS);
        return;
      }

      // Steps 1 & 2: persist with the next step number, then advance after delay.
      const nextStep = step + 1;
      persist(nextStep, nextAnswers, false);
      // If email was already captured (back-nav re-edit), fire partial write.
      if (capturedEmail) {
        sendPartial(nextAnswers, capturedEmail);
      }
      setDirection('forward');
      window.setTimeout(() => {
        setStep(nextStep);
        setFocusedIndex(0);
      }, ADVANCE_DELAY_MS);
    },
    [step, answers, persist, onAnswersComplete, track, sendPartial, capturedEmail],
  );

  // ─── Email submit (step 4) ─────────────────────────────────────────────────
  const handleEmailSubmit = useCallback(
    (email: string) => {
      setCapturedEmail(email);
      track('quiz_email_captured');
      // First HubSpot upsert with email + answers (still partial; tier reveal not seen).
      sendPartial(answers, email);
      persist(REVEAL_STEP, answers, true);
      setDirection('forward');
      setStep(REVEAL_STEP);
    },
    [answers, track, sendPartial, persist],
  );

  // ─── quiz_started fires once when the first answer is committed ──────────
  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    if (quizStartedFiredRef.current) return;
    quizStartedFiredRef.current = true;
    track('quiz_started');
  }, [answers, track]);

  // ─── Completion side-effects on entering step 5 ────────────────────────────
  useEffect(() => {
    if (step !== REVEAL_STEP) return;
    if (completionFiredRef.current) return;
    completionFiredRef.current = true;
    const tierSignal = getTierSignalFromAnswers(answers);
    sendCompletion(answers, capturedEmail);
    track('quiz_completed', { tier_signal: tierSignal });
    // Story 6.1: write SSR-readable personalization cookie (consent-gated).
    if (consentAnalytics && capturedEmail) {
      writeSessionSignalsCookie({ tier_signal: tierSignal, demo_run: hasDemoRun() });
    }
  }, [step, answers, capturedEmail, consentAnalytics, sendCompletion, track]);

  // ─── Back navigation ───────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (step === REVEAL_STEP) {
      // Step 5 → step 4: keep email pre-fill via capturedEmailRef.
      // Reset completionFired so re-entering step 5 fires the completion write again.
      completionFiredRef.current = false;
      setDirection('back');
      setStep(EMAIL_STEP);
      return;
    }
    if (step === EMAIL_STEP) {
      // Step 4 → step 3: preserve all 3 answers (no answer cleared at this boundary).
      setDirection('back');
      setStep(FINAL_QUESTION_STEP);
      setFocusedIndex(0);
      return;
    }
    if (step <= 1) return;
    // Step 2 or 3 → previous: drop the current step's answer.
    const prevStep = step - 1;
    const currentQuestion = getQuestionByStep(step);
    const nextAnswers = { ...answers };
    if (currentQuestion) {
      delete nextAnswers[currentQuestion.propertyKey];
    }
    setAnswers(nextAnswers);
    persist(prevStep, nextAnswers, Boolean(capturedEmail));
    setDirection('back');
    setStep(prevStep);
    setFocusedIndex(0);
  }, [step, answers, persist, capturedEmail]);

  // ─── Focus management on step change (steps 1–3 only) ──────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (step > FINAL_QUESTION_STEP) return;
    const root = radiogroupRef.current;
    if (!root) return;
    const radios = root.querySelectorAll<HTMLElement>('[role="radio"]');
    if (radios.length === 0) return;
    const currentQuestion = getQuestionByStep(step);
    let targetIndex = 0;
    if (currentQuestion) {
      const selectedValue = answers[currentQuestion.propertyKey];
      if (selectedValue) {
        const idx = currentQuestion.options.findIndex((o) => o.value === selectedValue);
        if (idx >= 0) targetIndex = idx;
      }
    }
    setFocusedIndex(targetIndex);
    // preventScroll: the quiz lives near the bottom of the homepage; without
    // this flag, hydrating the radiogroup focuses the first radio and the
    // browser auto-scrolls the page to the quiz on initial load. Same intent
    // for subsequent step transitions — the user is already at the quiz, no
    // need to nudge their viewport.
    radios[targetIndex]?.focus({ preventScroll: true });
  }, [step, hydrated, answers]);

  // ─── Page abandonment via beforeunload ─────────────────────────────────────
  useEffect(() => {
    function onBeforeUnload() {
      if (step >= REVEAL_STEP) return;
      const hasAnyAnswer = Object.keys(answers).length > 0;
      if (!hasAnyAnswer) return;
      if (!consentAnalytics) return;

      if (capturedEmail && step <= FINAL_QUESTION_STEP) {
        // We have email + partial answers but never completed: send a partial via beacon.
        sendBeaconHubSpot(buildPartialPayload(capturedEmail, answers));
      }
      track('quiz_abandoned', { last_step: step });
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [step, answers, capturedEmail, consentAnalytics, track, buildPartialPayload]);

  // ─── Keyboard nav within radiogroup ────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const currentQuestion = getQuestionByStep(step);
      if (!currentQuestion) return;
      const total = currentQuestion.options.length;
      const root = radiogroupRef.current;
      if (!root) return;
      const radios = root.querySelectorAll<HTMLElement>('[role="radio"]');

      const moveFocus = (next: number) => {
        e.preventDefault();
        setFocusedIndex(next);
        // The user is already navigating within the focused radiogroup; we
        // don't want arrow keys to nudge their viewport.
        radios[next]?.focus({ preventScroll: true });
      };

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          moveFocus((focusedIndex + 1) % total);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          moveFocus((focusedIndex - 1 + total) % total);
          break;
        case 'Home':
          moveFocus(0);
          break;
        case 'End':
          moveFocus(total - 1);
          break;
        case ' ':
        case 'Enter': {
          e.preventDefault();
          const opt = currentQuestion.options[focusedIndex];
          if (opt) handleSelect(opt.value);
          break;
        }
        default:
          break;
      }
    },
    [step, focusedIndex, handleSelect],
  );

  // ─── Render helpers ────────────────────────────────────────────────────────
  const tierSignal: TierSignal = useMemo(
    () => getTierSignalFromAnswers(answers),
    [answers],
  );
  const recommendedPlan = useMemo(
    () => getRecommendedPlanFromAnswers(answers),
    [answers],
  );

  const renderProgressDots = () => (
    <div
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '2rem',
        justifyContent: 'center',
      }}
    >
      {Array.from({ length: QUIZ_TOTAL_STEPS }).map((_, i) => {
        const dotStep = i + 1;
        const isActive = dotStep <= step;
        return (
          <span
            key={dotStep}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isActive ? 'var(--od-gold)' : 'transparent',
              border: isActive ? 'none' : '1px solid var(--od-border)',
              transition: 'background-color 200ms ease-out',
            }}
          />
        );
      })}
      <span
        style={{
          marginLeft: '0.75rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--od-muted)',
        }}
      >
        Step {step} of {QUIZ_TOTAL_STEPS}
      </span>
    </div>
  );

  const renderAccumulatedPills = () => {
    const pills: { propertyKey: string; label: string }[] = [];
    const upTo = step <= FINAL_QUESTION_STEP ? step - 1 : FINAL_QUESTION_STEP;
    for (let s = 1; s <= upTo; s += 1) {
      const q = getQuestionByStep(s);
      if (!q) continue;
      const value = answers[q.propertyKey];
      if (!value) continue;
      const label = getOptionLabel(q.propertyKey, value);
      if (!label) continue;
      pills.push({ propertyKey: q.propertyKey, label });
    }
    if (pills.length === 0) return null;
    return (
      <div
        className="quiz-pill-bar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          marginTop: '1.5rem',
          fontSize: '0.8125rem',
          color: 'var(--od-muted)',
          justifyContent: 'center',
        }}
      >
        <span style={{ marginRight: '0.25rem' }}>Your answers so far:</span>
        {pills.map((p) => (
          <PillBadge key={p.propertyKey} variant="gold">
            {p.label}
          </PillBadge>
        ))}
      </div>
    );
  };

  const renderQuestionScreen = () => {
    const currentQuestion = getQuestionByStep(step);
    if (!currentQuestion) return null;

    const slideClass = `quiz-slide quiz-slide--${direction}`;
    const isFiveOptions = currentQuestion.options.length === 5;

    return (
      <div className={slideClass} key={`step-${step}`}>
        <fieldset
          style={{
            border: 0,
            padding: 0,
            margin: 0,
          }}
        >
          <legend
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: 'var(--od-white)',
              marginBottom: '2rem',
              textAlign: 'center',
              display: 'block',
              width: '100%',
            }}
          >
            {currentQuestion.headline}
          </legend>

          <div
            ref={radiogroupRef}
            role="radiogroup"
            aria-required="true"
            aria-label={currentQuestion.headline}
            onKeyDown={handleKeyDown}
            className={`quiz-radiogroup ${isFiveOptions ? 'quiz-radiogroup--five' : ''}`}
          >
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion.propertyKey] === opt.value;
              const hasSelection = Boolean(answers[currentQuestion.propertyKey]);
              const tabIndex = hasSelection
                ? isSelected
                  ? 0
                  : -1
                : focusedIndex === idx
                  ? 0
                  : -1;
              return (
                <div
                  key={opt.value}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={tabIndex}
                  onClick={() => handleSelect(opt.value)}
                  onFocus={() => setFocusedIndex(idx)}
                  className={`quiz-card ${isSelected ? 'quiz-card--selected' : ''}`}
                >
                  <span className="quiz-card__label">{opt.label}</span>
                  {isSelected && (
                    <span aria-hidden="true" className="quiz-card__checkmark">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      </div>
    );
  };

  // ─── Don't render anything until hydration completes (avoids SSR flash) ────
  if (!hydrated) {
    return (
      <div
        aria-hidden="true"
        style={{
          minHeight: '420px',
        }}
      />
    );
  }

  const showBack = step > 1;
  const isQuestionStep = step <= FINAL_QUESTION_STEP;

  return (
    <div
      data-testid="path-finder-quiz"
      style={{
        position: 'relative',
        maxWidth: '720px',
        margin: '0 auto',
        padding: 'clamp(2rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)',
        background: 'rgba(74, 67, 153,0.5)',
        border: '1px solid var(--od-border)',
        borderRadius: '20px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(250, 201, 23,0.05) inset',
      }}
    >
      <progress
        value={step}
        max={QUIZ_TOTAL_STEPS}
        aria-label={`Quiz progress: step ${step} of ${QUIZ_TOTAL_STEPS}`}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          clip: 'rect(0,0,0,0)',
          overflow: 'hidden',
          padding: 0,
          border: 0,
          margin: '-1px',
          whiteSpace: 'nowrap',
        }}
      />

      {renderProgressDots()}

      {isQuestionStep && renderQuestionScreen()}
      {step === EMAIL_STEP && (
        <QuizEmailCapture
          initialEmail={capturedEmail}
          onSubmit={handleEmailSubmit}
          onBack={handleBack}
        />
      )}
      {step === REVEAL_STEP && (
        <QuizTierReveal
          tierSignal={tierSignal}
          recommendedPlan={recommendedPlan}
          onScopeClick={() =>
            track('quiz_cta_clicked', {
              target: 'scope_build',
              tier_signal: tierSignal,
              recommended_plan: recommendedPlan,
            })
          }
          onTierDetailsClick={() =>
            track('quiz_cta_clicked', {
              target: 'tier_details',
              tier_signal: tierSignal,
              recommended_plan: recommendedPlan,
            })
          }
          onBack={handleBack}
        />
      )}

      {isQuestionStep && renderAccumulatedPills()}

      {showBack && isQuestionStep && (
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <CTAButton variant="ghost" size="sm" onClick={handleBack}>
            ← Back
          </CTAButton>
        </div>
      )}

      {/* Hidden helper used by tests / debugging — keeps tier label discoverable when on step 5 */}
      {step === REVEAL_STEP && (
        <span
          data-testid="quiz-tier-label"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px' }}
        >
          {TIER_LABELS[tierSignal]}
        </span>
      )}
    </div>
  );
}
