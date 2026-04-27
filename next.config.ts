import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {};

export default withSentryConfig(nextConfig, {
  org: 'olark',
  project: 'olark-ai',
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
