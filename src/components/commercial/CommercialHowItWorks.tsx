'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import PillBadge from '@/components/ui/PillBadge';

type Phase = 1 | 2 | 3;

const NET_RESULT_BULLETS = [
  'Spec questions answered instantly — from your own catalog',
  'No engineer pulled into a chat that should have been a search',
  'Lead-decay killed: zero "did anyone email back?" moments',
  'Every RFQ scored and tagged before it hits the queue',
  'Dealer + territory routing happens in seconds, not Tuesdays',
  'Your CRM sees the spec sheet, not just the contact info',
];

interface Step {
  number: string;
  tag: string;
  phase: Phase;
  title: string;
  body: string;
}

// Reskinned for the industrial-supplier ICP: technical-question intake,
// dealer/territory routing, CRM + spec-sheet handoff. Same 7-step shape,
// industrial-flavoured copy.
const STEPS: Step[] = [
  {
    number: '01',
    tag: 'Catalog Ingest',
    phase: 1,
    title: 'Aiden Scans Your Site Continuously',
    body: 'Spec sheets, product pages, install manuals, FAQ — Aiden ingests it all and re-ingests it the moment you change a price or add a SKU. No quarterly retraining cycles.',
  },
  {
    number: '02',
    tag: 'Technical Triage',
    phase: 1,
    title: 'Filter the Spec Question from the Sales Question',
    body: 'A buyer asks about flange bolt sizing or load capacity — Aiden answers from your catalog instantly. A buyer asks about a 50,000sqft project — Aiden flags it as a real RFQ.',
  },
  {
    number: '03',
    tag: 'Qualification',
    phase: 1,
    title: 'Capture the Specs That Define the Deal',
    body: "Payload, voltage, NEMA rating, clear height, square footage — Aiden asks the technical questions your engineers would ask, before a human ever joins the chat.",
  },
  {
    number: '04',
    tag: 'CRM Lookup',
    phase: 2,
    title: 'Pull the Account Record in Real Time',
    body: 'Salesforce, HubSpot, Microsoft Dynamics — Aiden plugs into your existing stack and pulls the company, deal stage, and prior interactions before the rep is paged.',
  },
  {
    number: '05',
    tag: 'Geo + Dealer Routing',
    phase: 2,
    title: 'Send the Lead to the Right Region or Distributor',
    body: 'Visitor IP, zip prompt, territory rules — Aiden routes to the regional manager, the premier installer, or the direct rep automatically. No manual handoff games.',
  },
  {
    number: '06',
    tag: 'Briefed Handoff',
    phase: 2,
    title: 'Arm the Rep With the Spec Sheet, Not Just a Name',
    body: 'When a human takes over, they get the full transcript, the captured specs, the CRM record, and (when the buyer wants it) a generated PDF spec summary attached to the conversation.',
  },
  {
    number: '07',
    tag: 'Pipeline Logged',
    phase: 3,
    title: 'Update Your CRM Without Lifting a Finger',
    body: 'Lead score, project size category, technical inputs, dealer assignment — written back to your CRM the moment the conversation closes. No forms. No re-typing.',
  },
];

const PHASES: { phase: Phase; label: string; color: string }[] = [
  { phase: 1, label: 'Phase 1 — Catalog & Triage', color: 'var(--od-gold)' },
  { phase: 2, label: 'Phase 2 — Routing & Handoff', color: 'var(--od-pink)' },
  { phase: 3, label: 'Phase 3 — CRM Logged', color: 'rgba(91,192,190,0.85)' },
];

const PHASE_TAG_STYLES: Record<Phase, React.CSSProperties> = {
  1: {
    background: 'rgba(250, 201, 23,0.15)',
    border: '1px solid rgba(250, 201, 23,0.4)',
    color: 'var(--od-gold)',
  },
  2: {
    background: 'rgba(239, 78, 115,0.15)',
    border: '1px solid rgba(239, 78, 115,0.4)',
    color: 'var(--od-pink)',
  },
  3: {
    background: 'rgba(91,192,190,0.15)',
    border: '1px solid rgba(91,192,190,0.4)',
    color: 'rgba(91,192,190,0.95)',
  },
};

const PHASE_NUM_COLOR: Record<Phase, string> = {
  1: 'rgba(250, 201, 23,0.85)',
  2: 'rgba(239, 78, 115,0.85)',
  3: 'rgba(91,192,190,0.85)',
};

export default function CommercialHowItWorks() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { threshold: 0.2, once: true });
  const reduced = useReducedMotion();
  const animate = inView && !reduced;

  return (
    <section
      className="product-section"
      style={{ backgroundColor: 'var(--od-dark)' }}
    >
      <div ref={ref} style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--od-gold)',
              margin: '0 0 1rem',
            }}
          >
            How It Works
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              margin: '0 0 1.25rem',
            }}
          >
            Seven Steps From Spec Question to Logged Pipeline
          </h2>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--od-text)',
              maxWidth: '720px',
              margin: '0 auto',
            }}
          >
            Aiden runs the full intake-to-handoff workflow for industrial
            supply — from catalog ingest to CRM update — with no engineering
            lift on your side.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem',
          }}
        >
          {PHASES.map((phaseDef, phaseIdx) => {
            const phaseSteps = STEPS.filter((s) => s.phase === phaseDef.phase);
            return (
              <div key={phaseDef.phase}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: phaseDef.color,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {phaseDef.label}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      height: '1px',
                      background: `linear-gradient(to right, ${phaseDef.color}, transparent)`,
                      opacity: 0.5,
                    }}
                  />
                </div>
                <div
                  className="commercial-steps-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {phaseSteps.map((step, stepIdx) => {
                    const delayMs = reduced
                      ? 0
                      : phaseIdx * 300 + stepIdx * 150;
                    return (
                      <article
                        key={step.number}
                        data-testid="commercial-step-card"
                        data-step-num={step.number}
                        data-phase={String(step.phase)}
                        style={{
                          position: 'relative',
                          background: 'var(--od-card)',
                          border: '1px solid var(--od-border)',
                          borderRadius: '14px',
                          padding: '1.5rem',
                          opacity: reduced || animate ? 1 : 0,
                          transform:
                            reduced || animate
                              ? 'translateY(0)'
                              : 'translateY(8px)',
                          transition: `opacity 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '100px',
                            padding: '0.25rem 0.625rem',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            marginBottom: '0.75rem',
                            ...PHASE_TAG_STYLES[step.phase],
                          }}
                        >
                          {step.tag}
                        </span>
                        <div
                          style={{
                            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                            fontWeight: 800,
                            fontSize: '2.25rem',
                            lineHeight: 1,
                            color: PHASE_NUM_COLOR[step.phase],
                            margin: '0 0 0.5rem',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {step.number}
                        </div>
                        <h3
                          style={{
                            margin: '0 0 0.5rem',
                            fontFamily:
                              'var(--font-poppins, Poppins, sans-serif)',
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: 'var(--od-white)',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {step.title}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            color: 'var(--od-muted)',
                            fontSize: '0.9375rem',
                            lineHeight: 1.6,
                          }}
                        >
                          {step.body}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div
          data-testid="commercial-net-result"
          style={{
            marginTop: '3rem',
            padding: '2rem 1.75rem',
            background: 'var(--od-card)',
            border: '1px solid var(--od-border)',
            borderRadius: '14px',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <PillBadge variant="gold">Net Result</PillBadge>
          </div>
          <h3
            style={{
              margin: '0 0 1.25rem',
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 800,
              fontSize: '1.125rem',
              color: 'var(--od-white)',
              letterSpacing: '-0.01em',
            }}
          >
            Your Sales Engineers Get Their Time Back.
          </h3>
          <ul
            role="list"
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0.625rem 1.5rem',
            }}
          >
            {NET_RESULT_BULLETS.map((b) => (
              <li
                key={b}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  color: 'var(--od-text)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.55,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    color: 'var(--od-gold)',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '0.0625rem',
                  }}
                >
                  ✓
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
