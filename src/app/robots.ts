import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mystore.com'; // Replace with the real domain

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/', '/checkout/', '/api/'], // Blocking Google from indexing private pages
    },
    sitemap: `${baseUrl}/sitemap.xml`, // Tell Google where to find the sitemap
  };
}
