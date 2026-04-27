import type { Metadata } from 'next';

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

export default function LeadGenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <h1>Lead-Gen</h1>
      {/* Replaced in Story 5.3 */}
    </>
  );
}
