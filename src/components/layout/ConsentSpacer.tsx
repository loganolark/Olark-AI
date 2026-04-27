'use client';

import { useConsent } from '@/lib/consent';

export default function ConsentSpacer() {
  const { hasInteracted } = useConsent();
  if (hasInteracted) return null;
  return <div aria-hidden="true" style={{ height: '56px', flexShrink: 0 }} />;
}
