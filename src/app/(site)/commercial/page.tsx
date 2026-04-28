import { Suspense } from 'react';
import type { Metadata } from 'next';
import SectionHero from '@/components/ui/SectionHero';
import PillBadge from '@/components/ui/PillBadge';
import CTAButton from '@/components/ui/CTAButton';
import CommercialAidenQuote from '@/components/commercial/CommercialAidenQuote';
import CommercialBuiltFor from '@/components/commercial/CommercialBuiltFor';
import CommercialHowItWorks from '@/components/commercial/CommercialHowItWorks';
import CommercialProblemSection from '@/components/commercial/CommercialProblemSection';
import TierCard from '@/components/product/TierCard';
import CrawlWalkRunTimeline from '@/components/product/CrawlWalkRunTimeline';
import MidPageMeetingCTA from '@/components/product/MidPageMeetingCTA';
import VideoSection from '@/components/product/VideoSection';
import QuizResumeBanner from '@/components/quiz/QuizResumeBanner';
import QuoteSection from '@/components/quote/QuoteSection';

export const metadata: Metadata = {
  title: 'AI Sales Rep for High-Volume Teams | Aiden Commercial by Olark',
  description: 'Aiden Commercial handles full-pipeline automation — from inbound qualification to outbound support — for enterprise and commercial sales teams.',
  alternates: {
    canonical: '/commercial',
  },
  openGraph: {
    title: 'AI Sales Rep for High-Volume Teams | Aiden Commercial by Olark',
    description: 'Aiden Commercial handles full-pipeline automation — from inbound qualification to outbound support — for enterprise and commercial sales teams.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Aiden Commercial',
  description: 'Enterprise AI sales chat with full pipeline automation — inbound qualification, outbound support, and Crawl/Walk/Run onboarding.',
  brand: { '@type': 'Brand', name: 'Olark' },
  url: 'https://olark.ai/commercial',
};

const COMMERCIAL_CAPABILITIES = [
  'Full signal trail — every visitor interaction logged and queryable',
  'Rep intelligence brief on every contact — context, objections, stated needs',
  'Deep HubSpot CRM integration — deals, activities, segmented routing',
  'Objection-handling flows tuned to your product and sales motion',
  'Tier-segmented routing gives your reps better leads, not more leads',
];

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
        badge={<PillBadge variant="muted">Commercial Tier</PillBadge>}
        headline="Provable Pipeline. Full Signal Trail."
        subhead="Implementation in days, not quarters. Every visitor logged, every handoff briefed, every rep equipped."
        cta={
          <CTAButton variant="secondary" size="md" href="#quote-section">
            See Pricing →
          </CTAButton>
        }
      />

      <VideoSection
        variant="solo"
        label="See It In Action"
        title="Watch Aiden Handle the Entire Pre-Sales Workflow"
        intro="From entry-point recognition to CRM update, in a single automated conversation."
        mediaId="ttc5obl4nd"
        page="commercial"
      />

      <CommercialProblemSection />

      <CommercialAidenQuote />

      <CommercialHowItWorks />

      <CommercialBuiltFor />

      <section
        id="implementation-timeline"
        style={{
          backgroundColor: 'var(--od-card)',
          padding: '5rem 1.5rem',
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
          <CrawlWalkRunTimeline />
        </div>
      </section>

      <QuoteSection tier="commercial" />

      <section
        id="capabilities"
        style={{
          backgroundColor: 'var(--od-navy)',
          padding: '5rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <TierCard
            tier="commercial"
            headline="Commercial"
            tagline="For teams that need provable pipeline impact — full signal trail, rep intelligence on every contact, and an implementation timeline you can hand to engineering."
            capabilities={COMMERCIAL_CAPABILITIES}
            ctaHref="/get-started"
            ctaLabel="Scope Your Build →"
          />
        </div>
      </section>

      <MidPageMeetingCTA page="commercial" />
    </>
  );
}
