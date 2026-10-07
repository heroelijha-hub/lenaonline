'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import MaintenanceView from '@/components/maintenance/MaintenanceView';

type StoreLayoutProps = {
  children: React.ReactNode;
  settings: {
    announcement: string;
    logoImage: string;
    headerLogoHeight?: string;
    mobileLogoHeight?: string;
    supportPhone: string;
    supportEmail: string;
    headerMainMenuId?: string;
    footerCol2MenuId?: string;
    footerCol3MenuId?: string;
    footerCol4MenuId?: string;
    resolvedMenus?: Array<any>;
    menuLinks: Array<{ label: string, url: string }>;
    topBarLinks?: Array<{ label: string, icon: string, url: string }>;
    loginText?: string;
    myAccountText?: string;
    adminDashboardText?: string;
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
    footerCol2Title?: string;
    footerCol3Title?: string;
    footerCol4Title?: string;
    categories?: Array<{ id: string, name: string, slug: string | null }>;
    footerLogoImage?: string;
    footerDescription?: string;
    footerShowAddress?: boolean;
    footerShowEmail?: boolean;
    footerShowPhone?: boolean;
    footerPaymentAmex?: boolean;
    footerPaymentApplePay?: boolean;
    footerPaymentGooglePay?: boolean;
    footerPaymentMastercard?: boolean;
    footerPaymentVisa?: boolean;
    footerPaymentOpay?: boolean;
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
    allCategoriesBgColor?: string;
    allCategoriesTextColor?: string;
    contactSlug?: string;
  };
  userRole?: 'ADMIN' | 'CUSTOMER' | null;
};

export default function StoreLayout({ children, settings, userRole }: StoreLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const isPreview = pathname?.startsWith('/preview');

  if (isAdmin || isPreview) {
    return <>{children}</>;
  }

  if (settings.maintenanceMode) {
    return (
      <MaintenanceView 
        title={settings.maintenanceTitle || 'Site en maintenance'} 
        message={settings.maintenanceMessage || 'We are currently updating our store. Come back very soon!'} 
        image={settings.maintenanceImage} 
        logoImage={settings.logoImage} 
      />
    );
  }

  let finalMenuLinks = settings.menuLinks;
  if (settings.headerMainMenuId && settings.resolvedMenus) {
    const mm = settings.resolvedMenus.find(m => m.id === settings.headerMainMenuId);
    if (mm && mm.items) {
      finalMenuLinks = mm.items.map((it: any) => ({ label: it.label, url: it.url }));
    }
  }

  let finalFooterColumns = settings.footerColumns || [];
  if (settings.resolvedMenus) {
    const col2 = settings.resolvedMenus.find(m => m.id === settings.footerCol2MenuId);
    const col3 = settings.resolvedMenus.find(m => m.id === settings.footerCol3MenuId);
    const col4 = settings.resolvedMenus.find(m => m.id === settings.footerCol4MenuId);
    
    if (col2 || col3 || col4) {
      finalFooterColumns = [];
      if (col2 && col2.items) {
        finalFooterColumns.push({ title: settings.footerCol2Title || col2.name, links: col2.items.map((it: any) => ({ label: it.label, url: it.url })) });
      }
      if (col3 && col3.items) {
        finalFooterColumns.push({ title: settings.footerCol3Title || col3.name, links: col3.items.map((it: any) => ({ label: it.label, url: it.url })) });
      }
      if (col4 && col4.items) {
        finalFooterColumns.push({ title: settings.footerCol4Title || col4.name, links: col4.items.map((it: any) => ({ label: it.label, url: it.url })) });
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header 
        userRole={userRole}
        announcement={settings.announcement} 
        logoImage={settings.logoImage} 
        headerLogoHeight={settings.headerLogoHeight}
        mobileLogoHeight={settings.mobileLogoHeight}
        menuLinks={finalMenuLinks}
        topBarLinks={settings.topBarLinks}
        loginText={settings.loginText}
        myAccountText={settings.myAccountText}
        adminDashboardText={settings.adminDashboardText}
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
        allCategoriesBgColor={settings.allCategoriesBgColor}
        allCategoriesTextColor={settings.allCategoriesTextColor}
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
        footerColumns={finalFooterColumns}
        categories={settings.categories}
        footerLogoImage={settings.footerLogoImage}
        footerDescription={settings.footerDescription}
        footerShowAddress={settings.footerShowAddress}
        footerShowEmail={settings.footerShowEmail}
        footerShowPhone={settings.footerShowPhone}
        footerPaymentAmex={settings.footerPaymentAmex}
        footerPaymentApplePay={settings.footerPaymentApplePay}
        footerPaymentGooglePay={settings.footerPaymentGooglePay}
        footerPaymentMastercard={settings.footerPaymentMastercard}
        footerPaymentVisa={settings.footerPaymentVisa}
        footerPaymentOpay={settings.footerPaymentOpay}
        contactSlug={settings.contactSlug}
      />
      <CookieConsent />
    </div>
  );
}
