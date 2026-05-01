'use client';

import React, { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import ProductIcon, { type ProductIconName } from '@/components/ui/ProductIcon';

interface FeatureRow {
  icon: ProductIconName;
  title: string;
  body: string;
  /** One-line "why it matters to industrial buyers" tag — pulled from the brief. */
  why: string;
}

const FEATURES: FeatureRow[] = [
  {
    icon: 'inbox-x',
    title: 'Document Scanning',
    body: 'Aiden ingests PDFs, spec sheets, install manuals, and CAD-adjacent docs — then answers technical "how-to" or "can it hold?" questions inline, citing the source page.',
    why: 'Buyers stop bouncing on paywalled PDFs. Spec answers happen in the chat.',
  },
  {
    icon: 'trophy',
    title: 'Lead Scoring Dashboard',
    body: 'Every conversation is tagged "High Value" (new facility project) vs. "Low Value" (one-off small parts) based on the technical inputs the buyer gave the bot.',
    why: 'Your team stops triaging by gut. The pipeline reflects reality.',
  },
  {
    icon: 'map',
    title: 'Geo + Dealer-Network Routing',
    body: 'IP detection, zip prompts, and territory rules combine to send each lead to the right regional manager, premier installer, or direct rep — automatically.',
    why: 'No more "the rep is in Wisconsin, the buyer is in California" dead ends.',
  },
  {
    icon: 'gear',
    title: '17 Years of Live Chat Heritage',
    body: 'Aiden is built by Olark — the team that has run live chat for 17 years across every kind of B2B sales motion. We are not a fly-by-night AI startup learning chat as we go.',
    why: 'Stability and chat fluency that brand-new AI tools cannot fake.',
  },
];

/**
 * The "What's Inside" feature grid for the product page. Four cards modelled
 * on the Steel King-anchored brief (PDF p. 10) — Document Scanning, Lead
 * Scoring, Geo Routing, 17-Year Heritage. Each card carries a "why it
 * matters" line that mirrors how the industrial buyer thinks, not how the
 * marketer thinks.
 */
export default function IndustrialFeatureGrid() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { threshold: 0.2, once: true });
  const reduced = useReducedMotion();
  const animate = inView && !reduced;

  return (
    <section
      className="product-section"
      style={{ backgroundColor: 'var(--od-navy)' }}
    >
      <div ref={ref} style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
            What You Actually Get
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4.5vw, 2.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              margin: 0,
            }}
          >
            Four Capabilities Industrial Supply Actually Asks For
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {FEATURES.map((f, i) => {
            const delayMs = reduced ? 0 : i * 100;
            return (
              <article
                key={f.title}
                data-testid="industrial-feature-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--od-card)',
                  border: '1px solid var(--od-border)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  opacity: reduced || animate ? 1 : 0,
                  transform:
                    reduced || animate ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(250, 201, 23,0.12)',
                    color: 'var(--od-gold)',
                    marginBottom: '0.875rem',
                  }}
                >
                  <ProductIcon name={f.icon} size={22} />
                </span>
                <h3
                  style={{
                    margin: '0 0 0.5rem',
                    fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                    fontWeight: 700,
                    fontSize: '1.0625rem',
                    color: 'var(--od-white)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    margin: '0 0 1rem',
                    color: 'var(--od-text)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.55,
                  }}
                >
                  {f.body}
                </p>
                <p
                  style={{
                    margin: 'auto 0 0',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--od-border)',
                    color: 'var(--od-gold)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}
                >
                  {f.why}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
