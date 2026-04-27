import type { Metadata } from 'next';

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

export default function CommercialPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <h1>Commercial</h1>
      {/* Replaced in Story 5.4 */}
    </>
  );
}
