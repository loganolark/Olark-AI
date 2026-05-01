import type { MetadataRoute } from 'next';

const BASE_URL = 'https://olark.ai';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/commercial`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // /get-started intentionally excluded (noindex, nofollow).
    // /essentials and /lead-gen were collapsed into /commercial; redirected
    // via next.config.ts so they don't need sitemap entries.
  ];
}
