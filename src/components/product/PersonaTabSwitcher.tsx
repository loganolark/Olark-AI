'use client';

import React, { useState } from 'react';
import Reveal from '@/components/ui/Reveal';

type PersonaId = 'revops' | 'vp-sales' | 'sdr';

interface Persona {
  id: PersonaId;
  pillLabel: string;
  eyebrow: string;
  headline: string;
  paragraphs: React.ReactNode[];
  closer: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'sdr',
    pillLabel: 'SDR',
    eyebrow: 'For the rep doing the work',
    headline: 'All You Have to Do Is Eat.',
    paragraphs: [
      'Monday morning, you open your queue and every chat handoff is already pre-qualified — company size, role, inbound intent, the questions they asked, the objections they raised. No cold opens. No twenty minutes spent figuring out who you’re talking to.',
      'You walk in briefed. The visitor walks in expecting someone who already knows their context. That’s the difference between a chat queue that drains your day and one that compounds your wins.',
    ],
    closer:
      'Aiden does the qualifying. You do what you’re great at — closing the conversation a real human is owed.',
  },
  {
    id: 'revops',
    pillLabel: 'RevOps Director',
    eyebrow: 'For the systems thinker',
    headline: 'Every Conversation Logs Itself, Routes Itself, Reports Itself.',
    paragraphs: [
      'Every visitor exchange becomes a clean record — company size, intent signal, source, full transcript — written straight to HubSpot with the right segmentation. No more chasing reps to log calls. No more pivot-table forensics on what your funnel actually did last month.',
      'Aiden gives you the data layer you’ve quietly been fighting for. Routing rules respected. Tier signals attached. Reporting that doesn’t require a SQL detour.',
    ],
    closer:
      'Your pipeline finally reflects reality — without anyone having to manage it.',
  },
  {
    id: 'vp-sales',
    pillLabel: 'VP of Sales',
    eyebrow: 'For the number-keeper',
    headline: 'Walk Into Monday Knowing the Pipeline Is Real.',
    paragraphs: [
      'When every chat is qualified, briefed, and routed, your reps spend their time on conversations that move the deal — not on triage that should never have been theirs. Pipeline coverage stops being a guessing game.',
      'You walk into the forecast meeting with a number you can defend. Your team walks in already up to speed. Aiden does the upstream work so the conversation that closes the deal can actually happen.',
    ],
    closer:
      'The number you commit to is the number the conversations support.',
  },
];

const DEFAULT_PERSONA: PersonaId = 'sdr';

export default function PersonaTabSwitcher() {
  const [activeId, setActiveId] = useState<PersonaId>(DEFAULT_PERSONA);
  const active = PERSONAS.find((p) => p.id === activeId) ?? PERSONAS[0];

  return (
    <div data-testid="persona-tab-switcher">
      <p
        style={{
          color: 'var(--od-gold)',
          fontSize: '0.8125rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '1rem',
        }}
      >
        Built for the people doing the work
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-poppins), ui-sans-serif, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          letterSpacing: '-0.025em',
          color: 'var(--od-white)',
          textAlign: 'center',
          margin: '0 0 2rem',
        }}
      >
        Three Roles. Three Wins.
      </h2>

      <div
        role="tablist"
        aria-label="Personas"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.625rem',
          justifyContent: 'center',
          marginBottom: '2.25rem',
        }}
      >
        {PERSONAS.map((p) => {
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`persona-tab-${p.id}`}
              aria-selected={isActive}
              aria-controls={`persona-panel-${p.id}`}
              tabIndex={isActive ? 0 : -1}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => setActiveId(p.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '100px',
                padding: '0.5rem 1.125rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                letterSpacing: '0.01em',
                cursor: 'pointer',
                transition:
                  'background-color 200ms ease-out, color 200ms ease-out, border-color 200ms ease-out',
                fontFamily: 'inherit',
                background: isActive ? 'var(--od-gold)' : 'rgba(160,157,216,0.08)',
                color: isActive ? 'var(--od-dark)' : 'var(--od-text)',
                border: isActive
                  ? '1px solid var(--od-gold)'
                  : '1px solid var(--od-border)',
                boxShadow: isActive ? '0 0 24px rgba(245,194,0,0.25)' : 'none',
              }}
            >
              {p.pillLabel}
            </button>
          );
        })}
      </div>

      <Reveal
        key={active.id}
        as="div"
        role="tabpanel"
        id={`persona-panel-${active.id}`}
        aria-labelledby={`persona-tab-${active.id}`}
        data-testid={`persona-panel-${active.id}`}
        threshold={0.05}
        offset={10}
        duration={400}
        style={{
          background: 'rgba(15,13,46,0.5)',
          border: '1px solid var(--od-border)',
          borderRadius: '16px',
          padding: '2.5rem clamp(1.5rem, 4vw, 2.5rem)',
          maxWidth: '720px',
          margin: '0 auto',
        }}
      >
        <p
          style={{
            color: 'var(--od-pink)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            margin: '0 0 1rem',
          }}
        >
          {active.eyebrow}
        </p>
        <h3
          style={{
            fontFamily: 'var(--font-poppins), ui-sans-serif, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--od-white)',
            margin: '0 0 1.5rem',
          }}
        >
          {active.headline}
        </h3>
        {active.paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--od-text)',
              margin: '0 0 1rem',
              fontWeight: 300,
            }}
          >
            {p}
          </p>
        ))}
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--od-muted)',
            margin: 0,
            fontStyle: 'italic',
            fontWeight: 300,
          }}
        >
          {active.closer}
        </p>
      </Reveal>
    </div>
  );
}
