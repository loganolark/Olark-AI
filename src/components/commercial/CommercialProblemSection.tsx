'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import ProductIcon, { type ProductIconName } from '@/components/ui/ProductIcon';

interface Signal {
  icon: ProductIconName;
  title: string;
  body: string;
  tag: string;
}

// The three problems that define the industrial-supplier ICP — the engineered-
// to-order, dealer-network, technical-spec world. Modelled on the Steel King
// archetype (warehouse-safety / pallet-rack manufacturer with regional dealers
// and six-figure projects) without naming them. Source: PDF brief pp. 6–7.
const SIGNALS: Signal[] = [
  {
    icon: 'inbox-x',
    title: 'Filtering Real Projects from Tire-Kickers',
    body:
      "Your team is bogged down by 'one shelf for my garage' inquiries when they could be scoping a new 50,000sqft facility. Aiden does the technical triage upfront — payload, voltage, NEMA rating — so a real project lands warm and a one-off lands... somewhere else.",
    tag: 'Qualification',
  },
  {
    icon: 'clock',
    title: 'Capturing the Spec Without Losing It in Translation',
    body:
      "An engineer wants to know if a rack handles 3,000 lbs per pair of beams in a seismic zone. By the time that question reaches the rep, half the detail is gone. Aiden captures load capacity, clear height, and forklift type — then attaches a clean PDF spec sheet to the handoff.",
    tag: 'Spec',
  },
  {
    icon: 'shuffle',
    title: 'Routing to the Right Dealer, Not the Wrong Region',
    body:
      "The visitor's in California, your direct rep's in Wisconsin, and the local installer is a third party. Aiden uses IP and zip prompts to route to the regional manager or premier installer in seconds — instead of a manual handoff that loses the lead by Tuesday.",
    tag: 'Dealer Network',
  },
];

export default function CommercialProblemSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { threshold: 0.3, once: true });
  const reduced = useReducedMotion();
  const animate = inView && !reduced;
  const summaryDelayMs = reduced ? 0 : SIGNALS.length * 150 + 100;

  return (
    <section
      className="product-section"
      style={{ backgroundColor: 'var(--od-dark)' }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <blockquote
          data-testid="commercial-problem-quote"
          style={{
            margin: '0 0 2.5rem',
            padding: 0,
            fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
            fontWeight: 700,
            fontSize: 'clamp(1.25rem, 3.2vw, 1.75rem)',
            lineHeight: 1.45,
            color: 'var(--od-white)',
            letterSpacing: '-0.01em',
          }}
        >
          Most B2B sites are{' '}
          <em style={{ fontStyle: 'italic' }}>expensive digital filing
          cabinets</em>{' '}
          — you spend a fortune to get buyers there, then greet them with a
          Contact Us form that goes into a black hole. Industrial buyers
          deserve better.
        </blockquote>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'left',
          }}
        >
          {SIGNALS.map((s, i) => {
            const delayMs = reduced ? 0 : i * 150;
            return (
              <div
                key={s.title}
                data-testid="commercial-problem-signal"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  background: 'var(--od-card)',
                  border: '1px solid var(--od-border)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  opacity: reduced || animate ? 1 : 0,
                  transform:
                    reduced || animate ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    color: 'var(--od-pink)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(239, 78, 115,0.1)',
                  }}
                >
                  <ProductIcon name={s.icon} size={20} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      margin: '0 0 0.375rem',
                      fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--od-white)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--od-muted)',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {s.body}
                  </p>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '100px',
                    padding: '0.25rem 0.625rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(239, 78, 115,0.12)',
                    border: '1px solid rgba(239, 78, 115,0.4)',
                    color: 'var(--od-pink)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.tag}
                </span>
              </div>
            );
          })}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 0.25rem 0',
              color: 'var(--od-text)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              opacity: reduced || animate ? 1 : 0,
              transform:
                reduced || animate ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity 400ms cubic-bezier(0.16,1,0.3,1) ${summaryDelayMs}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${summaryDelayMs}ms`,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              aria-hidden="true"
              style={{
                stroke: 'var(--od-pink)',
                strokeWidth: 2,
                flexShrink: 0,
              }}
            >
              <circle cx="7.5" cy="7.5" r="6" />
              <line x1="7.5" y1="4.5" x2="7.5" y2="8" />
              <circle cx="7.5" cy="10" r="0.75" fill="var(--od-pink)" />
            </svg>
            <span>Three pain points the dead Contact Us form was never going to fix.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
