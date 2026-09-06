'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function NavigationForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [mobileAboutTitle, setMobileAboutTitle] = useState(initialSettings.MOBILE_ABOUT_TITLE || 'About Us');
  const [mobileAboutDesc, setMobileAboutDesc] = useState(initialSettings.MOBILE_ABOUT_DESC || 'Welcome to our store. We sell the best products in town.');
  const [mobileContactAddress, setMobileContactAddress] = useState(initialSettings.MOBILE_CONTACT_ADDRESS || '123 Main St');
  const [mobileContactPhone, setMobileContactPhone] = useState(initialSettings.MOBILE_CONTACT_PHONE || '+1 234 567 890');
  const [mobileContactEmail, setMobileContactEmail] = useState(initialSettings.MOBILE_CONTACT_EMAIL || 'contact@example.com');
  const [mobileContactWebsite, setMobileContactWebsite] = useState(initialSettings.MOBILE_CONTACT_WEBSITE || 'www.example.com');
  
  const [loginText, setLoginText] = useState(initialSettings.LOGIN_TEXT || '');
  const [myAccountText, setMyAccountText] = useState(initialSettings.MY_ACCOUNT_TEXT || '');
  const [adminDashboardText, setAdminDashboardText] = useState(initialSettings.ADMIN_DASHBOARD_TEXT || '');
  
  const [headerLinks, setHeaderLinks] = useState<{label: string, url: string}[]>(() => {
    try {
      return initialSettings.HEADER_MENU_LINKS ? JSON.parse(initialSettings.HEADER_MENU_LINKS) : [
        { label: 'Home', url: '/' },
        { label: 'Shop', url: '/shop' },
        { label: 'Pages', url: '/pages' },
        { label: 'Blogs', url: '/blog' },
        { label: 'Contact Us', url: '/contact' }
      ];
    } catch {
      return [];
    }
  });
  
  const [topBarLinks, setTopBarLinks] = useState<{label: string, icon: string, url: string}[]>(() => {
    try {
      return initialSettings.TOP_BAR_LINKS ? JSON.parse(initialSettings.TOP_BAR_LINKS) : [
        { label: 'Store Locator', icon: 'location', url: '/store-locator' },
        { label: 'Order Tracking', icon: 'truck', url: '/order-tracking' }
      ];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await updateSettingsBatch({
      MOBILE_ABOUT_TITLE: mobileAboutTitle,
      MOBILE_ABOUT_DESC: mobileAboutDesc,
      MOBILE_CONTACT_ADDRESS: mobileContactAddress,
      MOBILE_CONTACT_PHONE: mobileContactPhone,
      MOBILE_CONTACT_EMAIL: mobileContactEmail,
      MOBILE_CONTACT_WEBSITE: mobileContactWebsite,
      HEADER_MENU_LINKS: JSON.stringify(headerLinks),
      TOP_BAR_LINKS: JSON.stringify(topBarLinks),
      LOGIN_TEXT: loginText,
      MY_ACCOUNT_TEXT: myAccountText,
      ADMIN_DASHBOARD_TEXT: adminDashboardText
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{tSettings('nav_navigation') || 'Navigation menu'}</h2>
      </div>
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="space-y-6 pt-4 border-t border-gray-100">
        
        {/* Top Bar Links */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-base font-semibold text-gray-900 mb-4">{tSettings('top_bar_links') || 'Top Bar Links (Store Locator, Order Tracking)'}</label>
          <div className="space-y-3">
            {topBarLinks.map((link, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-white p-2 border rounded-md shadow-sm">
                <input type="text" placeholder={tSettings('label_ex') || "Label"} value={link.label} onChange={e => {
                  const newLinks = [...topBarLinks];
                  newLinks[index].label = e.target.value;
                  setTopBarLinks(newLinks);
                }} className="flex-1 min-w-[150px] px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                
                <select value={link.icon} onChange={e => {
                  const newLinks = [...topBarLinks];
                  newLinks[index].icon = e.target.value;
                  setTopBarLinks(newLinks);
                }} className="w-full md:w-32 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm bg-white">
                  <option value="location">Location</option>
                  <option value="truck">Truck</option>
                  <option value="phone">Phone</option>
                  <option value="mail">Mail</option>
                  <option value="star">Star</option>
                </select>

                <input type="text" placeholder={tSettings('url_ex') || "URL"} value={link.url} onChange={e => {
                  const newLinks = [...topBarLinks];
                  newLinks[index].url = e.target.value;
                  setTopBarLinks(newLinks);
                }} className="flex-1 min-w-[150px] px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                
                <button type="button" onClick={() => setTopBarLinks(topBarLinks.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-md font-bold" title="Remove">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setTopBarLinks([...topBarLinks, {label: '', icon: 'star', url: ''}])} className="mt-3 text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {tSettings('add_menu_link') || 'Add Top Bar Link'}
            </button>
          </div>
        </div>

        {/* Auth Links (Right Top Bar) */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-base font-semibold text-gray-900 mb-4">{tSettings('auth_links') || 'Auth Links (Top Bar Right)'}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tSettings('login_text') || 'Login Text'}</label>
              <input type="text" placeholder="Leave empty for default translation" value={loginText} onChange={(e) => setLoginText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tSettings('my_account_text') || 'My Account Text'}</label>
              <input type="text" placeholder="Leave empty for default translation" value={myAccountText} onChange={(e) => setMyAccountText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tSettings('admin_dashboard_text') || 'Admin Dashboard Text'}</label>
              <input type="text" placeholder="Leave empty for default translation" value={adminDashboardText} onChange={(e) => setAdminDashboardText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
            </div>
          </div>
        </div>

        {/* Main Header Links */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-base font-semibold text-gray-900 mb-4">{tSettings('header_navigation_menu') || 'Header Navigation Menu'}</label>
          <div className="space-y-3">
            {headerLinks.map((link, index) => (
              <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-white p-2 border rounded-md shadow-sm">
                <input type="text" placeholder={tSettings('label_ex') || "Label (ex: Shop)"} value={link.label} onChange={e => {
                  const newLinks = [...headerLinks];
                  newLinks[index].label = e.target.value;
                  setHeaderLinks(newLinks);
                }} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                <input type="text" placeholder={tSettings('url_ex') || "URL (ex: /shop)"} value={link.url} onChange={e => {
                  const newLinks = [...headerLinks];
                  newLinks[index].url = e.target.value;
                  setHeaderLinks(newLinks);
                }} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                <button type="button" onClick={() => setHeaderLinks(headerLinks.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-md font-bold" title="Remove">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setHeaderLinks([...headerLinks, {label: '', url: ''}])} className="mt-3 text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {tSettings('add_menu_link') || 'Add Menu Link'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('mobile_about_title') || 'Mobile About Title'}</label>
          <input type="text" value={mobileAboutTitle} onChange={(e) => setMobileAboutTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('mobile_about_desc') || 'Mobile About Description'}</label>
          <textarea value={mobileAboutDesc} onChange={(e) => setMobileAboutDesc(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('contact_phone') || 'Contact Phone'}</label>
            <input type="text" value={mobileContactPhone} onChange={(e) => setMobileContactPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('contact_email') || 'Contact Email'}</label>
            <input type="email" value={mobileContactEmail} onChange={(e) => setMobileContactEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors">
          {isLoading ? tSettings('saving') : (tSettings('save_changes') || 'Save changes')}
        </button>
      </div>
    </form>
  );
}