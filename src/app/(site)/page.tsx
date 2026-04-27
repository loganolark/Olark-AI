import type { Metadata } from 'next';
// Temporary smoke test imports — remove before Story 2.2 begins
import CTAButton from '@/components/ui/CTAButton';
import PillBadge from '@/components/ui/PillBadge';
import SectionHero from '@/components/ui/SectionHero';

export const metadata: Metadata = {
  title: 'Your Leads Arrive Ready | Aiden by Olark',
  description: 'Aiden is your AI sales rep. It qualifies and routes every chat visitor so your team focuses on deals, not conversations.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Your Leads Arrive Ready | Aiden by Olark',
    description: 'Aiden is your AI sales rep. It qualifies and routes every chat visitor so your team focuses on deals, not conversations.',
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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <SectionHero
        headline="Your Leads Arrive Ready"
        subhead="Aiden turns browsers into briefed buyers — before your rep says hello."
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
      >
        <PillBadge variant="gold" pulse>Live Demo</PillBadge>
        <div style={{
          border: '1px dashed var(--od-border)',
          borderRadius: '12px',
          padding: '3rem 1.5rem',
          color: 'var(--od-muted)',
          fontSize: '0.9375rem',
          marginTop: '1rem',
        }}>
          URL Demo Widget — coming in Epic 3
        </div>
      </SectionHero>
    </>
  );
}
