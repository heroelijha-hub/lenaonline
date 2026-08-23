import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import prisma from "@/lib/prisma";
import CurrencyProvider from "@/components/CurrencyProvider";
import { defaultCurrencyOptions } from "@/lib/formatPrice";
import ChatWidget from "@/components/chat/ChatWidget";
import BackToTop from "@/components/BackToTop";
import StoreLayout from "@/components/layout/StoreLayout";
import ThemeProvider from "@/components/layout/ThemeProvider";
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://shopelios.vercel.app"),
  title: "Shopelios | Boutique E-commerce",
  description: "Boutique en ligne 100% fonctionnelle",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  const locale = await getLocale();
  
  const settingsDb = await prisma.setting.findMany();
  const settingsMap = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  
  const currencyOptions = {
    currencySymbol: settingsMap.currencySymbol || defaultCurrencyOptions.currencySymbol,
    currencyPosition: (settingsMap.currencyPosition as any) || defaultCurrencyOptions.currencyPosition,
    thousandSeparator: settingsMap.thousandSeparator !== undefined ? settingsMap.thousandSeparator : defaultCurrencyOptions.thousandSeparator,
    decimalSeparator: settingsMap.decimalSeparator || defaultCurrencyOptions.decimalSeparator,
    taxIncludedInPrice: settingsMap.TAX_INCLUDED_IN_PRICE === 'true',
    defaultVatRate: Number(settingsMap.DEFAULT_VAT_RATE) || 20,
  };
  const defaultMenuLinks = [
    { label: 'Home', url: '/' },
    { label: 'Shop', url: '/shop' },
    { label: 'Pages', url: '/pages' },
    { label: 'Blogs', url: '/blogs' },
    { label: 'Portfolios', url: '/portfolios' },
    { label: 'Contact Us', url: '/contact' },
  ];

  let menuLinks = defaultMenuLinks;
  try {
    if (settingsMap.HEADER_MENU_LINKS) {
      menuLinks = JSON.parse(settingsMap.HEADER_MENU_LINKS);
    }
  } catch (e) {
    console.error("Erreur parsing HEADER_MENU_LINKS", e);
  }
  
  const defaultFooterColumns = [
    { title: 'Contact Us', links: [{ label: 'About Us', url: '#' }, { label: 'Contact Us', url: '#' }] },
    { title: 'Account', links: [{ label: 'Shop', url: '#' }, { label: 'Checkout', url: '#' }] }
  ];
  let footerColumns = defaultFooterColumns;
  try {
    if (settingsMap.FOOTER_COLUMNS) {
      footerColumns = JSON.parse(settingsMap.FOOTER_COLUMNS);
    }
  } catch (e) {}

  const defaultTopBarLinks = [
    { label: 'Store Locator', icon: 'location', url: '/store-locator' },
    { label: 'Order Tracking', icon: 'truck', url: '/order-tracking' },
  ];
  let topBarLinks = defaultTopBarLinks;
  try {
    if (settingsMap.TOP_BAR_LINKS) {
      topBarLinks = JSON.parse(settingsMap.TOP_BAR_LINKS);
    }
  } catch (e) {}

  const [newProductsCount, hotProductsCount, saleProductsCount] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { orderItems: { some: {} } } }),
    prisma.product.count({ where: { compareAtPrice: { not: null } } })
  ]);

  const storeSettings = {
    announcement: settingsMap.HEADER_ANNOUNCEMENT || 'Welcome to Shopelios',
    logoImage: settingsMap.HEADER_LOGO_IMAGE || '/logo.jpg',
    supportPhone: settingsMap.HEADER_SUPPORT_PHONE || '+08 9229 8228',
    supportEmail: settingsMap.HEADER_SUPPORT_EMAIL || 'support@shopelios.com',
    menuLinks: menuLinks,
    topBarLinks: topBarLinks,
    topBarBgColor: settingsMap.TOP_BAR_BG_COLOR || '#ffffff',
    topBarTextColor: settingsMap.TOP_BAR_TEXT_COLOR || '#4b5563',
    footerBgColor: settingsMap.FOOTER_BG_COLOR || '#0B162C',
    footerTextColor: settingsMap.FOOTER_TEXT_COLOR || '#d1d5db',
    footerAddress1: settingsMap.FOOTER_ADDRESS_1 || '2972 Westheimer Rd. Illinois 85486',
    footerAddress2: settingsMap.FOOTER_ADDRESS_2 || '17 Princess Road, London, Greater London NW1 8JR, UK',
    footerLocationsTitle: settingsMap.FOOTER_LOCATIONS_TITLE || 'Our Locations',
    footerNewsletterTitle: settingsMap.FOOTER_NEWSLETTER_TITLE || 'Newsletter',
    footerNewsletterText: settingsMap.FOOTER_NEWSLETTER_TEXT || 'Get 15% off your first purchase! Plus, be the first to know about sales new product launches and exclusive offers!',
    footerNewsletterPlaceholder: settingsMap.FOOTER_NEWSLETTER_PLACEHOLDER || 'Enter your email...',
    footerCallUsText: settingsMap.FOOTER_CALL_US_TEXT || 'Call Us Now',
    footerCopyright: settingsMap.FOOTER_COPYRIGHT || '© 2026 Shopelios All rights reserved.',
    footerSocialFacebook: settingsMap.FOOTER_SOCIAL_FACEBOOK || '#',
    footerSocialTwitter: settingsMap.FOOTER_SOCIAL_TWITTER || '#',
    footerSocialInstagram: settingsMap.FOOTER_SOCIAL_INSTAGRAM || '#',
    footerSocialLinkedin: settingsMap.FOOTER_SOCIAL_LINKEDIN || '#',
    footerColumns: footerColumns,
    categories: await prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
    maintenanceMode: settingsMap.MAINTENANCE_MODE === 'true',
    maintenanceTitle: settingsMap.MAINTENANCE_TITLE || 'Site en maintenance',
    maintenanceMessage: settingsMap.MAINTENANCE_MESSAGE || 'Nous mettons actuellement à jour notre boutique. Revenez très bientôt !',
    maintenanceImage: settingsMap.MAINTENANCE_IMAGE || '',
    searchBorderColor: settingsMap.SEARCH_BORDER_COLOR || '#d1d5db',
    searchPlaceholder: settingsMap.SEARCH_PLACEHOLDER || 'Rechercher un produit...',
    searchBtnText: settingsMap.SEARCH_BTN_TEXT || 'Search',
    searchBtnBgColor: settingsMap.SEARCH_BTN_BG_COLOR || '#f97316',
    searchBtnTextColor: settingsMap.SEARCH_BTN_TEXT_COLOR || '#111827',
    showNew: newProductsCount > 0,
    showHot: hotProductsCount >= 3,
    showSale: saleProductsCount > 0,
    mobileAboutTitle: settingsMap.MOBILE_ABOUT_TITLE || 'À propos de nous',
    mobileAboutDesc: settingsMap.MOBILE_ABOUT_DESC || 'Nous sommes une boutique passionnée par la qualité et l\'excellence.',
    mobileMenuLinks: (() => {
      try {
        return settingsMap.MOBILE_MENU_LINKS ? JSON.parse(settingsMap.MOBILE_MENU_LINKS) : defaultMenuLinks;
      } catch {
        return defaultMenuLinks;
      }
    })(),
    mobileContactAddress: settingsMap.MOBILE_CONTACT_ADDRESS || '123 Rue Principale, Paris',
    mobileContactPhone: settingsMap.MOBILE_CONTACT_PHONE || '+33 1 23 45 67 89',
    mobileContactEmail: settingsMap.MOBILE_CONTACT_EMAIL || 'contact@shopelios.com',
    mobileContactWebsite: settingsMap.MOBILE_CONTACT_WEBSITE || 'www.shopelios.com',
    mobileHeaderBorderColor: settingsMap.MOBILE_HEADER_BORDER_COLOR || '#d1d5db',
  };

  const cookieStore = await cookies();
  const previewFontCookie = cookieStore.get('preview_font');
  const globalFont = previewFontCookie?.value || settingsMap.GLOBAL_FONT_FAMILY || 'Inter';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${globalFont.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;

  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        {globalFont !== 'Inter' && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href={fontUrl} rel="stylesheet" />
            <style>{`
              :root {
                --font-inter: '${globalFont}', sans-serif;
              }
              body, .font-sans {
                font-family: '${globalFont}', sans-serif !important;
              }
            `}</style>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider themeColor={settingsMap.THEME_COLOR || '#f97316'} />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <CurrencyProvider options={currencyOptions}>
            <StoreLayout settings={storeSettings}>
              {children}
              <ChatWidget 
                enabled={settingsMap.CHAT_ENABLED !== 'false'} 
                storeName={settingsMap.CHAT_STORE_NAME || 'Support'} 
                storeIcon={settingsMap.CHAT_STORE_ICON || ''} 
              />
              <BackToTop />
            </StoreLayout>
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
