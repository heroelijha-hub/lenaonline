import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export default getRequestConfig(async () => {
  let pathname = '/';
  try {
    const headersList = await headers();
    pathname = headersList.get('x-pathname') || '/';
  } catch (error) {
    pathname = '/';
  }

  const isAdminRoute = pathname.startsWith('/admin');

  // Fetch settings from DB
  let activeLanguage = 'en';
  let translationScope = 'all'; // 'frontend_only', 'admin_only', 'all'

  try {
    const langSetting = await prisma.setting.findUnique({ where: { key: 'active_language' } });
    const scopeSetting = await prisma.setting.findUnique({ where: { key: 'translation_scope' } });
    
    if (langSetting) activeLanguage = langSetting.value;
    if (scopeSetting) translationScope = scopeSetting.value;
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
