'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSetting, updateSettingsBatch } from '@/actions/settings';
import { uploadImage } from '@/actions/admin';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
  { code: 'XOF', symbol: 'CFA', name: 'Franc CFA' },
];

export default function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const t = useTranslations('Admin');
  const tSettings = useTranslations('AdminSettings');

  const router = useRouter();
  const [currency, setCurrency] = useState(initialSettings.currency || 'USD');
  const [currencyPosition, setCurrencyPosition] = useState(initialSettings.currencyPosition || 'left');
  const [thousandSeparator, setThousandSeparator] = useState(initialSettings.thousandSeparator || ',');
  const [decimalSeparator, setDecimalSeparator] = useState(initialSettings.decimalSeparator || '.');
  
  // Translation settings
  const [activeLanguage, setActiveLanguage] = useState(initialSettings.active_language || 'en');
  const [translationScope, setTranslationScope] = useState(initialSettings.translation_scope || 'all');

  const [enableBuyNow, setEnableBuyNow] = useState(initialSettings.ENABLE_BUY_NOW_BUTTON === 'true');
  const [chatEnabled, setChatEnabled] = useState(initialSettings.CHAT_ENABLED === 'true');
  const [chatStoreName, setChatStoreName] = useState(initialSettings.CHAT_STORE_NAME || 'My Store');
  const [chatStoreIcon, setChatStoreIcon] = useState(initialSettings.CHAT_STORE_ICON || '');
  const [chatIconFile, setChatIconFile] = useState<File | null>(null);

  // Contact & Newsletter settings
  const [contactReceiverEmail, setContactReceiverEmail] = useState(initialSettings.CONTACT_RECEIVER_EMAIL || 'admin@mystore.com');
  const [newsletterSuccessMessage, setNewsletterSuccessMessage] = useState(initialSettings.NEWSLETTER_SUCCESS_MESSAGE || 'Thank you for subscribing to our newsletter!');

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState(initialSettings.SMTP_HOST || '');
  const [smtpPort, setSmtpPort] = useState(initialSettings.SMTP_PORT || '');
  const [smtpUser, setSmtpUser] = useState(initialSettings.SMTP_USER || '');
  const [smtpPass, setSmtpPass] = useState(initialSettings.SMTP_PASS || '');
  const [smtpFrom, setSmtpFrom] = useState(initialSettings.SMTP_FROM || '');

  // Payment Settings
  const [enableStripe, setEnableStripe] = useState(initialSettings.ENABLE_STRIPE !== 'false');
  const [enablePaypal, setEnablePaypal] = useState(initialSettings.ENABLE_PAYPAL !== 'false');
  const [enableBankTransfer, setEnableBankTransfer] = useState(initialSettings.ENABLE_BANK_TRANSFER !== 'false');
  const [stripePublicKey, setStripePublicKey] = useState(initialSettings.STRIPE_PUBLIC_KEY || '');
  const [stripeSecretKey, setStripeSecretKey] = useState(initialSettings.STRIPE_SECRET_KEY || '');
  const [paypalClientId, setPaypalClientId] = useState(initialSettings.PAYPAL_CLIENT_ID || '');
  const [paypalSecret, setPaypalSecret] = useState(initialSettings.PAYPAL_SECRET || '');
  const [bankTransferIban, setBankTransferIban] = useState(initialSettings.BANK_TRANSFER_IBAN || '');
  const [bankTransferBic, setBankTransferBic] = useState(initialSettings.BANK_TRANSFER_BIC || '');
  const [bankTransferAccountHolder, setBankTransferAccountHolder] = useState(initialSettings.BANK_TRANSFER_ACCOUNT_HOLDER || '');
  const [bankTransferBankName, setBankTransferBankName] = useState(initialSettings.BANK_TRANSFER_BANK_NAME || '');
  const [bankTransferCheckoutMessage, setBankTransferCheckoutMessage] = useState(initialSettings.BANK_TRANSFER_CHECKOUT_MESSAGE || 'Veuillez effectuer le virement sur le compte ci-dessous.');
  const [bankTransferInstructions, setBankTransferInstructions] = useState(initialSettings.BANK_TRANSFER_INSTRUCTIONS || 'Your order will be processed upon payment receipt.');

  // Design & Header settings
  const [shopCardStyle, setShopCardStyle] = useState(initialSettings.SHOP_CARD_STYLE || 'design2');
  const [shopCardBorderColor, setShopCardBorderColor] = useState(initialSettings.SHOP_CARD_BORDER_COLOR || '#e5e7eb');
  const [themeColor, setThemeColor] = useState(initialSettings.THEME_COLOR || '#f97316'); // Default to orange-500
  const [headerAnnouncement, setHeaderAnnouncement] = useState(initialSettings.HEADER_ANNOUNCEMENT || 'Welcome to our store!');
  const [headerLogoImage, setHeaderLogoImage] = useState(initialSettings.HEADER_LOGO_IMAGE || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [headerSupportPhone, setHeaderSupportPhone] = useState(initialSettings.HEADER_SUPPORT_PHONE || '+08 9229 8228');
  const [headerSupportEmail, setHeaderSupportEmail] = useState(initialSettings.HEADER_SUPPORT_EMAIL || 'support@mystore.com');
  
  // Top Bar settings
  const defaultTopBarLinks = [
    { label: 'Store Locator', icon: 'location', url: '/store-locator' },
    { label: 'Order Tracking', icon: 'truck', url: '/order-tracking' },
  ];
  const [topBarLinks, setTopBarLinks] = useState<Array<{label: string, icon: string, url: string}>>(() => {
    try {
      return initialSettings.TOP_BAR_LINKS ? JSON.parse(initialSettings.TOP_BAR_LINKS) : defaultTopBarLinks;
    } catch {
      return defaultTopBarLinks;
    }
  });
  const [topBarBgColor, setTopBarBgColor] = useState(initialSettings.TOP_BAR_BG_COLOR || '#ffffff');
  const [topBarTextColor, setTopBarTextColor] = useState(initialSettings.TOP_BAR_TEXT_COLOR || '#4b5563');

  // Menu links
  const defaultMenu = [
    { label: 'Home', url: '/' },
    { label: 'Shop', url: '/shop' },
    { label: 'Pages', url: '/pages' },
    { label: 'Blogs', url: '/blogs' },
    { label: 'Portfolios', url: '/portfolios' },
    { label: 'Contact Us', url: '/contact' },
  ];
  const [menuLinks, setMenuLinks] = useState<Array<{label: string, url: string}>>(() => {
    try {
      return initialSettings.HEADER_MENU_LINKS ? JSON.parse(initialSettings.HEADER_MENU_LINKS) : defaultMenu;
    } catch {
      return defaultMenu;
    }
  });

  // Mobile Menu Settings
  const [mobileAboutTitle, setMobileAboutTitle] = useState(initialSettings.MOBILE_ABOUT_TITLE || 'About Us');
  const [mobileAboutDesc, setMobileAboutDesc] = useState(initialSettings.MOBILE_ABOUT_DESC || 'We are a store passionate about quality and excellence.');
  const [mobileMenuLinks, setMobileMenuLinks] = useState<Array<{label: string, url: string}>>(() => {
    try {
      return initialSettings.MOBILE_MENU_LINKS ? JSON.parse(initialSettings.MOBILE_MENU_LINKS) : defaultMenu;
    } catch {
      return defaultMenu;
    }
  });
  const [mobileContactAddress, setMobileContactAddress] = useState(initialSettings.MOBILE_CONTACT_ADDRESS || '123 Main Street, London');
  const [mobileContactPhone, setMobileContactPhone] = useState(initialSettings.MOBILE_CONTACT_PHONE || '+33 1 23 45 67 89');
  const [mobileContactEmail, setMobileContactEmail] = useState(initialSettings.MOBILE_CONTACT_EMAIL || 'contact@mystore.com');
  const [mobileContactWebsite, setMobileContactWebsite] = useState(initialSettings.MOBILE_CONTACT_WEBSITE || 'www.mystore.com');
  const [mobileHeaderBorderColor, setMobileHeaderBorderColor] = useState(initialSettings.MOBILE_HEADER_BORDER_COLOR || '#d1d5db');

  // All Categories Button Settings
  const [allCategoriesBgColor, setAllCategoriesBgColor] = useState(initialSettings.ALL_CATEGORIES_BG_COLOR || '#111827');
  const [allCategoriesTextColor, setAllCategoriesTextColor] = useState(initialSettings.ALL_CATEGORIES_TEXT_COLOR || '#ffffff');

  // Search Bar (Ajax) settings
  const [searchBorderColor, setSearchBorderColor] = useState(initialSettings.SEARCH_BORDER_COLOR || '#d1d5db');
  const [searchPlaceholder, setSearchPlaceholder] = useState(initialSettings.SEARCH_PLACEHOLDER || 'Search for a product...');
  const [searchBtnText, setSearchBtnText] = useState(initialSettings.SEARCH_BTN_TEXT || 'Search');
  const [searchBtnBgColor, setSearchBtnBgColor] = useState(initialSettings.SEARCH_BTN_BG_COLOR || '#f97316');
  const [searchBtnTextColor, setSearchBtnTextColor] = useState(initialSettings.SEARCH_BTN_TEXT_COLOR || '#111827');

  // Tax settings
  const [taxIncludedInPrice, setTaxIncludedInPrice] = useState(initialSettings.TAX_INCLUDED_IN_PRICE === 'true');
  const [defaultVatRate, setDefaultVatRate] = useState(initialSettings.DEFAULT_VAT_RATE || '20');
  const [enableEuVat, setEnableEuVat] = useState(initialSettings.ENABLE_EU_VAT === 'true');

  // Footer settings
  const [footerBgColor, setFooterBgColor] = useState(initialSettings.FOOTER_BG_COLOR || '#0B162C');
  const [footerTextColor, setFooterTextColor] = useState(initialSettings.FOOTER_TEXT_COLOR || '#d1d5db');
  const [footerAddress1, setFooterAddress1] = useState(initialSettings.FOOTER_ADDRESS_1 || '2972 Westheimer Rd. Illinois 85486');
  const [footerAddress2, setFooterAddress2] = useState(initialSettings.FOOTER_ADDRESS_2 || '17 Princess Road, London, Greater London NW1 8JR, UK');
  const [footerLocationsTitle, setFooterLocationsTitle] = useState(initialSettings.FOOTER_LOCATIONS_TITLE || 'Our Locations');
  
  const [footerNewsletterTitle, setFooterNewsletterTitle] = useState(initialSettings.FOOTER_NEWSLETTER_TITLE || 'Newsletter');
  const [footerNewsletterText, setFooterNewsletterText] = useState(initialSettings.FOOTER_NEWSLETTER_TEXT || 'Get 15% off your first purchase! Plus, be the first to know about sales new product launches and exclusive offers!');
  const [footerNewsletterPlaceholder, setFooterNewsletterPlaceholder] = useState(initialSettings.FOOTER_NEWSLETTER_PLACEHOLDER || 'Enter your email...');
  
  const [footerCallUsText, setFooterCallUsText] = useState(initialSettings.FOOTER_CALL_US_TEXT || 'Call Us Now');
  const [footerCopyright, setFooterCopyright] = useState(initialSettings.FOOTER_COPYRIGHT || '© 2026 My Store. All rights reserved.');
  
  const [footerSocialFacebook, setFooterSocialFacebook] = useState(initialSettings.FOOTER_SOCIAL_FACEBOOK || '#');
  const [footerSocialTwitter, setFooterSocialTwitter] = useState(initialSettings.FOOTER_SOCIAL_TWITTER || '#');
  const [footerSocialInstagram, setFooterSocialInstagram] = useState(initialSettings.FOOTER_SOCIAL_INSTAGRAM || '#');
  const [footerSocialLinkedin, setFooterSocialLinkedin] = useState(initialSettings.FOOTER_SOCIAL_LINKEDIN || '#');
  
  const defaultColumns = [
    { title: 'Contact Us', links: [{ label: 'About Us', url: '#' }, { label: 'Contact Us', url: '#' }] },
    { title: 'Account', links: [{ label: 'Shop', url: '#' }, { label: 'Checkout', url: '#' }] }
  ];
  const [footerColumns, setFooterColumns] = useState<Array<{title: string, links: Array<{label: string, url: string}>}>>(() => {
    try {
      return initialSettings.FOOTER_COLUMNS ? JSON.parse(initialSettings.FOOTER_COLUMNS) : defaultColumns;
    } catch {
      return defaultColumns;
    }
  });

  // 404 Page settings
  const [notFoundTitle, setNotFoundTitle] = useState(initialSettings.NOT_FOUND_TITLE || 'Oops! This page could not be found.');
  const [notFoundText, setNotFoundText] = useState(initialSettings.NOT_FOUND_TEXT || 'It seems we cannot find the page you are looking for. It may have been moved or deleted.');
  const [notFoundCta, setNotFoundCta] = useState(initialSettings.NOT_FOUND_CTA || 'Back to Home');
  const [notFoundBgColor, setNotFoundBgColor] = useState(initialSettings.NOT_FOUND_BG_COLOR || '#000000');
  const [notFoundBgImage, setNotFoundBgImage] = useState(initialSettings.NOT_FOUND_BG_IMAGE || '');
  const [notFoundFile, setNotFoundFile] = useState<File | null>(null);

  // Maintenance Page Settings
  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings.MAINTENANCE_MODE === 'true');
  const [maintenanceTitle, setMaintenanceTitle] = useState(initialSettings.MAINTENANCE_TITLE || 'Site under maintenance');
  const [maintenanceMessage, setMaintenanceMessage] = useState(initialSettings.MAINTENANCE_MESSAGE || 'We are currently updating our store. Come back very soon!');
  const [maintenanceImage, setMaintenanceImage] = useState(initialSettings.MAINTENANCE_IMAGE || '');
  const [maintenanceFile, setMaintenanceFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    const settingsMap: Record<string, string> = {};
    
    const selectedCurr = CURRENCIES.find(c => c.code === currency);
    if (selectedCurr) {
      settingsMap['currency'] = selectedCurr.code;
      settingsMap['currencySymbol'] = selectedCurr.symbol;
    }
    
    settingsMap['currencyPosition'] = currencyPosition;
    settingsMap['thousandSeparator'] = thousandSeparator;
    settingsMap['decimalSeparator'] = decimalSeparator;
    
    settingsMap['active_language'] = activeLanguage;
    settingsMap['translation_scope'] = translationScope;

    settingsMap['ENABLE_BUY_NOW_BUTTON'] = enableBuyNow.toString();
    
    let finalChatIcon = chatStoreIcon;
    if (chatIconFile) {
      const formData = new FormData();
      formData.append('file', chatIconFile);
      const url = await uploadImage(formData);
      if (url) finalChatIcon = url;
    }
    settingsMap['CHAT_STORE_ICON'] = finalChatIcon;

    let finalLogoImage = headerLogoImage;
    if (logoFile) {
      const formData = new FormData();
      formData.append('file', logoFile);
      const url = await uploadImage(formData);
      if (url) finalLogoImage = url;
    }
    settingsMap['HEADER_LOGO_IMAGE'] = finalLogoImage;
    
    settingsMap['CHAT_ENABLED'] = chatEnabled.toString();
    settingsMap['CHAT_STORE_NAME'] = chatStoreName;
    
    settingsMap['THEME_COLOR'] = themeColor;
    settingsMap['SHOP_CARD_STYLE'] = shopCardStyle;
    settingsMap['SHOP_CARD_BORDER_COLOR'] = shopCardBorderColor;
    settingsMap['HEADER_ANNOUNCEMENT'] = headerAnnouncement;
    settingsMap['HEADER_SUPPORT_PHONE'] = headerSupportPhone;
    settingsMap['HEADER_SUPPORT_EMAIL'] = headerSupportEmail;
    settingsMap['HEADER_MENU_LINKS'] = JSON.stringify(menuLinks);

    settingsMap['MOBILE_ABOUT_TITLE'] = mobileAboutTitle;
    settingsMap['MOBILE_ABOUT_DESC'] = mobileAboutDesc;
    settingsMap['MOBILE_MENU_LINKS'] = JSON.stringify(mobileMenuLinks);
    settingsMap['MOBILE_CONTACT_ADDRESS'] = mobileContactAddress;
    settingsMap['MOBILE_CONTACT_PHONE'] = mobileContactPhone;
    settingsMap['MOBILE_CONTACT_EMAIL'] = mobileContactEmail;
    settingsMap['MOBILE_CONTACT_WEBSITE'] = mobileContactWebsite;
    settingsMap['MOBILE_HEADER_BORDER_COLOR'] = mobileHeaderBorderColor;

    settingsMap['ALL_CATEGORIES_BG_COLOR'] = allCategoriesBgColor;
    settingsMap['ALL_CATEGORIES_TEXT_COLOR'] = allCategoriesTextColor;

    settingsMap['TOP_BAR_BG_COLOR'] = topBarBgColor;
    settingsMap['TOP_BAR_TEXT_COLOR'] = topBarTextColor;
    settingsMap['TOP_BAR_LINKS'] = JSON.stringify(topBarLinks);

    settingsMap['SEARCH_BORDER_COLOR'] = searchBorderColor;
    settingsMap['SEARCH_PLACEHOLDER'] = searchPlaceholder;
    settingsMap['SEARCH_BTN_TEXT'] = searchBtnText;
    settingsMap['SEARCH_BTN_BG_COLOR'] = searchBtnBgColor;
    settingsMap['SEARCH_BTN_TEXT_COLOR'] = searchBtnTextColor;
    
    settingsMap['TAX_INCLUDED_IN_PRICE'] = taxIncludedInPrice.toString();
    settingsMap['DEFAULT_VAT_RATE'] = defaultVatRate;
    settingsMap['ENABLE_EU_VAT'] = enableEuVat.toString();

    settingsMap['CONTACT_RECEIVER_EMAIL'] = contactReceiverEmail;
    settingsMap['NEWSLETTER_SUCCESS_MESSAGE'] = newsletterSuccessMessage;

    settingsMap['SMTP_HOST'] = smtpHost;
    settingsMap['SMTP_PORT'] = smtpPort;
    settingsMap['SMTP_USER'] = smtpUser;
    settingsMap['SMTP_PASS'] = smtpPass;
    settingsMap['SMTP_FROM'] = smtpFrom;
    
    settingsMap['ENABLE_STRIPE'] = enableStripe.toString();
    settingsMap['ENABLE_PAYPAL'] = enablePaypal.toString();
    settingsMap['ENABLE_BANK_TRANSFER'] = enableBankTransfer.toString();
    
    settingsMap['STRIPE_PUBLIC_KEY'] = stripePublicKey;
    settingsMap['STRIPE_SECRET_KEY'] = stripeSecretKey;
    settingsMap['PAYPAL_CLIENT_ID'] = paypalClientId;
    settingsMap['PAYPAL_SECRET'] = paypalSecret;
    settingsMap['BANK_TRANSFER_IBAN'] = bankTransferIban;
    settingsMap['BANK_TRANSFER_BIC'] = bankTransferBic;
    settingsMap['BANK_TRANSFER_ACCOUNT_HOLDER'] = bankTransferAccountHolder;
    settingsMap['BANK_TRANSFER_BANK_NAME'] = bankTransferBankName;
    settingsMap['BANK_TRANSFER_CHECKOUT_MESSAGE'] = bankTransferCheckoutMessage;
    settingsMap['BANK_TRANSFER_INSTRUCTIONS'] = bankTransferInstructions;
    
    settingsMap['FOOTER_BG_COLOR'] = footerBgColor;
    settingsMap['FOOTER_TEXT_COLOR'] = footerTextColor;
    settingsMap['FOOTER_ADDRESS_1'] = footerAddress1;
    settingsMap['FOOTER_ADDRESS_2'] = footerAddress2;
    settingsMap['FOOTER_LOCATIONS_TITLE'] = footerLocationsTitle;
    settingsMap['FOOTER_NEWSLETTER_TITLE'] = footerNewsletterTitle;
    settingsMap['FOOTER_NEWSLETTER_TEXT'] = footerNewsletterText;
    settingsMap['FOOTER_NEWSLETTER_PLACEHOLDER'] = footerNewsletterPlaceholder;
    settingsMap['FOOTER_CALL_US_TEXT'] = footerCallUsText;
    settingsMap['FOOTER_COPYRIGHT'] = footerCopyright;
    settingsMap['FOOTER_SOCIAL_FACEBOOK'] = footerSocialFacebook;
    settingsMap['FOOTER_SOCIAL_TWITTER'] = footerSocialTwitter;
    settingsMap['FOOTER_SOCIAL_INSTAGRAM'] = footerSocialInstagram;
    settingsMap['FOOTER_SOCIAL_LINKEDIN'] = footerSocialLinkedin;
    settingsMap['FOOTER_COLUMNS'] = JSON.stringify(footerColumns);
    
    settingsMap['NOT_FOUND_TITLE'] = notFoundTitle;
    settingsMap['NOT_FOUND_TEXT'] = notFoundText;
    settingsMap['NOT_FOUND_CTA'] = notFoundCta;
    settingsMap['NOT_FOUND_BG_COLOR'] = notFoundBgColor;
    
    let finalNotFoundBgImage = notFoundBgImage;
    if (notFoundFile) {
      const formData = new FormData();
      formData.append('file', notFoundFile);
      const url = await uploadImage(formData);
      if (url) finalNotFoundBgImage = url;
    }
    settingsMap['NOT_FOUND_BG_IMAGE'] = finalNotFoundBgImage;

    let finalMaintenanceImage = maintenanceImage;
    if (maintenanceFile) {
      const formData = new FormData();
      formData.append('file', maintenanceFile);
      const url = await uploadImage(formData);
      if (url) finalMaintenanceImage = url;
    }
    settingsMap['MAINTENANCE_MODE'] = maintenanceMode.toString();
    settingsMap['MAINTENANCE_TITLE'] = maintenanceTitle;
    settingsMap['MAINTENANCE_MESSAGE'] = maintenanceMessage;
    settingsMap['MAINTENANCE_IMAGE'] = finalMaintenanceImage;

    await updateSettingsBatch(settingsMap);

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };


  const SectionSaveButton = () => (
    <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-orange-300 text-sm font-semibold"
      >
        {isLoading ? tSettings('saving') : tSettings('save_section')}
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          {message}
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('languages_translation')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Active Language (Site)</label>
            <select
              value={activeLanguage}
              onChange={(e) => setActiveLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="en">English</option>
              <option value="fr">French (Français)</option>
              <option value="es">Spanish (Español)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Translation scope</label>
            <select
              value={translationScope}
              onChange={(e) => setTranslationScope(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="frontend_only">Option 1: Client side only (Admin stays in English)</option>
              <option value="admin_only">Option 2: Admin only (Client stays in English)</option>
              <option value="all">Option 3: Everything is translated</option>
            </select>
          </div>
        </div>

        <h3 className="text-lg font-bold text-red-600 mb-4 mt-8">{t("regional_settings")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("main_currency")}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">This is the default currency used to display prices.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("symbol_position")}</label>
            <select
              value={currencyPosition}
              onChange={(e) => setCurrencyPosition(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="left">Left (ex: $10)</option>
              <option value="right">{t("right_ex")}</option>
              <option value="left-space">{t("left_space_ex")}</option>
              <option value="right-space">{t("right_space_ex")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thousands separator</label>
            <select
              value={thousandSeparator}
              onChange={(e) => setThousandSeparator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">{t("none_ex")}</option>
              <option value=",">{t("comma_ex")}</option>
              <option value=".">{t("dot_ex_thousand")}</option>
              <option value=" ">{t("space_ex")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Decimal separator</label>
            <select
              value={decimalSeparator}
              onChange={(e) => setDecimalSeparator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value=".">{t("dot_ex_decimal")}</option>
              <option value=",">{t("comma_ex_decimal")}</option>
            </select>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('taxes_vat')}</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="taxIncludedInPrice"
              checked={taxIncludedInPrice}
              onChange={(e) => setTaxIncludedInPrice(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="taxIncludedInPrice" className="text-sm font-medium text-gray-700 cursor-pointer">
              Catalog prices include all taxes (VAT-inclusive)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableEuVat"
              checked={enableEuVat}
              onChange={(e) => setEnableEuVat(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="enableEuVat" className="text-sm font-medium text-gray-700 cursor-pointer">
              Apply dynamic VAT based on EU country (coming soon at Checkout)
            </label>
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Default VAT rate (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={defaultVatRate}
              onChange={(e) => setDefaultVatRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: 20"
            />
            <p className="mt-2 text-xs text-gray-500">Rate applied if dynamic VAT is disabled or client country is unknown.</p>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('store_features')}</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableBuyNow"
              checked={enableBuyNow}
              onChange={(e) => setEnableBuyNow(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="enableBuyNow" className="text-sm font-medium text-gray-700 cursor-pointer">
              Enable the "Buy Now" button (Quick purchase) on product pages
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receiving Email (Contact & Newsletter)</label>
              <input
                type="email"
                value={contactReceiverEmail}
                onChange={(e) => setContactReceiverEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="admin@mystore.com"
              />
              <p className="mt-2 text-xs text-gray-500">The e-mail address that will receive contact form messages and registration notifications.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Success Message (Newsletter)</label>
              <textarea
                value={newsletterSuccessMessage}
                onChange={(e) => setNewsletterSuccessMessage(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Thank you for subscribing!"
              />
              <p className="mt-2 text-xs text-gray-500">Message displayed to the user after a successful subscription.</p>
            </div>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('email_server')}</h3>
        <p className="text-sm text-gray-500 mb-4">Configure these settings so the store can automatically send emails (Order confirmation, Shipping, Cancellation).</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host (ex: smtp.gmail.com)</label>
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port (ex: 587 or 465)</label>
            <input
              type="text"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="587"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username (Login Email)</label>
            <input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="your-email@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password (App Password)</label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="••••••••"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sender Email (From: ...)</label>
            <input
              type="text"
              value={smtpFrom}
              onChange={(e) => setSmtpFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="My Store <contact@mystore.com>"
            />
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('payments')}</h3>
        <p className="text-sm text-gray-500 mb-4">Check "Enable this mode" to make the payment method visible at checkout.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="md:col-span-2 flex items-center justify-between border-b pb-2 mb-4">
            <h4 className="text-md font-bold text-gray-900">Stripe Configuration (Credit Cards)</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enableStripe} onChange={(e) => setEnableStripe(e.target.checked)} className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded" />
              <span className="text-sm font-medium text-gray-700">Enable this mode</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Public Key (Publishable Key)</label>
            <input
              type="text"
              value={stripePublicKey}
              onChange={(e) => setStripePublicKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="pk_test_..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
            <input
              type="password"
              value={stripeSecretKey}
              onChange={(e) => setStripeSecretKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="sk_test_..."
            />
          </div>

          <div className="md:col-span-2 mt-4 flex items-center justify-between border-b pb-2 mb-4">
            <h4 className="text-md font-bold text-gray-900">PayPal Configuration</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enablePaypal} onChange={(e) => setEnablePaypal(e.target.checked)} className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded" />
              <span className="text-sm font-medium text-gray-700">Enable this mode</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Client ID</label>
            <input
              type="text"
              value={paypalClientId}
              onChange={(e) => setPaypalClientId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="ASdfas..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Secret</label>
            <input
              type="password"
              value={paypalSecret}
              onChange={(e) => setPaypalSecret(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="EAsdf..."
            />
          </div>

          <div className="md:col-span-2 mt-4 flex items-center justify-between border-b pb-2 mb-4">
            <h4 className="text-md font-bold text-gray-900">Bank Transfer Configuration</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enableBankTransfer} onChange={(e) => setEnableBankTransfer(e.target.checked)} className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded" />
              <span className="text-sm font-medium text-gray-700">Enable this mode</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
            <input
              type="text"
              value={bankTransferIban}
              onChange={(e) => setBankTransferIban(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="FR76 1234..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BIC / SWIFT</label>
            <input 
              type="text" 
              value={bankTransferBic}
              onChange={(e) => setBankTransferBic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: EXAMPLFR123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder</label>
            <input
              type="text"
              value={bankTransferAccountHolder}
              onChange={(e) => setBankTransferAccountHolder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Company or person name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
            <input
              type="text"
              value={bankTransferBankName}
              onChange={(e) => setBankTransferBankName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: BNP Paribas"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message to display at checkout</label>
            <textarea
              value={bankTransferCheckoutMessage}
              onChange={(e) => setBankTransferCheckoutMessage(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Please make the transfer to the account below."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions (sent to the client)</label>
            <textarea
              value={bankTransferInstructions}
              onChange={(e) => setBankTransferInstructions(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Your order will be processed upon payment receipt..."
            />
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('design_header')}</h3>
        
        {/* Product Card Settings */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-md font-bold text-gray-900 mb-4">Product Cards (Shop & Category pages)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Style</label>
              <select
                value={shopCardStyle}
                onChange={(e) => setShopCardStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="design1">Design 1 (Hover actions in center)</option>
                <option value="design2">Design 2 (Cart button at bottom, Hover top-right)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Border Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={shopCardBorderColor}
                  onChange={(e) => setShopCardBorderColor(e.target.value)}
                  className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={shopCardBorderColor}
                  onChange={(e) => setShopCardBorderColor(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 flex-1"
                  placeholder="#e5e7eb"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Store Color (Theme)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="#f97316"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Top Banner Message</label>
            <input
              type="text"
              value={headerAnnouncement}
              onChange={(e) => setHeaderAnnouncement(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo (Upload)</label>
            <p className="text-xs text-gray-500 mb-2">Recommended size: 150x50 pixels (transparent PNG).</p>
            {headerLogoImage && !logoFile && (
              <div className="flex items-center gap-4 mb-3">
                <div className="relative inline-block">
                  <img src={headerLogoImage} alt="Logo" className="h-10 object-contain border bg-gray-50 p-1" />
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setHeaderLogoImage('');
                    setLogoFile(null);
                  }}
                  className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                >
                  Delete le logo
                </button>
              </div>
            )}
            
            {logoFile && (
              <div className="flex items-center gap-3 mb-3 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700">
                <span>New fichier : <strong>{logoFile.name}</strong></span>
                <button 
                  type="button"
                  onClick={() => {
                    setLogoFile(null);
                    // Reset the file input visually
                    const fileInput = document.getElementById('logo-upload-input') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  className="text-red-500 hover:text-red-700 underline text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}

            <input
              id="logo-upload-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setLogoFile(e.target.files[0]);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone (Header)</label>
            <input
              type="text"
              value={headerSupportPhone}
              onChange={(e) => setHeaderSupportPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email (Header)</label>
            <input
              type="email"
              value={headerSupportEmail}
              onChange={(e) => setHeaderSupportEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Search Bar (Ajax)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Border color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={searchBorderColor} onChange={e => setSearchBorderColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={searchBorderColor} onChange={e => setSearchBorderColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input text (Placeholder)</label>
            <input type="text" value={searchPlaceholder} onChange={e => setSearchPlaceholder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button text</label>
            <input type="text" value={searchBtnText} onChange={e => setSearchBtnText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button background color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={searchBtnBgColor} onChange={e => setSearchBtnBgColor(e.target.value)} className="h-10 w-12 p-1 border border-gray-300 rounded-md cursor-pointer" />
                <input type="text" value={searchBtnBgColor} onChange={e => setSearchBtnBgColor(e.target.value)} className="px-2 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text color (button)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={searchBtnTextColor} onChange={e => setSearchBtnTextColor(e.target.value)} className="h-10 w-12 p-1 border border-gray-300 rounded-md cursor-pointer" />
                <input type="text" value={searchBtnTextColor} onChange={e => setSearchBtnTextColor(e.target.value)} className="px-2 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full text-sm" />
              </div>
            </div>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Navigation Links (Menu)</h3>
        <div className="space-y-4">
          {menuLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Link name</label>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const newLinks = [...menuLinks];
                    newLinks[idx].label = e.target.value;
                    setMenuLinks(newLinks);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">URL / Link</label>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...menuLinks];
                    newLinks[idx].url = e.target.value;
                    setMenuLinks(newLinks);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => {
                    const newLinks = [...menuLinks];
                    newLinks.splice(idx, 1);
                    setMenuLinks(newLinks);
                  }}
                  className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md transition"
                  title="Delete this link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMenuLinks([...menuLinks, { label: 'New Lien', url: '/' }])}
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add a link
          </button>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Mobile Navigation (Hamburger)</h3>
        <p className="text-sm text-gray-500 mb-4">Configure the side menu (Drawer) that opens on mobile.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-800 mb-2">"About" Section</h4>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" value={mobileAboutTitle} onChange={e => setMobileAboutTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea value={mobileAboutDesc} onChange={e => setMobileAboutDesc(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-gray-800">Mobile menu links</h4>
          {mobileMenuLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Link name</label>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const newLinks = [...mobileMenuLinks];
                    newLinks[idx].label = e.target.value;
                    setMobileMenuLinks(newLinks);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">URL / Link</label>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...mobileMenuLinks];
                    newLinks[idx].url = e.target.value;
                    setMobileMenuLinks(newLinks);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500"
                />
              </div>
              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => {
                    const newLinks = [...mobileMenuLinks];
                    newLinks.splice(idx, 1);
                    setMobileMenuLinks(newLinks);
                  }}
                  className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md transition"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMobileMenuLinks([...mobileMenuLinks, { label: 'New Lien', url: '/' }])}
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add a mobile link
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-800 mb-2">Contact Section</h4>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input type="text" value={mobileContactAddress} onChange={e => setMobileContactAddress(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input type="text" value={mobileContactPhone} onChange={e => setMobileContactPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="text" value={mobileContactEmail} onChange={e => setMobileContactEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Website (without https://)</label>
            <input type="text" value={mobileContactWebsite} onChange={e => setMobileContactWebsite(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" placeholder="www.votresite.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6 mb-6">
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-800 mb-2">Design</h4>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Border color (Mobile Header)</label>
            <div className="flex items-center gap-3">
              <input type="color" value={mobileHeaderBorderColor} onChange={e => setMobileHeaderBorderColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={mobileHeaderBorderColor} onChange={e => setMobileHeaderBorderColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
        </div>

        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">All Categories Button</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={allCategoriesBgColor} onChange={e => setAllCategoriesBgColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={allCategoriesBgColor} onChange={e => setAllCategoriesBgColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={allCategoriesTextColor} onChange={e => setAllCategoriesTextColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={allCategoriesTextColor} onChange={e => setAllCategoriesTextColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Top Bar Links and Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background color (Top Bar)</label>
            <div className="flex items-center gap-3">
              <input type="color" value={topBarBgColor} onChange={e => setTopBarBgColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={topBarBgColor} onChange={e => setTopBarBgColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text color (Top Bar)</label>
            <div className="flex items-center gap-3">
              <input type="color" value={topBarTextColor} onChange={e => setTopBarTextColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={topBarTextColor} onChange={e => setTopBarTextColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {topBarLinks.map((link, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                <select
                  value={link.icon}
                  onChange={(e) => {
                    const newLinks = [...topBarLinks];
                    newLinks[idx].icon = e.target.value;
                    setTopBarLinks(newLinks);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="location">Location</option>
                  <option value="truck">Delivery truck</option>
                  <option value="phone">Phone</option>
                  <option value="star">Star</option>
                  <option value="mail">Email</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Text</label>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const newLinks = [...topBarLinks];
                    newLinks[idx].label = e.target.value;
                    setTopBarLinks(newLinks);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">URL / Link</label>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...topBarLinks];
                    newLinks[idx].url = e.target.value;
                    setTopBarLinks(newLinks);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => {
                    const newLinks = [...topBarLinks];
                    newLinks.splice(idx, 1);
                    setTopBarLinks(newLinks);
                  }}
                  className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md transition"
                  title="Delete this link"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setTopBarLinks([...topBarLinks, { label: 'New Lien', icon: 'star', url: '#' }])}
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add a Top Bar link
          </button>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Chat Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="chatEnabled"
              checked={chatEnabled}
              onChange={(e) => setChatEnabled(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="chatEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
              Enable Chat module for customers
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Name (Chat)</label>
              <input
                type="text"
                value={chatStoreName}
                onChange={(e) => setChatStoreName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: Support Shopelios"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chat Icon (Upload)</label>
              <p className="text-xs text-gray-500 mb-2">Recommended size: 64x64 pixels (Square).</p>
              {chatStoreIcon && !chatIconFile && (
                <div className="relative inline-block mb-2">
                  <img src={chatStoreIcon} alt="Chat Icon" className="h-10 w-10 object-cover rounded-full border" />
                  <button 
                    type="button" 
                    onClick={() => setChatStoreIcon('')}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setChatIconFile(e.target.files[0]);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Footer</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2 grid grid-cols-2 gap-6 pb-4 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Footer Background Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
                <input type="text" value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-32" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Text Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
                <input type="text" value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-32" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address 1 (Store 1)</label>
            <input type="text" value={footerAddress1} onChange={e => setFooterAddress1(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address 2 (Store 2 - Optional)</label>
            <input type="text" value={footerAddress2} onChange={e => setFooterAddress2(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter Text</label>
            <textarea value={footerNewsletterText} onChange={e => setFooterNewsletterText(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h4 className="text-md font-medium text-gray-800 mb-4">Interface Texts (Titles and Labels)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Addresses Title (ex: Our Locations)</label>
                <input type="text" value={footerLocationsTitle} onChange={e => setFooterLocationsTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter Title (ex: Newsletter)</label>
                <input type="text" value={footerNewsletterTitle} onChange={e => setFooterNewsletterTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Placeholder Text (ex: Enter your email...)</label>
                <input type="text" value={footerNewsletterPlaceholder} onChange={e => setFooterNewsletterPlaceholder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">&quot;Call us&quot; Text (ex: Call Us Now)</label>
                <input type="text" value={footerCallUsText} onChange={e => setFooterCallUsText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Text (ex: © 2026 Shopelios)</label>
            <input type="text" value={footerCopyright} onChange={e => setFooterCopyright(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
        </div>

        <h4 className="text-md font-medium text-gray-800 mb-3">Social Networks (URL)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
            <input type="text" value={footerSocialFacebook} onChange={e => setFooterSocialFacebook(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter (X)</label>
            <input type="text" value={footerSocialTwitter} onChange={e => setFooterSocialTwitter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
            <input type="text" value={footerSocialInstagram} onChange={e => setFooterSocialInstagram(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input type="text" value={footerSocialLinkedin} onChange={e => setFooterSocialLinkedin(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
        </div>

        <h4 className="text-md font-medium text-gray-800 mb-3">Footer Link Columns</h4>
        <div className="space-y-6">
          {footerColumns.map((col, cIdx) => (
            <div key={cIdx} className="bg-gray-50 p-4 border rounded-md">
              <div className="flex justify-between items-center mb-4">
                <input 
                  type="text" 
                  value={col.title}
                  onChange={e => {
                    const newCols = [...footerColumns];
                    newCols[cIdx].title = e.target.value;
                    setFooterColumns(newCols);
                  }}
                  className="font-bold px-3 py-1.5 border border-gray-300 rounded focus:ring-orange-500 w-1/2"
                  placeholder="Column Title (ex: Contact Us)"
                />
                <button 
                  type="button" 
                  onClick={() => {
                    const newCols = [...footerColumns];
                    newCols.splice(cIdx, 1);
                    setFooterColumns(newCols);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete column
                </button>
              </div>
              
              <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                {col.links.map((link, lIdx) => (
                  <div key={lIdx} className="flex gap-2 items-center">
                    <input type="text" value={link.label} placeholder="Link name" onChange={e => {
                      const newCols = [...footerColumns];
                      newCols[cIdx].links[lIdx].label = e.target.value;
                      setFooterColumns(newCols);
                    }} className="text-sm px-2 py-1 border rounded w-1/3" />
                    <input type="text" value={link.url} placeholder="URL" onChange={e => {
                      const newCols = [...footerColumns];
                      newCols[cIdx].links[lIdx].url = e.target.value;
                      setFooterColumns(newCols);
                    }} className="text-sm px-2 py-1 border rounded w-1/3" />
                    <button type="button" onClick={() => {
                      const newCols = [...footerColumns];
                      newCols[cIdx].links.splice(lIdx, 1);
                      setFooterColumns(newCols);
                    }} className="text-red-500">&times;</button>
                  </div>
                ))}
                <button type="button" onClick={() => {
                  const newCols = [...footerColumns];
                  newCols[cIdx].links.push({ label: 'New lien', url: '#' });
                  setFooterColumns(newCols);
                }} className="text-orange-600 text-xs mt-2">+ Add a link</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => {
            setFooterColumns([...footerColumns, { title: 'Nouvelle Colonne', links: [] }]);
          }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm transition">
            + Add a column
          </button>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Maintenance Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50 p-6 rounded-lg border border-orange-100 mb-6">
          <div className="md:col-span-2 flex items-center mb-2">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="maintenanceMode" className="ml-3 text-base font-bold text-orange-900 cursor-pointer">
              Enable maintenance mode (Blocks public access to the site)
            </label>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
            <input type="text" value={maintenanceTitle} onChange={e => setMaintenanceTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Explanation Message</label>
            <textarea value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Illustration Image (Upload)</label>
            {maintenanceImage && !maintenanceFile && (
              <div className="relative inline-block mb-2">
                <img src={maintenanceImage} alt="Maintenance" className="h-20 object-contain border bg-white p-1" />
                <button 
                  type="button" 
                  onClick={() => setMaintenanceImage('')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setMaintenanceFile(e.target.files[0]);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">404 Page (Not Found)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
            <input type="text" value={notFoundTitle} onChange={e => setNotFoundTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Explanation Text</label>
            <textarea value={notFoundText} onChange={e => setNotFoundText(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Return button text (CTA)</label>
            <input type="text" value={notFoundCta} onChange={e => setNotFoundCta(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background color (If no image)</label>
            <div className="flex items-center gap-3">
              <input type="color" value={notFoundBgColor} onChange={e => setNotFoundBgColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={notFoundBgColor} onChange={e => setNotFoundBgColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-32" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Background image (Upload)</label>
            {notFoundBgImage && !notFoundFile && (
              <div className="relative inline-block mb-2">
                <img src={notFoundBgImage} alt="404 BG" className="h-20 object-cover border bg-gray-50 p-1" />
                <button 
                  type="button" 
                  onClick={() => setNotFoundBgImage('')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setNotFoundFile(e.target.files[0]);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      <SectionSaveButton />
    </form>
  );
}
