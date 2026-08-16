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

  const storeSettings = {
    announcement: settingsMap.HEADER_ANNOUNCEMENT || 'Welcome to Shopelios',
    logoText: settingsMap.HEADER_LOGO_TEXT || 'LOGO',
    supportPhone: settingsMap.HEADER_SUPPORT_PHONE || '+08 9229 8228',
    supportEmail: settingsMap.HEADER_SUPPORT_EMAIL || 'support@shopelios.com',
    menuLinks: menuLinks,
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
