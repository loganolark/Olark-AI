'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useConsent } from '@/lib/consent';
import { trackEvent } from '@/lib/analytics';

export default function PageViewTracker() {
  const pathname = usePathname();
  const { consent } = useConsent();

  useEffect(() => {
    if (!consent.analytics) return;
    trackEvent('page_view', {
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, consent.analytics]);

  return null;
}
