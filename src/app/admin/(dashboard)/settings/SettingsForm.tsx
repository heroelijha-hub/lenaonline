'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSetting } from '@/actions/settings';
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
  const router = useRouter();
  const [currency, setCurrency] = useState(initialSettings.currency || 'USD');
  const [currencyPosition, setCurrencyPosition] = useState(initialSettings.currencyPosition || 'left');
  const [thousandSeparator, setThousandSeparator] = useState(initialSettings.thousandSeparator || ',');
  const [decimalSeparator, setDecimalSeparator] = useState(initialSettings.decimalSeparator || '.');
  const [enableBuyNow, setEnableBuyNow] = useState(initialSettings.ENABLE_BUY_NOW_BUTTON === 'true');
  const [chatEnabled, setChatEnabled] = useState(initialSettings.CHAT_ENABLED === 'true');
  const [chatStoreName, setChatStoreName] = useState(initialSettings.CHAT_STORE_NAME || 'Shopelios');
  const [chatStoreIcon, setChatStoreIcon] = useState(initialSettings.CHAT_STORE_ICON || '');
  const [chatIconFile, setChatIconFile] = useState<File | null>(null);

  // Contact & Newsletter settings
  const [contactReceiverEmail, setContactReceiverEmail] = useState(initialSettings.CONTACT_RECEIVER_EMAIL || 'admin@shopelios.com');
  const [newsletterSuccessMessage, setNewsletterSuccessMessage] = useState(initialSettings.NEWSLETTER_SUCCESS_MESSAGE || 'Merci pour votre inscription à notre newsletter !');

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState(initialSettings.SMTP_HOST || '');
  const [smtpPort, setSmtpPort] = useState(initialSettings.SMTP_PORT || '');
  const [smtpUser, setSmtpUser] = useState(initialSettings.SMTP_USER || '');
  const [smtpPass, setSmtpPass] = useState(initialSettings.SMTP_PASS || '');
  const [smtpFrom, setSmtpFrom] = useState(initialSettings.SMTP_FROM || '');

  // Design & Header settings
  const [themeColor, setThemeColor] = useState(initialSettings.THEME_COLOR || '#f97316'); // Default to orange-500
  const [headerAnnouncement, setHeaderAnnouncement] = useState(initialSettings.HEADER_ANNOUNCEMENT || 'Bienvenue sur notre boutique Shopelios !');
  const [headerLogoImage, setHeaderLogoImage] = useState(initialSettings.HEADER_LOGO_IMAGE || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [headerSupportPhone, setHeaderSupportPhone] = useState(initialSettings.HEADER_SUPPORT_PHONE || '+08 9229 8228');
  const [headerSupportEmail, setHeaderSupportEmail] = useState(initialSettings.HEADER_SUPPORT_EMAIL || 'support@shopelios.com');
  
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

  // Search Bar (Ajax) settings
  const [searchBorderColor, setSearchBorderColor] = useState(initialSettings.SEARCH_BORDER_COLOR || '#d1d5db');
  const [searchPlaceholder, setSearchPlaceholder] = useState(initialSettings.SEARCH_PLACEHOLDER || 'Rechercher un produit...');
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
  const [footerCopyright, setFooterCopyright] = useState(initialSettings.FOOTER_COPYRIGHT || '© 2026 Shopelios All rights reserved.');
  
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
  const [notFoundTitle, setNotFoundTitle] = useState(initialSettings.NOT_FOUND_TITLE || 'Oops! Cette page est introuvable.');
  const [notFoundText, setNotFoundText] = useState(initialSettings.NOT_FOUND_TEXT || 'Il semble que nous ne puissions pas trouver la page que vous cherchez. Elle a peut-être été déplacée ou supprimée.');
  const [notFoundCta, setNotFoundCta] = useState(initialSettings.NOT_FOUND_CTA || 'Retour à l\'accueil');
  const [notFoundBgColor, setNotFoundBgColor] = useState(initialSettings.NOT_FOUND_BG_COLOR || '#000000');
  const [notFoundBgImage, setNotFoundBgImage] = useState(initialSettings.NOT_FOUND_BG_IMAGE || '');
  const [notFoundFile, setNotFoundFile] = useState<File | null>(null);

  // Maintenance Page Settings
  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings.MAINTENANCE_MODE === 'true');
  const [maintenanceTitle, setMaintenanceTitle] = useState(initialSettings.MAINTENANCE_TITLE || 'Site en maintenance');
  const [maintenanceMessage, setMaintenanceMessage] = useState(initialSettings.MAINTENANCE_MESSAGE || 'Nous mettons actuellement à jour notre boutique. Revenez très bientôt !');
  const [maintenanceImage, setMaintenanceImage] = useState(initialSettings.MAINTENANCE_IMAGE || '');
  const [maintenanceFile, setMaintenanceFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const selectedCurr = CURRENCIES.find(c => c.code === currency);
    if (selectedCurr) {
      await updateSetting('currency', selectedCurr.code);
      await updateSetting('currencySymbol', selectedCurr.symbol);
    }
    
    await updateSetting('currencyPosition', currencyPosition);
    await updateSetting('thousandSeparator', thousandSeparator);
    await updateSetting('decimalSeparator', decimalSeparator);
    await updateSetting('ENABLE_BUY_NOW_BUTTON', enableBuyNow.toString());
    let finalChatIcon = chatStoreIcon;
    if (chatIconFile) {
      const formData = new FormData();
      formData.append('file', chatIconFile);
      const url = await uploadImage(formData);
      if (url) finalChatIcon = url;
    }

    let finalLogoImage = headerLogoImage;
    if (logoFile) {
      const formData = new FormData();
      formData.append('file', logoFile);
      const url = await uploadImage(formData);
      if (url) finalLogoImage = url;
    }
    
    await updateSetting('CHAT_ENABLED', chatEnabled.toString());
    await updateSetting('CHAT_STORE_NAME', chatStoreName);
    await updateSetting('CHAT_STORE_ICON', finalChatIcon);
    
    await updateSetting('THEME_COLOR', themeColor);
    await updateSetting('HEADER_ANNOUNCEMENT', headerAnnouncement);
    await updateSetting('HEADER_LOGO_IMAGE', finalLogoImage);
    await updateSetting('HEADER_SUPPORT_PHONE', headerSupportPhone);
    await updateSetting('HEADER_SUPPORT_EMAIL', headerSupportEmail);
    await updateSetting('HEADER_MENU_LINKS', JSON.stringify(menuLinks));

    await updateSetting('TOP_BAR_BG_COLOR', topBarBgColor);
    await updateSetting('TOP_BAR_TEXT_COLOR', topBarTextColor);
    await updateSetting('TOP_BAR_LINKS', JSON.stringify(topBarLinks));

    await updateSetting('SEARCH_BORDER_COLOR', searchBorderColor);
    await updateSetting('SEARCH_PLACEHOLDER', searchPlaceholder);
    await updateSetting('SEARCH_BTN_TEXT', searchBtnText);
    await updateSetting('SEARCH_BTN_BG_COLOR', searchBtnBgColor);
    await updateSetting('SEARCH_BTN_TEXT_COLOR', searchBtnTextColor);
    
    await updateSetting('TAX_INCLUDED_IN_PRICE', taxIncludedInPrice.toString());
    await updateSetting('DEFAULT_VAT_RATE', defaultVatRate);
    await updateSetting('ENABLE_EU_VAT', enableEuVat.toString());

    await updateSetting('CONTACT_RECEIVER_EMAIL', contactReceiverEmail);
    await updateSetting('NEWSLETTER_SUCCESS_MESSAGE', newsletterSuccessMessage);

    await updateSetting('SMTP_HOST', smtpHost);
    await updateSetting('SMTP_PORT', smtpPort);
    await updateSetting('SMTP_USER', smtpUser);
    await updateSetting('SMTP_PASS', smtpPass);
    await updateSetting('SMTP_FROM', smtpFrom);
    
    await updateSetting('FOOTER_BG_COLOR', footerBgColor);
    await updateSetting('FOOTER_TEXT_COLOR', footerTextColor);
    await updateSetting('FOOTER_ADDRESS_1', footerAddress1);
    await updateSetting('FOOTER_ADDRESS_2', footerAddress2);
    await updateSetting('FOOTER_LOCATIONS_TITLE', footerLocationsTitle);
    await updateSetting('FOOTER_NEWSLETTER_TITLE', footerNewsletterTitle);
    await updateSetting('FOOTER_NEWSLETTER_TEXT', footerNewsletterText);
    await updateSetting('FOOTER_NEWSLETTER_PLACEHOLDER', footerNewsletterPlaceholder);
    await updateSetting('FOOTER_CALL_US_TEXT', footerCallUsText);
    await updateSetting('FOOTER_COPYRIGHT', footerCopyright);
    await updateSetting('FOOTER_SOCIAL_FACEBOOK', footerSocialFacebook);
    await updateSetting('FOOTER_SOCIAL_TWITTER', footerSocialTwitter);
    await updateSetting('FOOTER_SOCIAL_INSTAGRAM', footerSocialInstagram);
    await updateSetting('FOOTER_SOCIAL_LINKEDIN', footerSocialLinkedin);
    await updateSetting('FOOTER_COLUMNS', JSON.stringify(footerColumns));
    
    await updateSetting('NOT_FOUND_TITLE', notFoundTitle);
    await updateSetting('NOT_FOUND_TEXT', notFoundText);
    await updateSetting('NOT_FOUND_CTA', notFoundCta);
    await updateSetting('NOT_FOUND_BG_COLOR', notFoundBgColor);
    
    let finalNotFoundBgImage = notFoundBgImage;
    if (notFoundFile) {
      const formData = new FormData();
      formData.append('file', notFoundFile);
      const url = await uploadImage(formData);
      if (url) finalNotFoundBgImage = url;
    }
    await updateSetting('NOT_FOUND_BG_IMAGE', finalNotFoundBgImage);

    let finalMaintenanceImage = maintenanceImage;
    if (maintenanceFile) {
      const formData = new FormData();
      formData.append('file', maintenanceFile);
      const url = await uploadImage(formData);
      if (url) finalMaintenanceImage = url;
    }
    await updateSetting('MAINTENANCE_MODE', maintenanceMode.toString());
    await updateSetting('MAINTENANCE_TITLE', maintenanceTitle);
    await updateSetting('MAINTENANCE_MESSAGE', maintenanceMessage);
    await updateSetting('MAINTENANCE_IMAGE', finalMaintenanceImage);

    setMessage('Paramètres mis à jour avec succès.');
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
        {isLoading ? 'Enregistrement...' : 'Enregistrer cette section'}
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
        <h3 className="text-lg font-bold text-red-600 mb-4">Paramètres Régionaux</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Devise principale</label>
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
            <p className="mt-2 text-xs text-gray-500">C'est la devise par défaut utilisée pour afficher les prix.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position du symbole</label>
            <select
              value={currencyPosition}
              onChange={(e) => setCurrencyPosition(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="left">Gauche (ex: $10)</option>
              <option value="right">Droite (ex: 10$)</option>
              <option value="left-space">Gauche avec espace (ex: $ 10)</option>
              <option value="right-space">Droite avec espace (ex: 10 $)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Séparateur des milliers</label>
            <select
              value={thousandSeparator}
              onChange={(e) => setThousandSeparator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Aucun (ex: 1000)</option>
              <option value=",">Virgule (ex: 1,000)</option>
              <option value=".">Point (ex: 1.000)</option>
              <option value=" ">Espace (ex: 1 000)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Séparateur décimal</label>
            <select
              value={decimalSeparator}
              onChange={(e) => setDecimalSeparator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value=".">Point (ex: 10.50)</option>
              <option value=",">Virgule (ex: 10,50)</option>
            </select>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Taxes & TVA</h3>
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
              Les prix saisis dans le catalogue sont Toutes Taxes Comprises (TTC)
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
              Appliquer la TVA dynamique selon les pays de l&apos;Union Européenne (à venir au Checkout)
            </label>
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Taux de TVA par défaut (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={defaultVatRate}
              onChange={(e) => setDefaultVatRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: 20"
            />
            <p className="mt-2 text-xs text-gray-500">Taux appliqué si la TVA dynamique est désactivée ou si le pays du client est inconnu.</p>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Fonctionnalités Boutique</h3>
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
              Activer le bouton "Buy Now" (Achat rapide) sur les pages produits
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email de réception (Contact & Newsletter)</label>
              <input
                type="email"
                value={contactReceiverEmail}
                onChange={(e) => setContactReceiverEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="admin@shopelios.com"
              />
              <p className="mt-2 text-xs text-gray-500">L'adresse e-mail qui recevra les messages du formulaire de contact et les notifications d'inscription.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message de succès (Newsletter)</label>
              <textarea
                value={newsletterSuccessMessage}
                onChange={(e) => setNewsletterSuccessMessage(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Merci pour votre inscription !"
              />
              <p className="mt-2 text-xs text-gray-500">Message affiché à l'utilisateur après une inscription réussie.</p>
            </div>
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Serveur E-mail (SMTP) - E-mails Transactionnels</h3>
        <p className="text-sm text-gray-500 mb-4">Configurez ces paramètres pour que la boutique puisse envoyer automatiquement des e-mails (Confirmation de commande, Expédition, Annulation).</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hôte SMTP (ex: smtp.gmail.com)</label>
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Port SMTP (ex: 587 ou 465)</label>
            <input
              type="text"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="587"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur (Email de connexion)</label>
            <input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="votre-email@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe (App Password)</label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="••••••••"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email d'expédition (De : ...)</label>
            <input
              type="text"
              value={smtpFrom}
              onChange={(e) => setSmtpFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Boutique Shopelios <contact@shopelios.com>"
            />
          </div>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Design & En-tête (Header)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale de la boutique (Thème)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Message du bandeau supérieur</label>
            <input
              type="text"
              value={headerAnnouncement}
              onChange={(e) => setHeaderAnnouncement(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Boutique (Upload)</label>
            <p className="text-xs text-gray-500 mb-2">Taille recommandée: 150x50 pixels (PNG transparent).</p>
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
                  Supprimer le logo
                </button>
              </div>
            )}
            
            {logoFile && (
              <div className="flex items-center gap-3 mb-3 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700">
                <span>Nouveau fichier : <strong>{logoFile.name}</strong></span>
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
                  Annuler
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone Support (En-tête)</label>
            <input
              type="text"
              value={headerSupportPhone}
              onChange={(e) => setHeaderSupportPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Support (En-tête)</label>
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
        <h3 className="text-lg font-bold text-red-600 mb-4">Barre de Recherche (Ajax)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de la bordure</label>
            <div className="flex items-center gap-3">
              <input type="color" value={searchBorderColor} onChange={e => setSearchBorderColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={searchBorderColor} onChange={e => setSearchBorderColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texte de l'input (Placeholder)</label>
            <input type="text" value={searchPlaceholder} onChange={e => setSearchPlaceholder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton</label>
            <input type="text" value={searchBtnText} onChange={e => setSearchBtnText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de fond du bouton</label>
              <div className="flex items-center gap-2">
                <input type="color" value={searchBtnBgColor} onChange={e => setSearchBtnBgColor(e.target.value)} className="h-10 w-12 p-1 border border-gray-300 rounded-md cursor-pointer" />
                <input type="text" value={searchBtnBgColor} onChange={e => setSearchBtnBgColor(e.target.value)} className="px-2 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du texte (bouton)</label>
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
        <h3 className="text-lg font-bold text-red-600 mb-4">Liens de Navigation (Menu)</h3>
        <div className="space-y-4">
          {menuLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nom du lien</label>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">URL / Lien</label>
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
                  title="Supprimer ce lien"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMenuLinks([...menuLinks, { label: 'Nouveau Lien', url: '/' }])}
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Ajouter un lien
          </button>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Liens et Couleurs de la Top Bar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de fond (Top Bar)</label>
            <div className="flex items-center gap-3">
              <input type="color" value={topBarBgColor} onChange={e => setTopBarBgColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={topBarBgColor} onChange={e => setTopBarBgColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du texte (Top Bar)</label>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">Icône</label>
                <select
                  value={link.icon}
                  onChange={(e) => {
                    const newLinks = [...topBarLinks];
                    newLinks[idx].icon = e.target.value;
                    setTopBarLinks(newLinks);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="location">Localisation</option>
                  <option value="truck">Camion de livraison</option>
                  <option value="phone">Téléphone</option>
                  <option value="star">Étoile</option>
                  <option value="mail">Email</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Texte</label>
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
                <label className="block text-xs font-medium text-gray-500 mb-1">URL / Lien</label>
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
                  title="Supprimer ce lien"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setTopBarLinks([...topBarLinks, { label: 'Nouveau Lien', icon: 'star', url: '#' }])}
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Ajouter un lien Top Bar
          </button>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Paramètres du Chat</h3>
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
              Activer le module de Chat pour les clients
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la boutique (Chat)</label>
              <input
                type="text"
                value={chatStoreName}
                onChange={(e) => setChatStoreName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: Support Shopelios"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icône du Chat (Upload)</label>
              <p className="text-xs text-gray-500 mb-2">Taille recommandée: 64x64 pixels (Carré).</p>
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
        <h3 className="text-lg font-bold text-red-600 mb-4">Pied de Page (Footer)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2 grid grid-cols-2 gap-6 pb-4 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de Fond du Footer</label>
              <div className="flex items-center gap-3">
                <input type="color" value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
                <input type="text" value={footerBgColor} onChange={e => setFooterBgColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-32" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du Texte Principal</label>
              <div className="flex items-center gap-3">
                <input type="color" value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
                <input type="text" value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-32" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse 1 (Store 1)</label>
            <input type="text" value={footerAddress1} onChange={e => setFooterAddress1(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse 2 (Store 2 - Optionnel)</label>
            <input type="text" value={footerAddress2} onChange={e => setFooterAddress2(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Texte de la Newsletter</label>
            <textarea value={footerNewsletterText} onChange={e => setFooterNewsletterText(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h4 className="text-md font-medium text-gray-800 mb-4">Textes d&apos;interface (Titres et Labels)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre Adresses (ex: Our Locations)</label>
                <input type="text" value={footerLocationsTitle} onChange={e => setFooterLocationsTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre Newsletter (ex: Newsletter)</label>
                <input type="text" value={footerNewsletterTitle} onChange={e => setFooterNewsletterTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Texte Placeholder Email (ex: Enter your email...)</label>
                <input type="text" value={footerNewsletterPlaceholder} onChange={e => setFooterNewsletterPlaceholder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Texte &quot;Appelez-nous&quot; (ex: Call Us Now)</label>
                <input type="text" value={footerCallUsText} onChange={e => setFooterCallUsText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Texte du Copyright (ex: © 2026 Shopelios)</label>
            <input type="text" value={footerCopyright} onChange={e => setFooterCopyright(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
        </div>

        <h4 className="text-md font-medium text-gray-800 mb-3">Réseaux Sociaux (URL)</h4>
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

        <h4 className="text-md font-medium text-gray-800 mb-3">Colonnes de liens du Footer</h4>
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
                  placeholder="Titre de la colonne (ex: Contact Us)"
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
                  Supprimer la colonne
                </button>
              </div>
              
              <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                {col.links.map((link, lIdx) => (
                  <div key={lIdx} className="flex gap-2 items-center">
                    <input type="text" value={link.label} placeholder="Nom du lien" onChange={e => {
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
                  newCols[cIdx].links.push({ label: 'Nouveau lien', url: '#' });
                  setFooterColumns(newCols);
                }} className="text-orange-600 text-xs mt-2">+ Ajouter un lien</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => {
            setFooterColumns([...footerColumns, { title: 'Nouvelle Colonne', links: [] }]);
          }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm transition">
            + Ajouter une colonne
          </button>
        </div>
        <SectionSaveButton />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-bold text-red-600 mb-4">Mode Maintenance</h3>
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
              Activer le mode maintenance (Bloque l'accès public au site)
            </label>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la page</label>
            <input type="text" value={maintenanceTitle} onChange={e => setMaintenanceTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message d'explication</label>
            <textarea value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image d'illustration (Upload)</label>
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
        <h3 className="text-lg font-bold text-red-600 mb-4">Page 404 (Introuvable)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la page</label>
            <input type="text" value={notFoundTitle} onChange={e => setNotFoundTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Texte d'explication</label>
            <textarea value={notFoundText} onChange={e => setNotFoundText(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton retour (CTA)</label>
            <input type="text" value={notFoundCta} onChange={e => setNotFoundCta(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de fond (Si pas d'image)</label>
            <div className="flex items-center gap-3">
              <input type="color" value={notFoundBgColor} onChange={e => setNotFoundBgColor(e.target.value)} className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" />
              <input type="text" value={notFoundBgColor} onChange={e => setNotFoundBgColor(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 w-32" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image de fond (Upload)</label>
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
