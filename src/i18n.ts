import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function getI18nConfig() {
  let pathname = '/';
  try {
    const headersList = await headers();
    pathname = headersList.get('x-pathname') || '/';
  } catch (error) {
    // This happens during static generation where headers() is not available
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

  const messages = locale === 'fr' 
    ? (await import('../../messages/fr.json')).default
    : (await import('../../messages/en.json')).default;

  return {
    locale,
    messages
  };
}

export default getRequestConfig(getI18nConfig);
