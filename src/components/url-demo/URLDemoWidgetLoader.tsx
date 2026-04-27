'use client';

import dynamic from 'next/dynamic';
import type { URLDemoWidgetProps } from '@/types/demo';

function URLDemoPlaceholder() {
  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        border: '1px solid var(--od-border)',
        borderRadius: '16px',
        padding: '3.5rem 2rem',
        background: 'var(--od-card)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        textAlign: 'center',
      }}
    >
      <p style={{ color: 'var(--od-muted)', fontSize: '0.9375rem', margin: 0 }}>
        Loading demo...
      </p>
    </div>
  );
}

const URLDemoWidget = dynamic(
  () => import('@/components/url-demo/URLDemoWidget'),
  { ssr: false, loading: () => <URLDemoPlaceholder /> }
);

export default function URLDemoWidgetLoader(props: URLDemoWidgetProps) {
  return <URLDemoWidget {...props} />;
}
