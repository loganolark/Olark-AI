'use client';

import React, { useState } from 'react';
import Reveal from '@/components/ui/Reveal';

type PersonaId = 'sales-engineer' | 'inside-sales' | 'vp-sales';

interface Persona {
  id: PersonaId;
  pillLabel: string;
  eyebrow: string;
  headline: string;
  paragraphs: React.ReactNode[];
  closer: string;
}

// Personas reskinned for the industrial-supplier ICP. The roles map to the
// people who actually keep an industrial sales floor running — the engineer
// fielding spec questions, the inside rep owning the dealer relationships,
// the VP defending the number to the board. Voice stays second-person and
// concrete; no "leverage" / "synergize" filler.
const PERSONAS: Persona[] = [
  {
    id: 'sales-engineer',
    pillLabel: 'Sales Engineer',
    eyebrow: 'For the one who actually knows the spec',
    headline: 'Stop Being the Search Bar for Your Own Catalog.',
    paragraphs: [
      'Half your inbound is buyers asking about flange bolt sizing or 2" SS ball valve availability — questions the spec sheet on page 47 already answers. You shouldn\'t be a human PDF search engine. Aiden ingests the catalog, the install manuals, the load charts, and answers in the chat instantly — citing the page.',
      'When something walks in that\'s actually engineering-grade — payload, voltage, clear height, seismic zone — Aiden captures it cleanly and hands you the chat with the spec already written down. You join already knowing what the project needs.',
    ],
    closer:
      'You stop answering the same five questions in fifteen different ways. You start scoping the deals you went to school to scope.',
  },
  {
    id: 'inside-sales',
    pillLabel: 'Inside Sales / Account Manager',
    eyebrow: 'For the one owning the dealer relationships',
    headline: 'Every Lead Lands on the Right Desk Before It Goes Cold.',
    paragraphs: [
      'A buyer in California, a direct rep in Wisconsin, a regional installer in Sacramento — and right now, that handoff is happening over Slack DMs and a manual lookup. By Tuesday the lead has gone dark. Aiden uses IP, zip prompts, and territory rules to route to the right rep or premier installer in seconds.',
      'Every chat lands in your CRM with the company, the project size category, the captured specs, and the dealer assignment already attached. No re-typing. No hunting through a transcript for the answer the buyer already gave the bot.',
    ],
    closer:
      'Your reps walk into every call already briefed. Your dealer network gets the leads it earned. Speed-to-lead stops being a stat you wince at.',
  },
  {
    id: 'vp-sales',
    pillLabel: 'VP of Sales',
    eyebrow: 'For the one defending the number',
    headline: 'Walk Into the Forecast Meeting With Pipeline You Can Defend.',
    paragraphs: [
      'Right now, your top-of-funnel is a Contact Us form that disappears into an inbox and an MQL definition that nobody trusts. Aiden gives you a real upstream layer: every visitor scored as High Value (new facility project) or Low Value (one-off small parts), tagged with the technical inputs that prove it.',
      'Your engineers stop being burned on tire-kickers. Your dealer network gets warmer leads, faster. The number you commit to is the number the conversations actually support — and you can show your board the spec sheet that backs it up.',
    ],
    closer:
      'Pipeline that reflects reality. Reporting that doesn\'t require a SQL detour. A number you can hold the line on.',
  },
];

const DEFAULT_PERSONA: PersonaId = 'sales-engineer';

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
                boxShadow: isActive ? '0 0 24px rgba(250, 201, 23,0.25)' : 'none',
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
          background: 'rgba(39, 45, 63,0.5)',
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
