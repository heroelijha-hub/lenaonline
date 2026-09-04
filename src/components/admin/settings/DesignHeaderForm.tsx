'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function DesignHeaderForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [shopCardStyle, setShopCardStyle] = useState(initialSettings.SHOP_CARD_STYLE || 'design2');
  const [shopCardBorderColor, setShopCardBorderColor] = useState(initialSettings.SHOP_CARD_BORDER_COLOR || '#e5e7eb');
  const [themeColor, setThemeColor] = useState(initialSettings.THEME_COLOR || '#f97316');
  const [headerAnnouncement, setHeaderAnnouncement] = useState(initialSettings.HEADER_ANNOUNCEMENT || 'Welcome to our store!');
  const [headerSupportPhone, setHeaderSupportPhone] = useState(initialSettings.HEADER_SUPPORT_PHONE || '+08 9229 8228');
  const [headerSupportEmail, setHeaderSupportEmail] = useState(initialSettings.HEADER_SUPPORT_EMAIL || 'support@mystore.com');
  const [topBarBgColor, setTopBarBgColor] = useState(initialSettings.TOP_BAR_BG_COLOR || '#ffffff');
  const [topBarTextColor, setTopBarTextColor] = useState(initialSettings.TOP_BAR_TEXT_COLOR || '#4b5563');
  const [showStoreLocator, setShowStoreLocator] = useState(initialSettings.SHOW_STORE_LOCATOR !== 'false');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await updateSettingsBatch({
      SHOP_CARD_STYLE: shopCardStyle,
      SHOP_CARD_BORDER_COLOR: shopCardBorderColor,
      THEME_COLOR: themeColor,
      HEADER_ANNOUNCEMENT: headerAnnouncement,
      HEADER_SUPPORT_PHONE: headerSupportPhone,
      HEADER_SUPPORT_EMAIL: headerSupportEmail,
      TOP_BAR_BG_COLOR: topBarBgColor,
      TOP_BAR_TEXT_COLOR: topBarTextColor,
      SHOW_STORE_LOCATOR: showStoreLocator.toString()
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Header & Product Cards Design</h2>
      </div>
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
          <div className="relative w-10 h-10">  <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />  <div className="w-10 h-10 rounded-xl shadow-sm border border-gray-200" style={{ backgroundColor: themeColor }} /></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Header Announcement</label>
          <input type="text" value={headerAnnouncement} onChange={(e) => setHeaderAnnouncement(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
            <input type="text" value={headerSupportPhone} onChange={(e) => setHeaderSupportPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input type="email" value={headerSupportEmail} onChange={(e) => setHeaderSupportEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors">
          {isLoading ? tSettings('saving') : 'Save changes'}
        </button>
      </div>
    </form>
  );
}