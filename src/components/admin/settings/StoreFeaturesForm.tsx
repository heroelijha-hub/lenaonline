'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function StoreFeaturesForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [enableBuyNow, setEnableBuyNow] = useState(initialSettings.ENABLE_BUY_NOW_BUTTON === 'true');
  const [contactReceiverEmail, setContactReceiverEmail] = useState(initialSettings.CONTACT_RECEIVER_EMAIL || 'admin@mystore.com');
  const [newsletterSuccessMessage, setNewsletterSuccessMessage] = useState(initialSettings.NEWSLETTER_SUCCESS_MESSAGE || 'Thank you for subscribing to our newsletter!');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    await updateSettingsBatch({
      ENABLE_BUY_NOW_BUTTON: enableBuyNow.toString(),
      CONTACT_RECEIVER_EMAIL: contactReceiverEmail,
      NEWSLETTER_SUCCESS_MESSAGE: newsletterSuccessMessage
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Store features</h2>
        <p className="text-gray-500 mt-1">Settings for this category only.</p>
      </div>

      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="grid grid-cols-1 gap-6 border-t border-gray-100 pt-6">
        <div className="flex items-center gap-3">
          <input type="checkbox" id="enableBuyNow" checked={enableBuyNow} onChange={(e) => setEnableBuyNow(e.target.checked)} className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500" />
          <label htmlFor="enableBuyNow" className="text-sm font-medium text-gray-700 cursor-pointer">{tSettings('enable_buy_now')}</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('receiving_email')}</label>
            <input type="email" value={contactReceiverEmail} onChange={(e) => setContactReceiverEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            <p className="mt-2 text-xs text-gray-500">{tSettings('receiving_email_desc')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('newsletter_success_msg')}</label>
            <textarea value={newsletterSuccessMessage} onChange={(e) => setNewsletterSuccessMessage(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            <p className="mt-2 text-xs text-gray-500">{tSettings('newsletter_success_desc')}</p>
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