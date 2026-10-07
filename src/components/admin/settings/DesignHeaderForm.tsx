'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

export default function DesignHeaderForm({ initialSettings, menus = [] }: { initialSettings: Record<string, string>, menus?: any[] }) {
  const tSettings = useTranslations('AdminSettings');
  const tHeader = useTranslations('AdminHeaderDesign');
  const router = useRouter();
  
  const [selectedTheme, setSelectedTheme] = useState(initialSettings.ACTIVE_THEME || 'default');
  
  const getVal = (key: string, fallback: string) => {
    if (selectedTheme === 'default') return initialSettings[key] || fallback;
    return initialSettings[`${selectedTheme}_${key}`] || initialSettings[key] || fallback;
  };

  const [shopCardStyle, setShopCardStyle] = useState(getVal('SHOP_CARD_STYLE', 'design2'));
  const [shopCardBorderColor, setShopCardBorderColor] = useState(getVal('SHOP_CARD_BORDER_COLOR', '#e5e7eb'));
  const [themeColor, setThemeColor] = useState(getVal('THEME_COLOR', '#c2410c'));
  const [headerAnnouncement, setHeaderAnnouncement] = useState(getVal('HEADER_ANNOUNCEMENT', 'Welcome to our store!'));
  const [searchPlaceholder, setSearchPlaceholder] = useState(getVal('SEARCH_PLACEHOLDER', 'Search products...'));
  const [headerSupportPhone, setHeaderSupportPhone] = useState(getVal('HEADER_SUPPORT_PHONE', '+08 9229 8228'));
  const [headerSupportEmail, setHeaderSupportEmail] = useState(getVal('HEADER_SUPPORT_EMAIL', 'support@mystore.com'));
  const [topBarBgColor, setTopBarBgColor] = useState(getVal('TOP_BAR_BG_COLOR', '#ffffff'));
  const [topBarTextColor, setTopBarTextColor] = useState(getVal('TOP_BAR_TEXT_COLOR', '#4b5563'));
  const [mainMenuId, setMainMenuId] = useState(getVal('HEADER_MAIN_MENU_ID', ''));
  
  // Handle SHOW_STORE_LOCATOR correctly (boolean-like string)
  const showLocRaw = selectedTheme === 'default' ? initialSettings['SHOW_STORE_LOCATOR'] : (initialSettings[`${selectedTheme}_SHOW_STORE_LOCATOR`] ?? initialSettings['SHOW_STORE_LOCATOR']);
  const [showStoreLocator, setShowStoreLocator] = useState(showLocRaw !== 'false');
  
  const [headerLogoImage, setHeaderLogoImage] = useState(getVal('HEADER_LOGO_IMAGE', ''));
  const [faviconImage, setFaviconImage] = useState(initialSettings.FAVICON_IMAGE || ''); // Favicon is usually global
  
  useEffect(() => {
    setShopCardStyle(getVal('SHOP_CARD_STYLE', 'design2'));
    setShopCardBorderColor(getVal('SHOP_CARD_BORDER_COLOR', '#e5e7eb'));
    setThemeColor(getVal('THEME_COLOR', '#c2410c'));
    setHeaderAnnouncement(getVal('HEADER_ANNOUNCEMENT', 'Welcome to our store!'));
    setSearchPlaceholder(getVal('SEARCH_PLACEHOLDER', 'Search products...'));
    setHeaderSupportPhone(getVal('HEADER_SUPPORT_PHONE', '+08 9229 8228'));
    setHeaderSupportEmail(getVal('HEADER_SUPPORT_EMAIL', 'support@mystore.com'));
    setTopBarBgColor(getVal('TOP_BAR_BG_COLOR', '#ffffff'));
    setTopBarTextColor(getVal('TOP_BAR_TEXT_COLOR', '#4b5563'));
    setMainMenuId(getVal('HEADER_MAIN_MENU_ID', ''));
    
    const showLocRaw = selectedTheme === 'default' ? initialSettings['SHOW_STORE_LOCATOR'] : (initialSettings[`${selectedTheme}_SHOW_STORE_LOCATOR`] ?? initialSettings['SHOW_STORE_LOCATOR']);
    setShowStoreLocator(showLocRaw !== 'false');
    
    setHeaderLogoImage(getVal('HEADER_LOGO_IMAGE', ''));
  }, [selectedTheme]);

  const [showHeaderLogoModal, setShowHeaderLogoModal] = useState(false);
  const [showFaviconModal, setShowFaviconModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const prefix = selectedTheme === 'default' ? '' : `${selectedTheme}_`;
    
    const res = await updateSettingsBatch({
      [`${prefix}SHOP_CARD_STYLE`]: shopCardStyle,
      [`${prefix}SHOP_CARD_BORDER_COLOR`]: shopCardBorderColor,
      [`${prefix}THEME_COLOR`]: themeColor,
      [`${prefix}HEADER_ANNOUNCEMENT`]: headerAnnouncement,
      [`${prefix}SEARCH_PLACEHOLDER`]: searchPlaceholder,
      [`${prefix}HEADER_SUPPORT_PHONE`]: headerSupportPhone,
      [`${prefix}HEADER_SUPPORT_EMAIL`]: headerSupportEmail,
      [`${prefix}TOP_BAR_BG_COLOR`]: topBarBgColor,
      [`${prefix}TOP_BAR_TEXT_COLOR`]: topBarTextColor,
      [`${prefix}HEADER_MAIN_MENU_ID`]: mainMenuId,
      [`${prefix}SHOW_STORE_LOCATOR`]: showStoreLocator.toString(),
      [`${prefix}HEADER_LOGO_IMAGE`]: headerLogoImage,
      FAVICON_IMAGE: faviconImage // always global
    });

    if (res?.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setMessage(tSettings('update_success') || 'Settings updated successfully');
    }
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Header & Product Cards Design</h2>
        <div className="mt-4 md:mt-0 flex items-center bg-gray-50 border border-gray-200 rounded-lg p-2">
          <label className="text-sm font-semibold text-gray-700 mr-3">{tHeader('edit_theme') || 'Edit theme:'}</label>
          <select 
            value={selectedTheme} 
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="default">Par défaut (Default)</option>
            <option value="moto">Moto</option>
          </select>
        </div>
      </div>
      
      {message && (
        <div className={`p-4 rounded-md border ${message.startsWith('Error:') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {message}
        </div>
      )}
      
      {selectedTheme !== 'default' && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
          {tHeader('edit_theme_desc') || 'You are editing the settings specifically for this theme. These settings will override the default settings when this theme is active.'}
        </div>
      )}

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
          <div className="relative w-10 h-10">  <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />  <div className="w-10 h-10 rounded-xl shadow-sm border border-gray-200" style={{ backgroundColor: themeColor }} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('header_logo_label') || 'Header Logo'}</label>
            <div className="flex items-center gap-4">
              {headerLogoImage && (
                <div className="w-32 p-2 bg-gray-100 rounded border">
                  <img src={headerLogoImage} alt="Header logo" className="max-h-12 object-contain" />
                </div>
              )}
              <button type="button" onClick={() => setShowHeaderLogoModal(true)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                {headerLogoImage ? (tSettings('change_logo') || 'Change Logo') : (tSettings('select_logo') || 'Select Logo')}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tHeader('favicon') || 'Favicon'}</label>
            <div className="flex items-center gap-4">
              {faviconImage && (
                <div className="w-12 h-12 p-1 bg-gray-100 rounded border flex items-center justify-center">
                  <img src={faviconImage} alt="Favicon" className="max-h-8 max-w-8 object-contain" />
                </div>
              )}
              <button type="button" onClick={() => setShowFaviconModal(true)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                {faviconImage ? (tSettings('change_favicon') || 'Change Favicon') : (tSettings('select_favicon') || 'Select Favicon')}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 pb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">{tHeader('header_menu') || 'Header Menu'}</label>
          <select 
            value={mainMenuId} 
            onChange={(e) => setMainMenuId(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-sm"
          >
            <option value="">{tHeader('default_menu') || '-- Use default menu / hardcoded links --'}</option>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{tHeader('menu_select_desc') || 'Select the menu that will be displayed in the main navigation of the header for this theme.'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('header_announcement') || 'Header Announcement'}</label>
          <input type="text" value={headerAnnouncement} onChange={(e) => setHeaderAnnouncement(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('search_placeholder_label') || 'Search Placeholder'}</label>
          <input type="text" value={searchPlaceholder} onChange={(e) => setSearchPlaceholder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('support_phone') || 'Support Phone'}</label>
            <input type="text" value={headerSupportPhone} onChange={(e) => setHeaderSupportPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('support_email') || 'Support Email'}</label>
            <input type="email" value={headerSupportEmail} onChange={(e) => setHeaderSupportEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors">
          {isLoading ? tSettings('saving') || 'Saving...' : (tSettings('save_changes') || 'Save changes')}
        </button>
      </div>

      {showHeaderLogoModal && (
        <MediaPickerModal 
          onClose={() => setShowHeaderLogoModal(false)}
          onSelect={(url) => {
            setHeaderLogoImage(url);
            setShowHeaderLogoModal(false);
          }}
        />
      )}

      {showFaviconModal && (
        <MediaPickerModal 
          onClose={() => setShowFaviconModal(false)}
          onSelect={(url) => {
            setFaviconImage(url);
            setShowFaviconModal(false);
          }}
        />
      )}
    </form>
  );
}
