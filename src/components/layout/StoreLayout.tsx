'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

type StoreLayoutProps = {
  children: React.ReactNode;
  settings: {
    announcement: string;
    logoImage: string;
    supportPhone: string;
    supportEmail: string;
    menuLinks: Array<{ label: string, url: string }>;
    footerAddress1: string;
    footerAddress2: string;
    footerNewsletterText: string;
    footerCopyright: string;
    footerSocialFacebook: string;
    footerSocialTwitter: string;
    footerSocialInstagram: string;
    footerSocialLinkedin: string;
    footerColumns: Array<{ title: string, links: Array<{ label: string, url: string }> }>;
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
        logoImage={settings.logoImage} 
        menuLinks={settings.menuLinks}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer 
        supportPhone={settings.supportPhone} 
        supportEmail={settings.supportEmail} 
        footerAddress1={settings.footerAddress1}
        footerAddress2={settings.footerAddress2}
        footerNewsletterText={settings.footerNewsletterText}
        footerCopyright={settings.footerCopyright}
        footerSocialFacebook={settings.footerSocialFacebook}
        footerSocialTwitter={settings.footerSocialTwitter}
        footerSocialInstagram={settings.footerSocialInstagram}
        footerSocialLinkedin={settings.footerSocialLinkedin}
        footerColumns={settings.footerColumns}
      />
    </div>
  );
}
