import { Suspense } from 'react';
import type { Metadata } from 'next';
import SectionHero from '@/components/ui/SectionHero';
import PillBadge from '@/components/ui/PillBadge';
import CTAButton from '@/components/ui/CTAButton';
import EssentialsFeatureGroups from '@/components/product/EssentialsFeatureGroups';
import SupportPromise from '@/components/product/SupportPromise';
import VideoSection from '@/components/product/VideoSection';
import VideoEmbedThumbnail from '@/components/product/VideoEmbedThumbnail';
import FeatureSpotlight from '@/components/product/FeatureSpotlight';
import QuizResumeBanner from '@/components/quiz/QuizResumeBanner';
import QuoteSection from '@/components/quote/QuoteSection';

export const metadata: Metadata = {
  title: 'AI Sales Chat for SMB Teams | Aiden Essentials by Olark',
  description: 'Aiden Essentials qualifies inbound chat visitors automatically — so your small team only spends time with real buyers.',
  alternates: {
    canonical: '/essentials',
  },
  openGraph: {
    title: 'AI Sales Chat for SMB Teams | Aiden Essentials by Olark',
    description: 'Aiden Essentials qualifies inbound chat visitors automatically — so your small team only spends time with real buyers.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Aiden Essentials',
  description: 'AI-powered sales chat for SMB teams. Qualifies and routes inbound visitors automatically.',
  brand: { '@type': 'Brand', name: 'Olark' },
  url: 'https://olark.ai/essentials',
};

export default function EssentialsPage() {
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
        badge={<PillBadge variant="gold">Essentials Tier</PillBadge>}
        headline="Smart Chat, Ready in Minutes"
        subhead="Live in 48 hours. Every visitor qualified, routed, and ready for your rep."
      />

      <VideoSection
        label="Live Search"
        title="Your Bot Is Ready Before Your First Customer Arrives"
        intro="See how Aiden goes from a completely blank dashboard to a fully trained, live chatbot in under 60 seconds. No downloads, no waiting, no maintenance."
        mediaId="fgqmk8acw5"
        page="essentials"
        checklist={[
          {
            title: 'One-Step Setup',
            body: 'Paste your website URL and your bot is live and trained. No file downloads. No scraping tools. No setup calls with IT.',
          },
          {
            title: 'Always Current',
            body: 'Aiden continuously learns from your website as it changes. Updates happen automatically. You won’t even have to remember.',
          },
          {
            title: 'Test It Immediately',
            body: 'Most platforms make you wait an hour or more after setup. With Live Search, your bot is ready to test the moment you hit save.',
          },
        ]}
      />

      <FeatureSpotlight
        label="AI Analyst"
        labelVariant="pink"
        title="Your Chat History Has Been Sitting on a Goldmine"
        accent="navy"
        reverse
        paragraphs={[
          <>
            Every conversation already living in your Olark account is untapped intelligence.{' '}
            <strong>
              Aiden Analyst surfaces your highest-intent visitors, ranks them by purchase
              likelihood, and generates content ideas directly from what your customers are
              actually asking about.
            </strong>
          </>,
          'This is not a generic AI making educated guesses. It is trained on your transcripts, your website, and your business — delivering real-time intelligence that is entirely specific to you.',
        ]}
        pills={[
          { label: 'Lead Ranking' },
          { label: 'Conversation Intelligence', variant: 'pink' },
          { label: 'Content Generation', variant: 'muted' },
        ]}
        graphic={
          <VideoEmbedThumbnail
            mediaId="654bn7hwb5"
            title="Aiden Analyst demo"
            page="essentials"
          />
        }
      />

      <EssentialsFeatureGroups />

      <section
        style={{
          backgroundColor: 'var(--od-navy)',
          padding: '3rem 1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.875rem', color: 'var(--od-muted)' }}>
            Scaling past 3 reps?
          </span>
          <CTAButton variant="ghost" size="sm" href="/lead-gen">
            See Lead-Gen →
          </CTAButton>
        </div>
      </section>

      <SupportPromise />

      <QuoteSection tier="essentials" />
    </>
  );
}
