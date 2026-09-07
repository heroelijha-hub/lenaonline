import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const DEFAULT_DISALLOW_PATHS = ['/admin/', '/account/', '/checkout/', '/api/'];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mystore.com';

  // Read robots settings from the database
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ['ROBOTS_DISALLOW_PATHS', 'ROBOTS_CRAWL_DELAY'],
      },
    },
  });

  const settingsMap = settings.reduce(
    (acc, s) => ({ ...acc, [s.key]: s.value }),
    {} as Record<string, string>
  );

  // Parse disallow paths from DB or use defaults
  let disallowPaths: string[] = DEFAULT_DISALLOW_PATHS;
  if (settingsMap['ROBOTS_DISALLOW_PATHS']) {
    try {
      disallowPaths = JSON.parse(settingsMap['ROBOTS_DISALLOW_PATHS']);
    } catch {
      disallowPaths = DEFAULT_DISALLOW_PATHS;
    }
  }

  // Parse crawl delay (optional)
  const crawlDelay = settingsMap['ROBOTS_CRAWL_DELAY']
    ? parseInt(settingsMap['ROBOTS_CRAWL_DELAY'], 10)
    : undefined;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: disallowPaths,
      ...(crawlDelay && !isNaN(crawlDelay) ? { crawlDelay } : {}),
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
