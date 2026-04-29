'use client';

import React from 'react';

/** Visual + behavioural placeholder that fronts the quiz section before a
 *  visitor decides to start. The whole card is one big button — click
 *  anywhere on it (or activate via Enter/Space) to begin. Designed to
 *  visually match the real quiz card so the swap feels like content
 *  populating into the same shell. */
export interface QuizPlaceholderProps {
  onStart: () => void;
}

export default function QuizPlaceholder({ onStart }: QuizPlaceholderProps) {
  function handleKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStart();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Start the 60-second tier-finder quiz"
      data-testid="quiz-placeholder"
      onClick={onStart}
      onKeyDown={handleKey}
      className="quiz-placeholder"
      style={{
        position: 'relative',
        maxWidth: '720px',
        margin: '0 auto',
        padding: 'clamp(2.25rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)',
        background: 'rgba(74, 67, 153,0.5)',
        border: '1px solid var(--od-border)',
        borderRadius: '20px',
        boxShadow:
          '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(250, 201, 23,0.05) inset',
        cursor: 'pointer',
        textAlign: 'center',
        transition:
          'transform 220ms cubic-bezier(0.16,1,0.3,1), box-shadow 220ms ease',
      }}
    >
      {/* Mini progress preview matching the actual quiz step indicator */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1.75rem',
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              border: '1px solid var(--od-border)',
              backgroundColor: 'transparent',
            }}
          />
        ))}
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
          5 quick questions
        </span>
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
          fontWeight: 900,
          fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: 'var(--od-white)',
          margin: '0 0 0.875rem',
        }}
      >
        Find Your Tier in About a Minute.
      </h3>

      <p
        style={{
          fontSize: '1rem',
          lineHeight: 1.7,
          color: 'var(--od-text)',
          margin: '0 auto 1.75rem',
          maxWidth: '480px',
        }}
      >
        Three questions about your team. We&rsquo;ll route you to the plan
        that fits — no email required.
      </p>

      {/* Topic teaser pills, signalling what's coming without spoiling answers */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}
      >
        {['Company Size', 'Use Case', 'Inbound Volume'].map((label) => (
          <span
            key={label}
            style={{
              display: 'inline-flex',
              padding: '0.25rem 0.75rem',
              borderRadius: '100px',
              background: 'rgba(250, 201, 23,0.10)',
              border: '1px solid rgba(250, 201, 23,0.25)',
              color: 'var(--od-text)',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Pulsing gold CTA. It's purely visual here — the click handler is
          on the outer card so visitors can target anywhere. */}
      <span
        aria-hidden="true"
        className="quiz-placeholder__cta"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          height: '52px',
          padding: '0 1.5rem',
          fontSize: '1rem',
          fontWeight: 700,
          fontFamily: 'var(--font-poppins), ui-sans-serif, sans-serif',
          borderRadius: '100px',
          backgroundColor: 'var(--od-gold)',
          color: 'var(--od-dark)',
          boxShadow:
            '0 0 40px rgba(250, 201, 23,0.35), 0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        Start the Quiz →
      </span>

      <p
        style={{
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: 'var(--od-muted)',
          letterSpacing: '0.05em',
        }}
      >
        or click anywhere on this card
      </p>
    </div>
  );
}
