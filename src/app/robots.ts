import { MetadataRoute } from 'next';
import { getCachedSettings } from '@/lib/cache';

const DEFAULT_DISALLOW_PATHS = [
  '/admin/', 
  '/account/', 
  '/checkout/', 
  '/cart/',
  '/api/', 
  '/categorie-produit/', 
  '/produit/',
  '/search',
  '/search/*',
  '/*?*sort=*',
  '/*?*page=*',
  '/*?*filter=*',
  '/*?*minPrice=*',
  '/*?*maxPrice=*',
  '/*?*rating=*',
  '/*?*category=*',
  '/*?*brand=*',
  '/*?*view=*',
  '/*?*q=*',
  '/*?filter_cat=/',
  '/*?column=/',
  '/*?per_page=/',
  '/*?rating_filter=/',
  '/*?stock_status=/',
  '/*?featured=/',
  '/*?best_seller=/',
  '/*?add-to-cart=/'
];

// List of aggressive SEO / scraping crawlers that burn Vercel Fluid CPU
const AGGRESSIVE_SCRAPERS = [
  'AhrefsBot',
  'SemrushBot',
  'PetalBot',
  'DotBot',
  'MJ12bot',
  'DataForSeoBot',
  'ZoominfoBot',
  'Barkrowler',
  'BLEXBot',
  'SeznamBot'
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.toplenaolline.com';
  const baseUrl = rawBaseUrl.replace(/\/$/, '');

  const settingsMap = await getCachedSettings();

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
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowPaths,
        ...(crawlDelay && !isNaN(crawlDelay) ? { crawlDelay } : {}),
      },
      ...AGGRESSIVE_SCRAPERS.map(bot => ({
        userAgent: bot,
        disallow: ['/'],
      }))
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
