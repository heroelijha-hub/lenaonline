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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shopelios | Boutique E-commerce",
  description: "Boutique en ligne 100% fonctionnelle",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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

  const storeSettings = {
    announcement: settingsMap.HEADER_ANNOUNCEMENT || 'Welcome to Shopelios',
    logoImage: settingsMap.HEADER_LOGO_IMAGE || '',
    supportPhone: settingsMap.HEADER_SUPPORT_PHONE || '+08 9229 8228',
    supportEmail: settingsMap.HEADER_SUPPORT_EMAIL || 'support@shopelios.com',
    menuLinks: menuLinks,
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
  };

  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider themeColor={settingsMap.THEME_COLOR || '#f97316'} />
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
      </body>
    </html>
  );
}
