import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { getCachedSettings } from '@/lib/cache';

export default getRequestConfig(async () => {
  let pathname = '/';
  try {
    const headersList = await headers();
    pathname = headersList.get('x-pathname') || '/';
  } catch (error) {
    pathname = '/';
  }

  const isAdminRoute = pathname.startsWith('/admin');

  // Fetch settings from cache (0ms DB latency)
  let activeLanguage = 'en';
  let translationScope = 'all'; // 'frontend_only', 'admin_only', 'all'

  try {
    const settings = await getCachedSettings();
    if (settings['active_language']) activeLanguage = settings['active_language'];
    if (settings['translation_scope']) translationScope = settings['translation_scope'];
  } catch (error) {
    console.error("Failed to fetch i18n settings", error);
  }

  // Determine locale based on scope options
  let locale = 'en'; // default fallback

  if (translationScope === 'all') {
    locale = activeLanguage;
  } else if (translationScope === 'frontend_only') {
    locale = isAdminRoute ? 'en' : activeLanguage;
  } else if (translationScope === 'admin_only') {
    locale = isAdminRoute ? activeLanguage : 'en';
  }

  let messages;
  if (locale === 'fr') {
    messages = (await import('../../messages/fr.json')).default;
  } else if (locale === 'es') {
    messages = (await import('../../messages/es.json')).default;
  } else if (locale === 'de') {
    messages = (await import('../../messages/de.json')).default;
  } else {
    messages = (await import('../../messages/en.json')).default;
  }

  return {
    locale,
    messages
  };
});
