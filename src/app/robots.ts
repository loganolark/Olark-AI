import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/get-started',
      },
    ],
    sitemap: 'https://olark.ai/sitemap.xml',
  };
}
