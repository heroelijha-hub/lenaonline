'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

type StoreLayoutProps = {
  children: React.ReactNode;
  settings: {
    announcement: string;
    logoText: string;
    supportPhone: string;
    supportEmail: string;
    menuLinks: Array<{ label: string, url: string }>;
  };
};

export default function StoreLayout({ children, settings }: StoreLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        announcement={settings.announcement} 
        logoText={settings.logoText} 
        menuLinks={settings.menuLinks}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer supportPhone={settings.supportPhone} supportEmail={settings.supportEmail} />
    </div>
  );
}
