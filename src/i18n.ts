import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
// Import db or prisma client here. Adjust path if necessary.
import prisma from '@/lib/prisma';

export default getRequestConfig(async () => {
  // Get the current path from headers (Next.js middleware usually sets x-pathname or we can get it from x-invoke-path)
  const headersList = headers();
  // A safe way to get pathname if middleware sets it, or just use a default for server components
  // In Next.js 14/15, getting pathname directly in getRequestConfig can be tricky without middleware forwarding it.
  const pathname = headersList.get('x-pathname') || '/';

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

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
