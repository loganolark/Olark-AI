import { Suspense } from 'react';
import type { Metadata } from 'next';
import SectionHero from '@/components/ui/SectionHero';
import PillBadge from '@/components/ui/PillBadge';
import CTAButton from '@/components/ui/CTAButton';
import CommercialAidenQuote from '@/components/commercial/CommercialAidenQuote';
import CommercialBuiltFor from '@/components/commercial/CommercialBuiltFor';
import CommercialHowItWorks from '@/components/commercial/CommercialHowItWorks';
import CommercialProblemSection from '@/components/commercial/CommercialProblemSection';
import IndustrialFeatureGrid from '@/components/commercial/IndustrialFeatureGrid';
import PlatformProofSection from '@/components/commercial/PlatformProofSection';
import PlaysWithYourStackStrip from '@/components/commercial/PlaysWithYourStackStrip';
import CrawlWalkRunTimeline from '@/components/product/CrawlWalkRunTimeline';
import VideoSection from '@/components/product/VideoSection';
import QuizResumeBanner from '@/components/quiz/QuizResumeBanner';
import QuoteSection from '@/components/quote/QuoteSection';
import Reveal from '@/components/ui/Reveal';

export const metadata: Metadata = {
  title: 'Aiden by Olark — AI Live Chat Built for Industrial Supply',
  description:
    "Aiden is the live-chat platform engineered for industrial suppliers. We answer the technical spec questions instantly, route by territory and dealer network, and hand the real RFQs to your team — fully briefed.",
  alternates: {
    canonical: '/commercial',
  },
  openGraph: {
    title: 'Aiden by Olark — AI Live Chat Built for Industrial Supply',
    description:
      "Aiden is the live-chat platform engineered for industrial suppliers. We answer the technical spec questions instantly, route by territory and dealer network, and hand the real RFQs to your team — fully briefed.",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Aiden by Olark',
  description:
    'AI live-chat platform engineered for industrial supply: technical-spec qualification, dealer-network routing, CRM-integrated handoffs, and a 17-year live-chat heritage.',
  brand: { '@type': 'Brand', name: 'Olark' },
  url: 'https://olark.ai/commercial',
};

export default function CommercialPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Suspense fallback={null}>
        <QuizResumeBanner />
      </Suspense>

      <SectionHero
        badge={
          <PillBadge variant="gold" pulse>
            17 years of live chat · Built for industrial supply
          </PillBadge>
        }
        headline="Industrial Intelligence. Human Connection."
        subhead="Aiden is the AI live-chat platform engineered for industrial suppliers. We answer the spec questions instantly, route by territory and dealer network, and hand every real RFQ to your team with the brief already written."
        cta={
          <>
            <CTAButton variant="primary" size="lg" href="#quote-section">
              See Pricing →
            </CTAButton>
            <CTAButton variant="secondary" size="lg" href="/get-started">
              Book a Technical Deep Dive
            </CTAButton>
          </>
        }
      />

      <VideoSection
        variant="solo"
        label="See It In Action"
        title="Watch Aiden Run a Real Industrial-Supply Conversation"
        intro="Spec question to qualified RFQ to logged pipeline — in a single chat, with the dealer routed and the CRM updated automatically."
        mediaId="ttc5obl4nd"
        page="commercial"
      />

      <CommercialProblemSection />

      <CommercialAidenQuote />

      <CommercialHowItWorks />

      <IndustrialFeatureGrid />

      <PlatformProofSection />

      <CommercialBuiltFor />

      <PlaysWithYourStackStrip />

      <section
        id="implementation-timeline"
        style={{
          backgroundColor: 'var(--od-card)',
          padding: '5rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <Reveal>
            <p
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: 'var(--od-gold)',
                textAlign: 'center',
                marginBottom: '1rem',
              }}
            >
              Implementation timeline
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
                fontWeight: 900,
                fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: 'var(--od-white)',
                textAlign: 'center',
                margin: '0 0 2.5rem',
              }}
            >
              Crawl. Walk. Run.
            </h2>
          </Reveal>
          <CrawlWalkRunTimeline />
        </div>
      </section>

      <QuoteSection tier="commercial" />
    </>
  );
}
