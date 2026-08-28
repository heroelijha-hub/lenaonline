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

  // Shipping Info settings
  const [shippingInfo1, setShippingInfo1] = useState(initialSettings.SHIPPING_INFO_1 || '3-5 business days in Germany');
  const [shippingInfo2, setShippingInfo2] = useState(initialSettings.SHIPPING_INFO_2 || '5-10 business days in the Eurozone');
  const [shippingInfo3, setShippingInfo3] = useState(initialSettings.SHIPPING_INFO_3 || 'Free shipping: Orders over €200.00');
  const [shippingInfo4, setShippingInfo4] = useState(initialSettings.SHIPPING_INFO_4 || 'Free returns: within 30 days');

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
  const [faviconImage, setFaviconImage] = useState(initialSettings.FAVICON_IMAGE || '');
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
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
  const [mobileContact{tSettings('contact_website')}, setMobileContact{tSettings('contact_website')}] = useState(initialSettings.MOBILE_CONTACT_WEBSITE || 'www.mystore.com');
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

  // {tSettings('maintenance_page')} Settings
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

    let finalFaviconImage = faviconImage;
    if (faviconFile) {
      const formData = new FormData();
      formData.append('file', faviconFile);
      const url = await uploadImage(formData);
      if (url) finalFaviconImage = url;
    }
    settingsMap['FAVICON_IMAGE'] = finalFaviconImage;
    
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
    settingsMap['MOBILE_CONTACT_WEBSITE'] = mobileContact{tSettings('contact_website')};
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

    settingsMap['SHIPPING_INFO_1'] = shippingInfo1;
    settingsMap['SHIPPING_INFO_2'] = shippingInfo2;
    settingsMap['SHIPPING_INFO_3'] = shippingInfo3;
    settingsMap['SHIPPING_INFO_4'] = shippingInfo4;

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
    settingsMap['MAINTENANCE_IMAGE'] = finalMaintenanceImage;
    settingsMap['MAINTENANCE_MODE'] = maintenanceMode.toString();
    settingsMap['MAINTENANCE_TITLE'] = maintenanceTitle;
    settingsMap['MAINTENANCE_MESSAGE'] = maintenanceMessage;

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
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('active_language_site')}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('translation_scope_label')}</label>
            <select
              value={translationScope}
              onChange={(e) => setTranslationScope(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="frontend_only">{tSettings('translation_scope_opt1')}</option>
              <option value="admin_only">{tSettings('translation_scope_opt2')}</option>
              <option value="all">{tSettings('translation_scope_opt3')}</option>
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
            <p className="mt-2 text-xs text-gray-500">{tSettings('default_currency_desc')}</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('thousand_separator')}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('decimal_separator')}</label>
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
              {tSettings('tax_inclusive')}
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
              {tSettings('dynamic_eu_vat')}
            </label>
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('default_vat_rate')}</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={defaultVatRate}
              onChange={(e) => setDefaultVatRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: 20"
            />
            <p className="mt-2 text-xs text-gray-500">{tSettings('default_vat_desc')}</p>
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
              {tSettings('enable_buy_now')}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('receiving_email')}</label>
              <input
                type="email"
                value={contactReceiverEmail}
                onChange={(e) => setContactReceiverEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="admin@mystore.com"
              />
              <p className="mt-2 text-xs text-gray-500">{tSettings('receiving_email_desc')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('newsletter_success_msg')}</label>
              <textarea
                value={newsletterSuccessMessage}
                onChange={(e) => setNewsletterSuccessMessage(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Thank you for subscribing!"
              />
              <p className="mt-2 text-xs text-gray-500">{tSettings('newsletter_success_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <h4 className="text-md font-bold text-gray-900 md:col-span-2">{tSettings('product_shipping_info')}</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('shipping_line_1')}</label>
              <input
                type="text"
                value={shippingInfo1}
                onChange={(e) => setShippingInfo1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('shipping_line_2')}</label>
              <input
                type="text"
                value={shippingInfo2}
                onChange={(e) => setShippingInfo2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('shipping_line_3')}</label>
              <input
                type="text"
                value={shippingInfo3}
                onChange={(e) => setShippingInfo3(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('shipping_line_4')}</label>
              <input
                type="text"
                value={shippingInfo4}
                onChange={(e) => setShippingInfo4(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('email_server')}</h3>
        <p className="text-sm text-gray-500 mb-4">{tSettings('smtp_desc')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('smtp_host')}</label>
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('smtp_port')}</label>
            <input
              type="text"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="587"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('smtp_username')}</label>
            <input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="your-email@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('smtp_password')}</label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="••••••••"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('smtp_sender_email')}</label>
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
        <p className="text-sm text-gray-500 mb-4">{tSettings('payment_enable_desc')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="md:col-span-2 flex items-center justify-between border-b pb-2 mb-4">
            <h4 className="text-md font-bold text-gray-900">{tSettings('stripe_config')}</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enableStripe} onChange={(e) => setEnableStripe(e.target.checked)} className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded" />
              <span className="text-sm font-medium text-gray-700">{tSettings('enable_this_mode')}</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('stripe_public_key')}</label>
            <input
              type="text"
              value={stripePublicKey}
              onChange={(e) => setStripePublicKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="pk_test_..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('stripe_secret_key')}</label>
            <input
              type="password"
              value={stripeSecretKey}
              onChange={(e) => setStripeSecretKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="sk_test_..."
            />
          </div>

          <div className="md:col-span-2 mt-4 flex items-center justify-between border-b pb-2 mb-4">
            <h4 className="text-md font-bold text-gray-900">{tSettings('paypal_config')}</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enablePaypal} onChange={(e) => setEnablePaypal(e.target.checked)} className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded" />
              <span className="text-sm font-medium text-gray-700">{tSettings('enable_this_mode')}</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('paypal_client_id')}</label>
            <input
              type="text"
              value={paypalClientId}
              onChange={(e) => setPaypalClientId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="ASdfas..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('paypal_secret')}</label>
            <input
              type="password"
              value={paypalSecret}
              onChange={(e) => setPaypalSecret(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="EAsdf..."
            />
          </div>

          <div className="md:col-span-2 mt-4 flex items-center justify-between border-b pb-2 mb-4">
            <h4 className="text-md font-bold text-gray-900">{tSettings('bank_transfer_config')}</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={enableBankTransfer} onChange={(e) => setEnableBankTransfer(e.target.checked)} className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded" />
              <span className="text-sm font-medium text-gray-700">{tSettings('enable_this_mode')}</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('iban')}</label>
            <input
              type="text"
              value={bankTransferIban}
              onChange={(e) => setBankTransferIban(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="FR76 1234..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('bic_swift')}</label>
            <input 
              type="text" 
              value={bankTransferBic}
              onChange={(e) => setBankTransferBic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: EXAMPLFR123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('account_holder')}</label>
            <input
              type="text"
              value={bankTransferAccountHolder}
              onChange={(e) => setBankTransferAccountHolder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder=tSettings('bank_account_holder_ph')
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('bank_name')}</label>
            <input
              type="text"
              value={bankTransferBankName}
              onChange={(e) => setBankTransferBankName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder=tSettings('bank_name_ph')
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('checkout_message')}</label>
            <textarea
              value={bankTransferCheckoutMessage}
              onChange={(e) => setBankTransferCheckoutMessage(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Please make the transfer to the account below."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('instructions_client')}</label>
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
          <h4 className="text-md font-bold text-gray-900 mb-4">{tSettings('product_cards_settings')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('card_style')}</label>
              <select
                value={shopCardStyle}
                onChange={(e) => setShopCardStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="design1">{tSettings('card_design_1')}</option>
                <option value="design2">{tSettings('card_design_2')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('card_border_color')}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('main_theme_color')}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('top_banner_message')}</label>
            <input
              type="text"
              value={headerAnnouncement}
              onChange={(e) => setHeaderAnnouncement(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tSettings('header_logo')}
                </label>
                {headerLogoImage && !logoFile && (
                  <div className="mb-4 flex items-center gap-4">
                    <div className="bg-gray-50 p-2 border border-gray-200 rounded">
                      <img src={headerLogoImage} alt="Current Logo" className="h-12 object-contain" />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setHeaderLogoImage('')} 
                      className="text-sm text-red-600 hover:text-red-800 hover:underline font-medium px-2 py-1"
                    >
                      {tSettings('delete_btn')}
                    </button>
                  </div>
                )}
                {logoFile && (
                  <div className="mb-4">
                    <img src={URL.createObjectURL(logoFile)} alt="New Logo Preview" className="h-12 object-contain" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
                <p className="mt-1 text-xs text-gray-500">{tSettings('logo_desc')}</p>
              </div>

              <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tSettings('favicon_label')}
                </label>
                {faviconImage && !faviconFile && (
                  <div className="mb-4 flex items-center gap-4">
                    <div className="bg-gray-50 p-2 border border-gray-200 rounded">
                      <img src={faviconImage} alt="Current Favicon" className="w-8 h-8 object-contain rounded" />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFaviconImage('')} 
                      className="text-sm text-red-600 hover:text-red-800 hover:underline font-medium px-2 py-1"
                    >
                      {tSettings('delete_btn')}
                    </button>
                  </div>
                )}
                {faviconFile && (
                  <div className="mb-4">
                    <img src={URL.createObjectURL(faviconFile)} alt="New Favicon Preview" className="w-8 h-8 object-contain rounded" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFaviconFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
                <p className="mt-1 text-xs text-gray-500">{tSettings('favicon_desc')}</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('support_phone')}</label>
            <input
              type="text"
              value={headerSupportPhone}
              onChange={(e) => setHeaderSupportPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('support_email')}</label>
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
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('search_bar_ajax')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('border_color')}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={searchBorderColor} onChange={e => setSearchBorderColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={searchBorderColor} onChange={e => setSearchBorderColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('input_placeholder')}</label>
            <input type="text" value={searchPlaceholder} onChange={e => setSearchPlaceholder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('button_text')}</label>
            <input type="text" value={searchBtnText} onChange={e => setSearchBtnText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('button_bg_color')}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={searchBtnBgColor} onChange={e => setSearchBtnBgColor(e.target.value)} className="h-10 w-12 p-1 border border-gray-300 rounded-md cursor-pointer" />
                <input type="text" value={searchBtnBgColor} onChange={e => setSearchBtnBgColor(e.target.value)} className="px-2 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('text_color_btn')}</label>
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
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('nav_links_menu')}</h3>
        <div className="space-y-4">
          {menuLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">{tSettings('link_name')}</label>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">{tSettings('url_link')}</label>
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
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('mobile_nav_title')}</h3>
        <p className="text-sm text-gray-500 mb-4">{tSettings('mobile_nav_desc')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-800 mb-2">{tSettings('about_section_title')}</h4>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('page_title')}</label>
            <input type="text" value={mobileAboutTitle} onChange={e => setMobileAboutTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('description_label')}</label>
            <textarea value={mobileAboutDesc} onChange={e => setMobileAboutDesc(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-gray-800">{tSettings('mobile_menu_links_title')}</h4>
          {mobileMenuLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">{tSettings('link_name')}</label>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">{tSettings('url_link')}</label>
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
            {tSettings('add_mobile_link_btn')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-800 mb-2">{tSettings('contact_section_title')}</h4>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('contact_address')}</label>
            <input type="text" value={mobileContactAddress} onChange={e => setMobileContactAddress(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('contact_phone')}</label>
            <input type="text" value={mobileContactPhone} onChange={e => setMobileContactPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('contact_email')}</label>
            <input type="text" value={mobileContactEmail} onChange={e => setMobileContactEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('contact_website')} (without https://)</label>
            <input type="text" value={mobileContact{tSettings('contact_website')}} onChange={e => setMobileContact{tSettings('contact_website')}(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" placeholder="www.votresite.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6 mb-6">
          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-800 mb-2">{tSettings('design_title')}</h4>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('mobile_header_border_color')}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={mobileHeaderBorderColor} onChange={e => setMobileHeaderBorderColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={mobileHeaderBorderColor} onChange={e => setMobileHeaderBorderColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
        </div>

        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('all_categories_btn_title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('bg_color_label')}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={allCategoriesBgColor} onChange={e => setAllCategoriesBgColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={allCategoriesBgColor} onChange={e => setAllCategoriesBgColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('text_color_label')}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={allCategoriesTextColor} onChange={e => setAllCategoriesTextColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={allCategoriesTextColor} onChange={e => setAllCategoriesTextColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('topbar_links_colors')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('topbar_bg_color')}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={topBarBgColor} onChange={e => setTopBarBgColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={topBarBgColor} onChange={e => setTopBarBgColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('topbar_text_color')}</label>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">{tSettings('icon_label')}</label>
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
                  <option value="phone">{tSettings('contact_phone')}</option>
                  <option value="star">Star</option>
                  <option value="mail">{tSettings('contact_email')}</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">{tSettings('text_label')}</label>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">{tSettings('url_link')}</label>
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
            {tSettings('add_topbar_link_btn')}
          </button>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('chat_settings_title')}</h3>
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
              {tSettings('enable_chat_module')}
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('chat_store_name')}</label>
              <input
                type="text"
                value={chatStoreName}
                onChange={(e) => setChatStoreName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: Support Shopelios"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('chat_icon_upload')}</label>
              <p className="text-xs text-gray-500 mb-2">{tSettings('chat_icon_desc')}</p>
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
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('footer_title')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2 grid grid-cols-2 gap-6 pb-4 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Footer {tSettings('bg_color')}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
                <input type="text" value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-32" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main {tSettings('text_color')}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
                <input type="text" value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-32" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('footer_addr1')}</label>
            <input type="text" value={footerAddress1} onChange={e => setFooterAddress1(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('footer_addr2')}</label>
            <input type="text" value={footerAddress2} onChange={e => setFooterAddress2(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('footer_newsletter_text')}</label>
            <textarea value={footerNewsletterText} onChange={e => setFooterNewsletterText(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h4 className="text-md font-medium text-gray-800 mb-4">{tSettings('interface_texts')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('addresses_title_ph')}</label>
                <input type="text" value={footerLocationsTitle} onChange={e => setFooterLocationsTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('footer_newsletter_title')} (ex: Newsletter)</label>
                <input type="text" value={footerNewsletterTitle} onChange={e => setFooterNewsletterTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('email_placeholder_ph')}</label>
                <input type="text" value={footerNewsletterPlaceholder} onChange={e => setFooterNewsletterPlaceholder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">&quot;Call us&quot; Text (ex: Call Us Now)</label>
                <input type="text" value={footerCallUsText} onChange={e => setFooterCallUsText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('footer_copyright')} (ex: © 2026 Shopelios)</label>
            <input type="text" value={footerCopyright} onChange={e => setFooterCopyright(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
        </div>

        <h4 className="text-md font-medium text-gray-800 mb-3">{tSettings('social_networks_title')}</h4>
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

        <h4 className="text-md font-medium text-gray-800 mb-3">{tSettings('footer_link_columns')}</h4>
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
                  placeholder="{tSettings('column_title')} (ex: Contact Us)"
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
                  {tSettings('delete_column_btn')}
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
                }} className="text-orange-600 text-xs mt-2">{tSettings('add_a_link_btn')}</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => {
            setFooterColumns([...footerColumns, { title: 'Nouvelle Colonne', links: [] }]);
          }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm transition">
            {tSettings('add_a_column_btn')}
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
              {tSettings('enable_maintenance_mode')}
            </label>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('page_title_label')}</label>
            <input type="text" value={maintenanceTitle} onChange={e => setMaintenanceTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('explanation_msg_label')}</label>
            <textarea value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('illustration_image_upload')}</label>
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
        <h3 className="text-lg font-bold text-red-600 mb-4">{tSettings('not_found_page')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('page_title_label')}</label>
            <input type="text" value={notFoundTitle} onChange={e => setNotFoundTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('explanation_text_label')}</label>
            <textarea value={notFoundText} onChange={e => setNotFoundText(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('return_btn_text')}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('bg_image_upload')}</label>
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
