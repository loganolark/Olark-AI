import { Suspense } from 'react';
import type { Metadata } from 'next';
import SectionHero from '@/components/ui/SectionHero';
import PillBadge from '@/components/ui/PillBadge';
import TierCard from '@/components/product/TierCard';
import FeatureSpotlight from '@/components/product/FeatureSpotlight';
import MidPageMeetingCTA from '@/components/product/MidPageMeetingCTA';
import VideoSection from '@/components/product/VideoSection';
import RoutingVisual from '@/components/product/RoutingVisual';
import PipelineVisual from '@/components/product/PipelineVisual';
import AutomationVisual from '@/components/product/AutomationVisual';
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

      <VideoSection
        label="See It In Action"
        title="Watch Aiden Work"
        intro="See how Aiden handles the full pre-sales and support workflow, from routing to handoff, in a single conversation."
        mediaId="tx6su2gamj"
        page="lead-gen"
        checklistStyle="chat"
        checklist={[
          {
            title: '“I have a few questions about pricing.”',
            body: 'Aiden routes to Sales with full context and a qualified handoff brief.',
          },
          {
            title: '“Where can I find docs on the API?”',
            body: 'Aiden serves the right help article instantly — no agent needed.',
          },
          {
            title: '“I’m looking for an enterprise demo.”',
            body: 'Aiden qualifies the visitor and books the meeting on the spot.',
          },
        ]}
      />

      <FeatureSpotlight
        label="Routing"
        labelVariant="pink"
        title="Guide Every Conversation From the Start"
        accent="navy"
        paragraphs={[
          <>
            With routing buttons at the beginning of every chat, Aiden helps customers self-select the right path:{' '}
            <strong>sales, support, or product details.</strong> Every interaction starts in the right place.
          </>,
          'That reduces friction, boosts engagement, and means your team never fields a conversation that was never theirs to begin with.',
        ]}
        pills={[
          { label: 'Smart Routing' },
          { label: 'Self-Selection', variant: 'pink' },
          { label: 'Zero Manual Triage', variant: 'muted' },
        ]}
        graphic={<RoutingVisual />}
      />

      <FeatureSpotlight
        label="Pipeline"
        labelVariant="gold"
        title="Turn Chats Into Sales Opportunities"
        accent="card"
        reverse
        paragraphs={[
          <>
            Aiden doesn&rsquo;t just deflect tickets. It{' '}
            <strong>captures lead info, qualifies prospects, and passes hot opportunities straight to your sales team</strong>
            , automatically and without a single manual step.
          </>,
          'In e-commerce, that means helping customers navigate to the right product. In B2B, it means surfacing high-value conversations without wasting anyone’s time.',
        ]}
        pills={[
          { label: 'Lead Capture' },
          { label: 'Prospect Qualification' },
          { label: 'Hot Handoff', variant: 'pink' },
        ]}
        graphic={<PipelineVisual />}
      />

      <FeatureSpotlight
        label="Automation"
        labelVariant="pink"
        title="Automate the Routine. Elevate the Human."
        accent="navy"
        paragraphs={[
          <>
            Repetitive questions don&rsquo;t need your team&rsquo;s time.{' '}
            <strong>Aiden provides instant, accurate answers from your own content</strong>, freeing your staff can focus
            on complex issues and meaningful connections.
          </>,
          'Customers get quick help. Your team gets their time back. Everyone wins. Except the support backlog.',
        ]}
        pills={[
          { label: 'Knowledge Base Answers' },
          { label: 'Zero Wait Times', variant: 'pink' },
          { label: 'Team Time Saved', variant: 'muted' },
        ]}
        graphic={<AutomationVisual />}
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

      <MidPageMeetingCTA page="lead-gen" />
    </>
  );
}
