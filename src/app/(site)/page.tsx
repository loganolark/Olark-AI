import type { Metadata } from 'next';
import CTAButton from '@/components/ui/CTAButton';
import PillBadge from '@/components/ui/PillBadge';
import SectionHero from '@/components/ui/SectionHero';
import Reveal from '@/components/ui/Reveal';
import LogoStrip from '@/components/product/LogoStrip';
import URLDemoWidgetLoader from '@/components/url-demo/URLDemoWidgetLoader';
import HeroQuizCTA from '@/components/quiz/HeroQuizCTA';
import HomepageQuizBlock from '@/components/quiz/HomepageQuizBlock';
import TierCard from '@/components/product/TierCard';
import PersonaTabSwitcher from '@/components/product/PersonaTabSwitcher';
import ParticleBackground from '@/components/ui/ParticleBackground';
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
  capabilities: string[];
  href: string;
}

// Phase 3 will replace this whole section with the four "Engineered for
// industrial supply" pillars. For the strip we leave a single product
// card pointing at /commercial so the section still renders cleanly.
const TIERS: HomepageTier[] = [
  {
    tier: 'commercial',
    name: 'See the product',
    positioning:
      'Industrial-grade chat that qualifies the technical questions, routes by territory, and hands every real opportunity to your team with the spec sheet attached.',
    capabilities: [
      'Speaks PSI, NEMA, SKU — trained on your catalog',
      'Routes by territory and dealer network, automatically',
      'Hands the human the call with the brief already written',
    ],
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
        backgroundEffect={<ParticleBackground density={70} />}
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
            <HeroQuizCTA />
          </>
        }
      />

      {/* ─── Social Proof ─── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--od-navy)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <ParticleBackground density={30} />
        <Reveal style={{ position: 'relative', zIndex: 1 }}>
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
        </Reveal>
      </section>

      {/* ─── URL Demo Widget ─── */}
      <section
        id="demo"
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--od-dark)',
          padding: '5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <ParticleBackground density={50} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <URLDemoWidgetLoader />
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--od-navy)',
          padding: '5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <ParticleBackground density={70} />
        <Reveal style={{ position: 'relative', zIndex: 1 }}>
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
        </Reveal>
        <div
          style={{
            position: 'relative',
            zIndex: 1,
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
              capabilities={t.capabilities}
              ctaHref={t.href}
              ctaLabel="Learn more →"
              ctaVariant="secondary"
              ctaSize="md"
            />
          ))}
        </div>
      </section>

      {/* ─── Persona Tab Switcher (replaces Before/With duo) ─── */}
      <section
        style={{
          backgroundColor: 'var(--od-card)',
          padding: '5rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <PersonaTabSwitcher />
        </div>
      </section>

      {/* ─── Final CTA + Path Finder Quiz (swapped order, shared dark bg) ─── */}
      <HomepageQuizBlock />
    </>
  );
}
