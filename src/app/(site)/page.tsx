import type { Metadata } from 'next';

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
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="font-heading text-4xl" style={{ color: 'var(--od-gold)' }}>
          Aiden by Olark
        </h1>
        <p style={{ color: 'var(--od-muted)' }}>Coming soon.</p>
      </main>
    </>
  );
}
