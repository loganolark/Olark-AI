'use client';

import Script from 'next/script';
import { useConsent } from '@/lib/consent';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

export default function GA4Script() {
  const { consent } = useConsent();

  if (!consent.analytics || !GA4_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA4_ID}', {
          page_path: window.location.pathname,
        });
      `}</Script>
    </>
  );
}
