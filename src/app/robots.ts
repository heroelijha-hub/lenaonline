import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopelios.com'; // À remplacer par le vrai domaine

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/account/', '/checkout/', '/api/'], // On interdit à Google d'indexer les pages privées
    },
    sitemap: `${baseUrl}/sitemap.xml`, // On indique à Google où trouver le sitemap
  };
}
