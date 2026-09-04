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
      MOBILE_CONTACT_WEBSITE: mobileContactWebsite
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Navigation Menu Settings</h2>
      </div>
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile About Title</label>
          <input type="text" value={mobileAboutTitle} onChange={(e) => setMobileAboutTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile About Description</label>
          <textarea value={mobileAboutDesc} onChange={(e) => setMobileAboutDesc(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
            <input type="text" value={mobileContactPhone} onChange={(e) => setMobileContactPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
            <input type="email" value={mobileContactEmail} onChange={(e) => setMobileContactEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
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