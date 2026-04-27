import type { Metadata } from 'next';
import SectionHero from '@/components/ui/SectionHero';
import PillBadge from '@/components/ui/PillBadge';
import CTAButton from '@/components/ui/CTAButton';
import TierCard from '@/components/product/TierCard';
import QuizResumeBanner from '@/components/quiz/QuizResumeBanner';

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

const ESSENTIALS_CAPABILITIES = [
  'One-click install — paste a script tag, you’re live',
  'Pre-trained on your site, FAQs, and pricing',
  'Routes qualified visitors to your rep automatically',
  'Self-serve dashboard — no implementation engineer required',
  'Live in 48 hours, not 6 months',
];

export default function EssentialsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <QuizResumeBanner />

      <SectionHero
        badge={<PillBadge variant="gold">Essentials Tier</PillBadge>}
        headline="Smart Chat, Ready in Minutes"
        subhead="Live in 48 hours. Every visitor qualified, routed, and ready for your rep."
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
            tier="essentials"
            headline="Essentials"
            tagline="For SMB teams who want chat that just works — qualified leads, no babysitting, no upgrade dance."
            capabilities={ESSENTIALS_CAPABILITIES}
            ctaHref="/get-started"
            ctaLabel="Get Started Today →"
          />
        </div>
      </section>

      <section
        style={{
          backgroundColor: 'var(--od-card)',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--od-muted)',
            marginBottom: '1rem',
          }}
        >
          Your team scaling fast?
        </p>
        <CTAButton variant="ghost" size="md" href="/lead-gen">
          See Lead-Gen →
        </CTAButton>
      </section>
    </>
  );
}
