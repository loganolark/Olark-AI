import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /essentials and /lead-gen were collapsed into the single product
      // page (/commercial) when the site narrative pivoted to industrial
      // suppliers — preserve any inbound links / SEO with permanent 308s.
      { source: '/essentials', destination: '/commercial', permanent: true },
      { source: '/lead-gen', destination: '/commercial', permanent: true },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: 'olark',
  project: 'olark-ai',
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
