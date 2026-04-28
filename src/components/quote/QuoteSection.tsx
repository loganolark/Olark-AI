'use client';

import React, { useEffect, useRef, useState } from 'react';
import CTAButton from '@/components/ui/CTAButton';
import QuoteBuilder from './QuoteBuilder';
import type { QuizTier } from '@/types/quote';

const DEFAULT_HEADLINES: Record<QuizTier, string> = {
  essentials: 'Not Sure What You’ll Need? Get a Custom Quote in 60 Seconds.',
  advanced:
    'Not Sure Which Plan Is Right? Build a Lead-Gen Quote in 60 Seconds.',
  commercial: 'Build a Commercial Quote in 60 Seconds.',
};

const DEFAULT_SUBHEADS: Record<QuizTier, string> = {
  essentials:
    'Answer a few quick questions and we’ll put together a personalized Aiden Essentials quote right here on the page. No email required.',
  advanced:
    'Answer a few quick questions about how you’ll use Aiden and we’ll recommend the right plan with a custom quote on the spot.',
  commercial:
    'Tell us about your CRM and routing needs and we’ll recommend the right plan with a custom quote on the spot.',
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
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {!expanded && (
          <div
            data-testid="quote-trigger"
            style={{
              padding: '3rem 2rem',
              background: 'rgba(37, 34, 117, 0.4)',
              border: '1px solid var(--od-border)',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 32px 80px rgba(0, 0, 0, 0.4)',
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
              Build Your Quote
            </p>
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
        )}
        {expanded && <QuoteBuilder tier={tier} />}
      </div>
    </section>
  );
}
