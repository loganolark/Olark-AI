import React from 'react';
import { cookies } from 'next/headers';
import CTAButton from '@/components/ui/CTAButton';
import HubSpotMeetingEmbed from '@/components/conversion/HubSpotMeetingEmbed';
import {
  parseQuizStateCookie,
  selectVariant,
} from '@/lib/conversion-variant';
import type { ConversionVariant } from '@/types/conversion';

interface VariantCopy {
  headline: string;
  subhead: string;
}

const VARIANT_COPY: Record<ConversionVariant, VariantCopy> = {
  'commercial-high-intent': {
    headline: 'Let’s build your Aiden deployment',
    subhead: 'You ran the demo. The quiz says Commercial. Logan is ready to scope your build.',
  },
  'commercial-quiz-only': {
    headline: 'Your team is ready for Aiden',
    subhead: 'Quiz says Commercial. Let’s scope what you actually need.',
  },
  'lead-gen': {
    headline: 'Your extra SDR is ready to deploy',
    subhead: 'Quiz says Lead-Gen. Logan can have you live in 14 days.',
  },
  essentials: {
    headline: 'Start in minutes, see results today',
    subhead: 'Quiz says Essentials. Self-serve onboarding — chat live in 48 hours.',
  },
  anonymous: {
    headline: 'See What Aiden Does for Your Team',
    subhead:
      'Aiden qualifies, routes, and briefs every visitor. Talk to us when you’re ready to see it on your site.',
  },
};

export default async function ConversionPageShell() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('olark_quiz_state')?.value;
  const parsed = parseQuizStateCookie(raw);
  const variant = selectVariant(parsed);
  const copy = VARIANT_COPY[variant];

  return (
    <section
      data-variant={variant}
      style={{
        background: [
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(61,54,131,0.4) 0%, transparent 70%)',
          'var(--od-dark)',
        ].join(', '),
        paddingTop: '128px',
        paddingBottom: '80px',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            margin: '0 auto 2.5rem',
            maxWidth: '600px',
            fontWeight: 300,
          }}
        >
          {copy.subhead}
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.875rem',
          }}
        >
          {/* Primary CTA points at the on-page booking embed until the dedicated
              account-creation flow ships. AC kept the "Start Your Account" copy. */}
          <CTAButton variant="primary" size="lg" href="#booking">
            Start Your Account →
          </CTAButton>
          <CTAButton variant="secondary" size="lg" href="#booking">
            Scope My Build →
          </CTAButton>
        </div>

        <div id="booking" style={{ marginTop: '4rem' }}>
          <HubSpotMeetingEmbed variant={variant} />
        </div>
      </div>
    </section>
  );
}
