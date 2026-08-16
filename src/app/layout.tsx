import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import prisma from "@/lib/prisma";
import CurrencyProvider from "@/components/CurrencyProvider";
import { defaultCurrencyOptions } from "@/lib/formatPrice";
import ChatWidget from "@/components/chat/ChatWidget";

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
  };

  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CurrencyProvider options={currencyOptions}>
          {children}
          <ChatWidget 
            enabled={settingsMap.CHAT_ENABLED === 'true'} 
            storeName={settingsMap.CHAT_STORE_NAME || 'Support'} 
            storeIcon={settingsMap.CHAT_STORE_ICON || ''} 
          />
        </CurrencyProvider>
      </body>
    </html>
  );
}
