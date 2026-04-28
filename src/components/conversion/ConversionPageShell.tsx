import React from 'react';
import { cookies } from 'next/headers';
import CTAButton from '@/components/ui/CTAButton';
import PillBadge from '@/components/ui/PillBadge';
import Reveal from '@/components/ui/Reveal';
import HubSpotMeetingEmbed from '@/components/conversion/HubSpotMeetingEmbed';
import {
  parseSessionSignalsCookie,
  selectVariant,
} from '@/lib/conversion-variant';
import type { ConversionVariant } from '@/types/conversion';

type BadgeVariant = 'gold' | 'pink' | 'muted';

interface VariantCopy {
  badge: { label: string; variant: BadgeVariant } | null;
  headline: string;
  subhead: string;
  cta: string;
}

const VARIANT_COPY: Record<ConversionVariant, VariantCopy> = {
  'commercial-high-intent': {
    badge: { label: 'Commercial Tier', variant: 'muted' },
    headline: 'Let’s Build Your Aiden Deployment',
    subhead: 'You ran the demo. The quiz says Commercial. Logan is ready to scope your build.',
    cta: 'Scope My Build →',
  },
  'commercial-quiz-only': {
    badge: { label: 'Commercial Tier', variant: 'muted' },
    headline: 'Your Team Is Ready for Aiden',
    subhead: 'Quiz says Commercial. Let’s scope what you actually need.',
    cta: 'Scope My Build →',
  },
  'lead-gen': {
    badge: { label: 'Lead-Gen Tier', variant: 'pink' },
    headline: 'Your Extra SDR Is Ready to Deploy',
    subhead: 'Quiz says Lead-Gen. Logan can have you live in 14 days.',
    cta: 'Book Your Onboarding Call →',
  },
  essentials: {
    badge: { label: 'Essentials Tier', variant: 'gold' },
    headline: 'Start in Minutes, See Results Today',
    subhead: 'Quiz says Essentials. Self-serve onboarding — chat live in 48 hours.',
    cta: 'Book Your Onboarding Call →',
  },
  anonymous: {
    badge: null,
    headline: 'See What Aiden Does for Your Team',
    subhead:
      'Aiden qualifies, routes, and briefs every visitor. Talk to us when you’re ready to see it on your site.',
    cta: 'Talk to Logan →',
  },
};

const TRUST_ITEMS: string[] = [
  '30-minute scoping call',
  'No prep required',
  'Direct line to Logan',
];

interface NextStep {
  step: string;
  label: string;
  body: string;
}

const WHAT_HAPPENS_NEXT: NextStep[] = [
  {
    step: '01',
    label: 'Pick a time that works',
    body: 'Grab a slot on the calendar below — most weeks have same-week openings.',
  },
  {
    step: '02',
    label: 'We confirm by email',
    body: 'You’ll get a calendar invite + short pre-call note about your stack.',
  },
  {
    step: '03',
    label: '30 minutes → custom plan',
    body: 'Walk away with a written plan tailored to your team, traffic, and goals.',
  },
];

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={{
        stroke: 'var(--od-gold)',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        flexShrink: 0,
      }}
    >
      <circle cx="7" cy="7" r="5.75" />
      <polyline points="4.5,7 6.25,8.75 9.5,5.25" />
    </svg>
  );
}

export default async function ConversionPageShell() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('olark_session_signals')?.value;
  const parsed = parseSessionSignalsCookie(raw);
  const variant = selectVariant(parsed);
  const copy = VARIANT_COPY[variant];

  return (
    <div data-variant={variant}>
      <section
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(61,54,131,0.4) 0%, transparent 70%)',
            'var(--od-dark)',
          ].join(', '),
          paddingTop: '8rem',
          paddingBottom: '4rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          textAlign: 'center',
        }}
      >
        <Reveal
          threshold={0.05}
          offset={16}
          duration={600}
          style={{ maxWidth: '760px', margin: '0 auto' }}
        >
          {copy.badge && (
            <div
              data-testid="conversion-tier-badge"
              style={{ marginBottom: '1.25rem' }}
            >
              <PillBadge variant={copy.badge.variant}>{copy.badge.label}</PillBadge>
            </div>
          )}
          <h1
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: 'var(--od-white)',
              margin: '0 0 1.25rem',
            }}
          >
            {copy.headline}
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
              lineHeight: 1.6,
              color: 'var(--od-text)',
              margin: '0 auto 2rem',
              maxWidth: '600px',
              fontWeight: 300,
            }}
          >
            {copy.subhead}
          </p>

          <ul
            data-testid="conversion-trust-strip"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 2rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.625rem 1.5rem',
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

          <CTAButton variant="primary" size="lg" href="#booking">
            {copy.cta}
          </CTAButton>
        </Reveal>
      </section>

      <section
        style={{
          backgroundColor: 'var(--od-navy)',
          padding: '4rem 1.5rem 5rem',
          borderTop: '1px solid var(--od-border)',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--od-gold)',
              textAlign: 'center',
              margin: '0 0 1rem',
            }}
          >
            What Happens Next
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              textAlign: 'center',
              margin: '0 0 2.5rem',
            }}
          >
            From Booked to a Custom Plan in 30 Minutes
          </h2>

          <ol
            data-testid="conversion-next-steps"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 3rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {WHAT_HAPPENS_NEXT.map((s, i) => (
              <Reveal
                key={s.step}
                as="li"
                threshold={0.2}
                delay={i * 100}
                offset={12}
                style={{
                  background: 'var(--od-card)',
                  border: '1px solid var(--od-border)',
                  borderRadius: '14px',
                  padding: '1.5rem 1.25rem',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    color: 'var(--od-gold)',
                    letterSpacing: '0.05em',
                    marginBottom: '0.625rem',
                  }}
                >
                  {s.step}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    letterSpacing: '-0.01em',
                    color: 'var(--od-white)',
                    margin: '0 0 0.375rem',
                  }}
                >
                  {s.label}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--od-muted)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.55,
                  }}
                >
                  {s.body}
                </p>
              </Reveal>
            ))}
          </ol>

          <Reveal
            id="booking"
            data-testid="conversion-booking-card"
            threshold={0.1}
            offset={20}
            duration={650}
            style={{
              background: 'var(--od-card)',
              border: '1px solid var(--od-border)',
              borderRadius: '16px',
              padding: '1.25rem',
            }}
          >
            <HubSpotMeetingEmbed variant={variant} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
