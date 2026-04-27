import type { Metadata } from 'next';

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
      <h1>Essentials</h1>
      {/* Replaced in Story 5.2 */}
    </>
  );
}
