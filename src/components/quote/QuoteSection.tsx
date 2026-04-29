'use client';

import React, { useEffect, useRef, useState } from 'react';
import CTAButton from '@/components/ui/CTAButton';
import PillBadge from '@/components/ui/PillBadge';
import Reveal from '@/components/ui/Reveal';
import QuoteBuilder from './QuoteBuilder';
import type { QuizTier } from '@/types/quote';

// Merged copy: each tier's bottom-of-page CTA fuses the previous standalone
// MidPageMeetingCTA's positioning with the QuoteSection's action. One section
// instead of two — same urgency, less vertical real estate.
const DEFAULT_HEADLINES: Record<QuizTier, string> = {
  essentials: 'The Smartest First Step in AI Starts Here',
  advanced: 'Put Aiden to Work as Your New Sales & Support Rep',
  commercial: 'Ready to Put Aiden to Work as Your Commercial Sales Engine?',
};

const DEFAULT_SUBHEADS: Record<QuizTier, string> = {
  essentials:
    'Even the smallest investment in AI can deliver outsized value — Aiden Essentials is designed to prove that from day one. Build your custom quote in 60 seconds, no email required.',
  advanced:
    'We’ll match you to the right plan based on your team setup, go-live timeline, and revenue goals — built into a custom quote in 60 seconds.',
  commercial:
    'Tell us about your CRM and routing needs and we’ll recommend the right plan with a custom quote on the spot — no email required.',
};

export interface QuoteSectionProps {
  tier: QuizTier;
  headline?: string;
  subhead?: string;
}

export default function QuoteSection({
  tier,
  headline,
  subhead,
}: QuoteSectionProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!expanded) return;
    // JSDOM doesn't implement scrollIntoView — guard so unit tests don't throw.
    if (typeof sectionRef.current?.scrollIntoView === 'function') {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [expanded]);

  const titleText = headline ?? DEFAULT_HEADLINES[tier];
  const subText = subhead ?? DEFAULT_SUBHEADS[tier];

  return (
    <section
      id="quote-section"
      ref={sectionRef}
      style={{
        backgroundColor: 'var(--od-dark)',
        padding: '5rem 1.5rem',
        scrollMarginTop: '80px',
      }}
    >
      <Reveal style={{ maxWidth: '720px', margin: '0 auto' }} threshold={0.15}>
        {!expanded && (
          <>
            <p
              data-testid="quote-section-eyebrow"
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: 'var(--od-gold)',
                textAlign: 'center',
                margin: '0 0 1.25rem',
              }}
            >
              Quote Builder
            </p>
            <div
              data-testid="quote-trigger"
              style={{
                padding: '3rem 2rem',
                background: 'rgba(74, 67, 153, 0.4)',
                border: '1px solid var(--od-border)',
                borderRadius: '20px',
                textAlign: 'center',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.4)',
              }}
            >
            <div style={{ marginBottom: '1.25rem' }}>
              <PillBadge variant="gold" pulse>
                Start Today
              </PillBadge>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                fontWeight: 900,
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: 'var(--od-white)',
                margin: '0 0 1rem',
              }}
            >
              {titleText}
            </h2>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--od-muted)',
                margin: '0 auto 2rem',
                maxWidth: '560px',
              }}
            >
              {subText}
            </p>
            <CTAButton
              variant="primary"
              size="lg"
              onClick={() => setExpanded(true)}
            >
              Get My Custom Quote
            </CTAButton>
            </div>
          </>
        )}
        {expanded && <QuoteBuilder tier={tier} />}
      </Reveal>
    </section>
  );
}
