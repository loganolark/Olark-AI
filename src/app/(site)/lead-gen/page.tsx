import { Suspense } from 'react';
import type { Metadata } from 'next';
import SectionHero from '@/components/ui/SectionHero';
import PillBadge from '@/components/ui/PillBadge';
import TierCard from '@/components/product/TierCard';
import QuizResumeBanner from '@/components/quiz/QuizResumeBanner';
import QuoteSection from '@/components/quote/QuoteSection';

export const metadata: Metadata = {
  title: 'Qualify Leads Before They Talk to You | Aiden Lead-Gen by Olark',
  description: 'Aiden Lead-Gen captures intent, scores visitors, and routes qualified leads directly to your pipeline — before a rep gets involved.',
  alternates: {
    canonical: '/lead-gen',
  },
  openGraph: {
    title: 'Qualify Leads Before They Talk to You | Aiden Lead-Gen by Olark',
    description: 'Aiden Lead-Gen captures intent, scores visitors, and routes qualified leads directly to your pipeline — before a rep gets involved.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Aiden Lead-Gen',
  description: 'AI-powered lead qualification and pipeline routing for outbound-heavy sales teams.',
  brand: { '@type': 'Brand', name: 'Olark' },
  url: 'https://olark.ai/lead-gen',
};

const LEAD_GEN_CAPABILITIES = [
  'Visitors qualified by company size, role, and intent before your rep sees them',
  'Handoff briefs include the visitor’s questions, objections, and stated needs',
  'Tier signals route to the right rep — no triage queue',
  'Context-loaded chat history attached to every contact in your CRM',
  'Pipeline-ready leads, not raw form fills',
];

export default function LeadGenPage() {
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
        badge={<PillBadge variant="pink">Lead-Gen Tier</PillBadge>}
        headline="Your Team Just Got an Extra SDR"
        subhead="Every visitor pre-qualified. Every handoff context-loaded. Your reps walk into conversations already briefed."
      />

      <section
        id="capabilities"
        style={{
          backgroundColor: 'var(--od-navy)',
          padding: '5rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <TierCard
            tier="lead-gen"
            featured
            headline="Lead-Gen"
            tagline="For growth-stage teams whose pipeline is bigger than their bandwidth — give every rep a teammate that does the qualifying upstream."
            capabilities={LEAD_GEN_CAPABILITIES}
            ctaHref="/get-started"
            ctaLabel="Give Your Reps a Teammate →"
          />
        </div>
      </section>

      <QuoteSection tier="advanced" />

      <section
        id="rep-section"
        style={{
          backgroundColor: 'var(--od-dark)',
          padding: '5rem 1.5rem',
          textAlign: 'center',
          borderTop: '1px solid var(--od-border)',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--od-pink)',
              marginBottom: '1rem',
            }}
          >
            For the reps doing the work
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-poppins, Poppins, sans-serif)',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--od-white)',
              margin: '0 0 1.5rem',
            }}
          >
            All You Have to Do Is Eat.
          </h2>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--od-text)',
              margin: '0 0 1rem',
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Monday morning, you open your queue and every chat handoff is already pre-qualified — company size, role,
            inbound intent, the questions they asked, the objections they raised. No more cold-opening conversations.
            No more spending 20 minutes figuring out who you’re talking to.
          </p>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--od-text)',
              margin: '0 0 1rem',
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            You walk in briefed. The visitor walks in expecting someone who already knows their context. That’s the
            difference between a chat queue that drains your day and one that compounds your wins.
          </p>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--od-muted)',
              margin: 0,
              maxWidth: '560px',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontStyle: 'italic',
            }}
          >
            Aiden does the qualifying. You do what you’re great at — closing the conversation a real human is owed.
          </p>
        </div>
      </section>
    </>
  );
}
