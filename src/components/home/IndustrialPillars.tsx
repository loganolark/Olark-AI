'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

interface Pillar {
  num: string;
  title: string;
  body: string;
}

// The four "Engineered for industrial supply" pillars from the brief
// (PDF p. 3 + HTML mockup). Single source of differentiation against the
// generic AI-chat field — each one calls out a thing a brand-new AI startup
// literally cannot say.
const PILLARS: Pillar[] = [
  {
    num: '01',
    title: 'Built for industrial, period.',
    body:
      "We're not selling the same bot to dentists and SaaS startups. Every model, every routing rule, every default tone is calibrated for industrial buyers. It speaks PSI, not vibes.",
  },
  {
    num: '02',
    title: 'Plays with your stack.',
    body:
      "Salesforce, HubSpot, Microsoft Dynamics, that custom thing your IT lead built in 2014 — we work with what you have and build the integration where one doesn't exist. No rip and replace. No new tool for your team to learn.",
  },
  {
    num: '03',
    title: 'It scans your site continuously.',
    body:
      "Update a spec, change a price, add a new SKU — the bot picks it up. No quarterly retraining cycles. The information your buyer gets is the information that's actually live on your site.",
  },
  {
    num: '04',
    title: 'We still believe in humans.',
    body:
      "The point isn't to remove your sales team from the conversation. It's to make sure they only get the conversations worth having. Aiden enhances the human moment — it doesn't replace it.",
  },
];

/**
 * The four industrial-supply pillars. Lives high on the homepage as the
 * differentiation moment — what makes Aiden different from every other
 * AI-chat company that landed on the market last quarter.
 */
export default function IndustrialPillars() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { threshold: 0.2, once: true });
  const reduced = useReducedMotion();
  const animate = inView && !reduced;

  return (
    <section
      style={{
        backgroundColor: 'var(--od-navy)',
        padding: '5rem 1.5rem',
      }}
    >
      <div ref={ref} style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--od-pink)',
              margin: '0 0 1rem',
            }}
          >
            How We&rsquo;re Different
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              margin: '0 0 1rem',
            }}
          >
            Engineered for Industrial Supply
          </h2>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--od-text)',
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            Plenty of bots. Plenty of AI. Almost none of them have spent 17
            years listening to industrial buyers ask the same five questions
            in fifteen different ways. We have. That&rsquo;s the difference.
          </p>
        </div>

        <ul
          role="list"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {PILLARS.map((p, i) => {
            const delayMs = reduced ? 0 : i * 100;
            return (
              <li
                key={p.num}
                data-testid="industrial-pillar"
                style={{
                  background: 'var(--od-card)',
                  border: '1px solid var(--od-border)',
                  borderRadius: '14px',
                  padding: '1.75rem 1.5rem',
                  opacity: reduced || animate ? 1 : 0,
                  transform:
                    reduced || animate ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                    color: 'var(--od-pink)',
                    letterSpacing: '0.05em',
                    margin: '0 0 0.625rem',
                  }}
                >
                  {p.num}
                </span>
                <h3
                  style={{
                    margin: '0 0 0.625rem',
                    fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                    fontWeight: 700,
                    fontSize: '1.0625rem',
                    color: 'var(--od-white)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--od-text)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.55,
                  }}
                >
                  {p.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
