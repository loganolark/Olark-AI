'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import CTAButton from '@/components/ui/CTAButton';
import PillBadge from '@/components/ui/PillBadge';
import {
  readQuizState,
  writeQuizSession,
  writeQuizState,
} from '@/lib/quiz-state';
import type { PathFinderQuizProps, QuizState } from '@/types/quiz';
import {
  QUIZ_TOTAL_STEPS,
  getOptionLabel,
  getQuestionByStep,
} from './questions';

const ADVANCE_DELAY_MS = 300;
const FINAL_QUESTION_STEP = 3;

type Direction = 'forward' | 'back';

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function PathFinderQuiz({ onAnswersComplete }: PathFinderQuizProps = {}) {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [startedAt, setStartedAt] = useState<string>('');
  const [direction, setDirection] = useState<Direction>('forward');
  const [awaitingNext, setAwaitingNext] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const radiogroupRef = useRef<HTMLDivElement | null>(null);

  // ─── Mount: hydrate from localStorage if a partial state exists ────────────
  // Hydration from localStorage requires a post-mount effect — the server-rendered
  // markup cannot read browser storage, so we sync state on the client tick after mount.
  // The setState calls below are batched into a single re-render by React.
  useEffect(() => {
    const saved = readQuizState();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (
      saved &&
      typeof saved.currentStep === 'number' &&
      saved.currentStep >= 1 &&
      saved.currentStep <= FINAL_QUESTION_STEP
    ) {
      setStep(saved.currentStep);
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

  const persist = useCallback(
    (nextStep: number, nextAnswers: Record<string, string>) => {
      const state: QuizState = {
        currentStep: nextStep,
        answers: nextAnswers,
        emailCaptured: false,
        sessionId: sessionId || generateSessionId(),
        startedAt: startedAt || new Date().toISOString(),
      };
      writeQuizSession(state);
      writeQuizState(state);
    },
    [sessionId, startedAt],
  );

  // ─── Selection + auto-advance ──────────────────────────────────────────────
  const handleSelect = useCallback(
    (value: string) => {
      const currentQuestion = getQuestionByStep(step);
      if (!currentQuestion) return;

      const nextAnswers = { ...answers, [currentQuestion.propertyKey]: value };
      setAnswers(nextAnswers);

      if (step === FINAL_QUESTION_STEP) {
        // Final question answered: commit, fire callback, enter awaiting state.
        persist(step, nextAnswers);
        setAwaitingNext(true);
        if (onAnswersComplete) {
          // Fire after state commit so consumers see the completed answer set.
          // Defer slightly so React commits state before parent reacts.
          setTimeout(() => onAnswersComplete(nextAnswers), ADVANCE_DELAY_MS);
        }
        return;
      }

      // Steps 1 & 2: persist with the next step number, then advance after delay.
      const nextStep = step + 1;
      persist(nextStep, nextAnswers);
      setDirection('forward');
      window.setTimeout(() => {
        setStep(nextStep);
        setFocusedIndex(0);
      }, ADVANCE_DELAY_MS);
    },
    [step, answers, persist, onAnswersComplete],
  );

  // ─── Back navigation ───────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (awaitingNext) {
      // Return from "awaiting 4.4" placeholder back to question 3.
      setAwaitingNext(false);
      setDirection('back');
      setFocusedIndex(0);
      return;
    }
    if (step <= 1) return;
    const prevStep = step - 1;
    const currentQuestion = getQuestionByStep(step);
    const nextAnswers = { ...answers };
    if (currentQuestion) {
      delete nextAnswers[currentQuestion.propertyKey];
    }
    setAnswers(nextAnswers);
    persist(prevStep, nextAnswers);
    setDirection('back');
    setStep(prevStep);
    setFocusedIndex(0);
  }, [step, answers, persist, awaitingNext]);

  // ─── Focus management on step change ───────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (awaitingNext) return;
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
    radios[targetIndex]?.focus();
  }, [step, hydrated, awaitingNext, answers]);

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
        radios[next]?.focus();
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
        const isActive = awaitingNext ? dotStep <= FINAL_QUESTION_STEP : dotStep <= step;
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
        Step {awaitingNext ? FINAL_QUESTION_STEP + 1 : step} of {QUIZ_TOTAL_STEPS}
      </span>
    </div>
  );

  const renderAccumulatedPills = () => {
    const pills: { propertyKey: string; label: string }[] = [];
    const upTo = awaitingNext ? FINAL_QUESTION_STEP : step - 1;
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

  const renderAwaitingPlaceholder = () => (
    <div
      className="quiz-slide quiz-slide--forward"
      role="status"
      style={{
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: 'var(--od-gold)',
          marginBottom: '1rem',
        }}
      >
        Almost there
      </p>
      <p
        style={{
          fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
          fontWeight: 700,
          fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          color: 'var(--od-white)',
          marginBottom: '0.75rem',
        }}
      >
        Coming next: tell us where to send your tier match.
      </p>
      <p
        style={{
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          color: 'var(--od-muted)',
          maxWidth: '420px',
          margin: '0 auto',
        }}
      >
        We&rsquo;ll show you which Aiden tier fits your team — no sales call required.
      </p>
    </div>
  );

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

  const showBack = (step > 1 && !awaitingNext) || awaitingNext;

  return (
    <div
      data-testid="path-finder-quiz"
      style={{
        position: 'relative',
        maxWidth: '720px',
        margin: '0 auto',
        padding: 'clamp(2rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)',
        background: 'rgba(37,34,117,0.5)',
        border: '1px solid var(--od-border)',
        borderRadius: '20px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,194,0,0.05) inset',
      }}
    >
      <progress
        value={awaitingNext ? FINAL_QUESTION_STEP + 1 : step}
        max={QUIZ_TOTAL_STEPS}
        aria-label={`Quiz progress: step ${awaitingNext ? FINAL_QUESTION_STEP + 1 : step} of ${QUIZ_TOTAL_STEPS}`}
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

      {awaitingNext ? renderAwaitingPlaceholder() : renderQuestionScreen()}

      {renderAccumulatedPills()}

      {showBack && (
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
    </div>
  );
}
