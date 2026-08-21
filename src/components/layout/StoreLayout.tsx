'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import MaintenanceView from '@/components/maintenance/MaintenanceView';

type StoreLayoutProps = {
  children: React.ReactNode;
  settings: {
    announcement: string;
    logoImage: string;
    supportPhone: string;
    supportEmail: string;
    menuLinks: Array<{ label: string, url: string }>;
    footerBgColor: string;
    footerTextColor: string;
    footerAddress1: string;
    footerAddress2: string;
    footerLocationsTitle: string;
    footerNewsletterTitle: string;
    footerNewsletterText: string;
    footerNewsletterPlaceholder: string;
    footerCallUsText: string;
    footerCopyright: string;
    footerSocialFacebook: string;
    footerSocialTwitter: string;
    footerSocialInstagram: string;
    footerSocialLinkedin: string;
    footerColumns: Array<{ title: string, links: Array<{ label: string, url: string }> }>;
    categories?: Array<{ id: string, name: string, slug: string | null }>;
    maintenanceMode?: boolean;
    maintenanceTitle?: string;
    maintenanceMessage?: string;
    maintenanceImage?: string;
    searchBorderColor?: string;
    searchPlaceholder?: string;
    searchBtnText?: string;
    searchBtnBgColor?: string;
    searchBtnTextColor?: string;
    showNew?: boolean;
    showHot?: boolean;
    showSale?: boolean;
    mobileAboutTitle?: string;
    mobileAboutDesc?: string;
    mobileMenuLinks?: Array<{ label: string, url: string }>;
    mobileContactAddress?: string;
    mobileContactPhone?: string;
    mobileContactEmail?: string;
    mobileContactWebsite?: string;
    mobileHeaderBorderColor?: string;
  };
};

export default function StoreLayout({ children, settings }: StoreLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const isPreview = pathname?.startsWith('/preview');
  const isLogin = pathname?.startsWith('/login');

  if (isAdmin || isPreview || isLogin) {
    return <>{children}</>;
  }

  if (settings.maintenanceMode) {
    return (
      <MaintenanceView 
        title={settings.maintenanceTitle || 'Site en maintenance'} 
        message={settings.maintenanceMessage || 'Nous mettons actuellement à jour notre boutique. Revenez très bientôt !'} 
        image={settings.maintenanceImage} 
        logoImage={settings.logoImage} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        announcement={settings.announcement} 
        logoImage={settings.logoImage} 
        menuLinks={settings.menuLinks}
        categories={settings.categories}
        searchBorderColor={settings.searchBorderColor}
        searchPlaceholder={settings.searchPlaceholder}
        searchBtnText={settings.searchBtnText}
        searchBtnBgColor={settings.searchBtnBgColor}
        searchBtnTextColor={settings.searchBtnTextColor}
        showNew={settings.showNew}
        showHot={settings.showHot}
        showSale={settings.showSale}
        mobileAboutTitle={settings.mobileAboutTitle}
        mobileAboutDesc={settings.mobileAboutDesc}
        mobileMenuLinks={settings.mobileMenuLinks}
        mobileContactAddress={settings.mobileContactAddress}
        mobileContactPhone={settings.mobileContactPhone}
        mobileContactEmail={settings.mobileContactEmail}
        mobileContactWebsite={settings.mobileContactWebsite}
        mobileHeaderBorderColor={settings.mobileHeaderBorderColor}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer 
        supportPhone={settings.supportPhone} 
        supportEmail={settings.supportEmail} 
        footerBgColor={settings.footerBgColor}
        footerTextColor={settings.footerTextColor}
        footerAddress1={settings.footerAddress1}
        footerAddress2={settings.footerAddress2}
        footerLocationsTitle={settings.footerLocationsTitle}
        footerNewsletterTitle={settings.footerNewsletterTitle}
        footerNewsletterText={settings.footerNewsletterText}
        footerNewsletterPlaceholder={settings.footerNewsletterPlaceholder}
        footerCallUsText={settings.footerCallUsText}
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
