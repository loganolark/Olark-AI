'use client';

import React from 'react';
import CTAButton from '@/components/ui/CTAButton';
import PillBadge from '@/components/ui/PillBadge';
import Reveal from '@/components/ui/Reveal';
import { trackEvent } from '@/lib/analytics';

export type MidPageMeetingCTAPage = 'essentials' | 'lead-gen' | 'commercial';
export type MidPageMeetingCTAVariant = 'primary' | 'secondary';

export interface MidPageMeetingCTAProps {
  page: MidPageMeetingCTAPage;
  /** Visual treatment for the CTA. Defaults to 'primary' (gold).
   * Use 'secondary' on pages where another gold CTA above (e.g. TierCard
   * primary) would otherwise create a competing-conversion situation
   * — see DESIGN.md's Punctuation Rule. */
  ctaVariant?: MidPageMeetingCTAVariant;
}

interface CopyEntry {
  title: string;
  intro: string;
}

const COPY: Record<MidPageMeetingCTAPage, CopyEntry> = {
  essentials: {
    title: 'The Smartest First Step in AI Starts Here',
    intro:
      'Even the smallest investment in AI can deliver outsized value. Aiden Essentials is designed to prove that from day one.',
  },
  'lead-gen': {
    title: 'Put Aiden to Work as Your New Sales & Support Rep',
    intro:
      'We’ll answer your questions about AI setup, go-live timelines, and how to get the most revenue and support value out of Aiden.',
  },
  commercial: {
    title: 'Ready to Put Aiden to Work as Your Commercial Sales Engine?',
    intro:
      'We’ll walk you through AI setup, live routing logic, and exactly how to get maximum revenue out of Aiden Commercial.',
  },
};

const TRUST_ITEMS: string[] = [
  'Free live onboarding included with every plan',
  'No commitment required',
  'No technical setup required',
];

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      style={{ stroke: 'var(--od-gold)', strokeWidth: 2, flexShrink: 0 }}
    >
      <circle cx="7.5" cy="7.5" r="6" />
      <polyline points="5,7.5 7,9.5 11,5.5" />
    </svg>
  );
}

export default function MidPageMeetingCTA({
  page,
  ctaVariant = 'primary',
}: MidPageMeetingCTAProps) {
  const { title, intro } = COPY[page];

  const handleClick = () => {
    trackEvent('product_page_meeting_cta_click', { page });
  };

  return (
    <section
      className="product-section"
      style={{
        backgroundColor: 'var(--od-dark)',
        borderTop: '1px solid var(--od-border)',
      }}
    >
      <Reveal
        threshold={0.2}
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <PillBadge variant="gold" pulse>
          Start Today
        </PillBadge>
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
          {title}
        </h2>
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--od-text)',
            margin: 0,
          }}
        >
          {intro}
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0.5rem 0 0',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.75rem 1.5rem',
          }}
        >
          {TRUST_ITEMS.map((item) => (
            <li
              key={item}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--od-text)',
                fontSize: '0.9375rem',
              }}
            >
              <CheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: '0.75rem' }}>
          <CTAButton
            variant={ctaVariant}
            size="lg"
            href="/get-started"
            onClick={handleClick}
          >
            Schedule to Learn More About Aiden
          </CTAButton>
        </div>
      </Reveal>
    </section>
  );
}
