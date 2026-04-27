import type { Metadata } from 'next';
import CTAButton from '@/components/ui/CTAButton';
import PillBadge from '@/components/ui/PillBadge';
import SectionHero from '@/components/ui/SectionHero';
import LogoStrip from '@/components/product/LogoStrip';
import URLDemoWidgetLoader from '@/components/url-demo/URLDemoWidgetLoader';
import PathFinderQuiz from '@/components/quiz/PathFinderQuiz';
import TierCard from '@/components/product/TierCard';
import type { TierVariant } from '@/types/tier';

export const metadata: Metadata = {
  title: 'Your Leads Arrive Ready | Aiden by Olark',
  description:
    'Aiden is your AI sales chat — it qualifies every visitor before they reach your team. The AI sales rep that turns browsers into briefed buyers.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Your Leads Arrive Ready | Aiden by Olark',
    description:
      'Aiden is your AI sales chat — it qualifies every visitor before they reach your team. The AI sales rep that turns browsers into briefed buyers.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Olark',
  url: 'https://olark.ai',
  logo: 'https://olark.ai/logo.png',
  description: 'Aiden by Olark — AI-powered sales chat that qualifies leads before they reach your team.',
  sameAs: [
    'https://twitter.com/olark',
    'https://www.linkedin.com/company/olark',
  ],
};

interface HomepageTier {
  tier: TierVariant;
  name: string;
  positioning: string;
  href: string;
}

const TIERS: HomepageTier[] = [
  {
    tier: 'essentials',
    name: 'Essentials',
    positioning: 'Live in 48 hours. Every visitor qualified, routed, and ready for your rep.',
    href: '/essentials',
  },
  {
    tier: 'lead-gen',
    name: 'Lead-Gen',
    positioning: 'Your leads arrive with a context brief. Your reps just got a teammate.',
    href: '/lead-gen',
  },
  {
    tier: 'commercial',
    name: 'Commercial',
    positioning: 'Full pipeline signal. Provable ROI, direct team access, no ticket queue.',
    href: '/commercial',
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* ─── Hero ─── */}
      <SectionHero
        badge={
          <PillBadge variant="gold" pulse>
            16 years of live chat · Now AI-first
          </PillBadge>
        }
        headline="Your Leads Arrive Ready"
        subhead="Aiden turns browsers into briefed buyers — before your rep says hello. No replacement. Pure augmentation."
        cta={
          <>
            <CTAButton variant="primary" size="lg" href="#demo">
              See Aiden on Your Site
            </CTAButton>
            <CTAButton variant="secondary" size="lg" href="#quiz">
              Find Your Tier →
            </CTAButton>
          </>
        }
      />

      {/* ─── Social Proof ─── */}
      <section
        style={{
          backgroundColor: 'var(--od-navy)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '0.8125rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--od-muted)',
            marginBottom: '2rem',
            fontWeight: 500,
          }}
        >
          Trusted by teams already winning with live chat
        </p>
        <LogoStrip />
      </section>

      {/* ─── URL Demo Widget ─── */}
      <section
        id="demo"
        style={{
          backgroundColor: 'var(--od-dark)',
          padding: '5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <URLDemoWidgetLoader />
      </section>

      {/* ─── How It Works ─── */}
      <section
        style={{
          backgroundColor: 'var(--od-navy)',
          padding: '5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: 'var(--od-gold)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          Three ways to deploy
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-poppins), ui-sans-serif, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            letterSpacing: '-0.025em',
            color: 'var(--od-white)',
            margin: '0 0 0.5rem',
          }}
        >
          How Aiden Works for Your Team
        </h2>
        <p
          style={{
            color: 'var(--od-muted)',
            fontSize: '0.9375rem',
            marginBottom: '0',
          }}
        >
          Pick the tier that matches where your team is today.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1100px',
            margin: '2.5rem auto 0',
            textAlign: 'left',
          }}
        >
          {TIERS.map((t) => (
            <TierCard
              key={t.tier}
              tier={t.tier}
              headline={t.name}
              tagline={t.positioning}
              capabilities={[]}
              ctaHref={t.href}
              ctaLabel="Learn more →"
            />
          ))}
        </div>
      </section>

      {/* ─── Rep Section ─── */}
      <section
        style={{
          backgroundColor: 'var(--od-card)',
          padding: '5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p
            style={{
              color: 'var(--od-gold)',
              fontSize: '0.8125rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            For the rep in the room
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins), ui-sans-serif, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              letterSpacing: '-0.025em',
              color: 'var(--od-white)',
              margin: '0 0 2rem',
            }}
          >
            All You Have to Do Is Eat.
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              justifyContent: 'center',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                flex: '1 1 260px',
                background: 'rgba(15,13,46,0.6)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  color: 'var(--od-muted)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  margin: '0 0 0.75rem',
                }}
              >
                Before Aiden
              </p>
              <p style={{ color: 'var(--od-text)', lineHeight: 1.7, margin: 0 }}>
                45-minute discovery calls. 12 tabs open. Context scattered across emails, Slack, and sticky notes. The first 20 minutes are just catching up.
              </p>
            </div>
            <div
              style={{
                flex: '1 1 260px',
                background: 'rgba(245,194,0,0.08)',
                border: '1px solid rgba(245,194,0,0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  color: 'var(--od-gold)',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  margin: '0 0 0.75rem',
                }}
              >
                With Aiden
              </p>
              <p style={{ color: 'var(--od-text)', lineHeight: 1.7, margin: 0 }}>
                Your leads arrive with a context brief — company size, use case, objections already handled. You walk in knowing what they need. The conversation starts at the close.
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--od-muted)', fontSize: '0.9375rem', margin: 0 }}>
            Aiden doesn&apos;t replace you. It handles the work that kept you from the work.
          </p>
        </div>
      </section>

      {/* ─── Path Finder Quiz ─── */}
      <section
        id="quiz"
        style={{
          backgroundColor: 'var(--od-navy)',
          padding: '5rem 1.5rem',
        }}
      >
        <PathFinderQuiz />
      </section>

      {/* ─── CTA Bridge ─── */}
      <section
        style={{
          backgroundColor: 'var(--od-dark)',
          padding: '5rem 1.5rem',
          textAlign: 'center',
          borderTop: '1px solid var(--od-border)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-poppins), ui-sans-serif, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            letterSpacing: '-0.025em',
            color: 'var(--od-white)',
            margin: '0 0 1rem',
          }}
        >
          Find Your Tier
        </h2>
        <p
          style={{
            color: 'var(--od-muted)',
            marginBottom: '2.5rem',
            fontSize: '0.9375rem',
          }}
        >
          Three ways to deploy Aiden. One fits your team right now.
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
          }}
        >
          <CTAButton variant="secondary" size="md" href="/essentials">
            Start Today, See Results This Week →
          </CTAButton>
          <CTAButton variant="secondary" size="md" href="/lead-gen">
            Give Your Reps a Teammate →
          </CTAButton>
          <CTAButton variant="secondary" size="md" href="/commercial">
            Build Your Full Pipeline Signal →
          </CTAButton>
        </div>
      </section>
    </>
  );
}
