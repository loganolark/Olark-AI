import type { Metadata } from 'next';
import CTAButton from '@/components/ui/CTAButton';
import PillBadge from '@/components/ui/PillBadge';
import SectionHero from '@/components/ui/SectionHero';
import Reveal from '@/components/ui/Reveal';
import LogoStrip from '@/components/product/LogoStrip';
import URLDemoWidgetLoader from '@/components/url-demo/URLDemoWidgetLoader';
import HeroQuizCTA from '@/components/quiz/HeroQuizCTA';
import HomepageQuizBlock from '@/components/quiz/HomepageQuizBlock';
import PersonaTabSwitcher from '@/components/product/PersonaTabSwitcher';
import ParticleBackground from '@/components/ui/ParticleBackground';
import HeroStatsRow from '@/components/home/HeroStatsRow';
import IndustrialPillars from '@/components/home/IndustrialPillars';
import WhyItMattersStatsPanel from '@/components/home/WhyItMattersStatsPanel';
import EnhanceTheHumanMomentBlock from '@/components/home/EnhanceTheHumanMomentBlock';
import BoltzChatDemo from '@/components/home/BoltzChatDemo';

export const metadata: Metadata = {
  title: 'Aiden by Olark — AI Live Chat for Industrial Suppliers',
  description:
    'Aiden combines 17 years of live chat with AI engineered for industrial supply. We answer the spec questions instantly, route by territory and dealer network, and turn your dead Contact Us form into the highest-converting surface on your site.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Aiden by Olark — AI Live Chat for Industrial Suppliers',
    description:
      'Aiden combines 17 years of live chat with AI engineered for industrial supply. We answer the spec questions instantly, route by territory and dealer network, and turn your dead Contact Us form into the highest-converting surface on your site.',
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
  description:
    'Aiden by Olark — AI live chat engineered for industrial suppliers. 17 years of live chat heritage; technical-spec qualification, dealer-network routing, CRM-integrated handoffs.',
  sameAs: [
    'https://twitter.com/olark',
    'https://www.linkedin.com/company/olark',
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <SectionHero
        backgroundEffect={<ParticleBackground density={70} />}
        badge={
          <PillBadge variant="gold" pulse>
            17 years of live chat · Built for industrial supply
          </PillBadge>
        }
        headline="AI for Industrial Suppliers."
        subhead="We combine 17 years of live chat expertise with AI engineered for the way industrial supply actually sells — turning complex technical inquiries into briefed, qualified RFQs your team can close."
        cta={
          <>
            <CTAButton variant="primary" size="lg" href="#boltz-demo">
              See How Aiden Works →
            </CTAButton>
            <HeroQuizCTA />
          </>
        }
      >
        <HeroStatsRow />
      </SectionHero>

      {/* ─── "Kill the Contact Us form" callout ─────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--od-card)',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <Reveal style={{ maxWidth: '720px', margin: '0 auto' }}>
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
            The Problem
          </p>
          <p
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 700,
              fontSize: 'clamp(1.25rem, 3.2vw, 1.625rem)',
              lineHeight: 1.4,
              letterSpacing: '-0.02em',
              color: 'var(--od-white)',
              margin: 0,
            }}
          >
            Most B2B sites are{' '}
            <em
              style={{
                fontStyle: 'italic',
                color: 'var(--od-pink)',
                fontWeight: 700,
              }}
            >
              expensive digital filing cabinets
            </em>
            . You spend a fortune to get buyers there, then greet them with a
            Contact Us form that goes into a black hole. Aiden is the alive
            replacement &mdash; the one that actually engages, qualifies, and
            converts.
          </p>
        </Reveal>
      </section>

      {/* ─── Boltz interactive chat demo — "see what good looks like" ───── */}
      <BoltzChatDemo />

      {/* ─── URL Demo Widget — try it on your site ──────────────────────── */}
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

      {/* ─── 4 Industrial Pillars ───────────────────────────────────────── */}
      <IndustrialPillars />

      {/* ─── Why It Matters stats panel ─────────────────────────────────── */}
      <WhyItMattersStatsPanel />

      {/* ─── Personas (rewritten for industrial roles) ──────────────────── */}
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

      {/* ─── "Enhance the Human Moment" centerpiece ─────────────────────── */}
      <EnhanceTheHumanMomentBlock />

      {/* ─── Logo Strip ─────────────────────────────────────────────────── */}
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
            Trusted by industrial suppliers already winning with live chat
          </p>
          <LogoStrip />
        </Reveal>
      </section>

      {/* ─── Final CTA + Path Finder Quiz ───────────────────────────────── */}
      <HomepageQuizBlock />
    </>
  );
}
