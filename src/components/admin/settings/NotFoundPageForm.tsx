'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function NotFoundPageForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [notFoundTitle, setNotFoundTitle] = useState(initialSettings.NOT_FOUND_TITLE || 'Oops! This page could not be found.');
  const [notFoundText, setNotFoundText] = useState(initialSettings.NOT_FOUND_TEXT || 'It seems we cannot find the page you are looking for. It may have been moved or deleted.');
  const [notFoundCta, setNotFoundCta] = useState(initialSettings.NOT_FOUND_CTA || 'Back to Home');
  const [notFoundBgColor, setNotFoundBgColor] = useState(initialSettings.NOT_FOUND_BG_COLOR || '#000000');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await updateSettingsBatch({
      NOT_FOUND_TITLE: notFoundTitle,
      NOT_FOUND_TEXT: notFoundText,
      NOT_FOUND_CTA: notFoundCta,
      NOT_FOUND_BG_COLOR: notFoundBgColor
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">404 Page Customization</h2>
        <p className="text-gray-500 mt-1">Customize the page not found error screen.</p>
      </div>
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input type="text" value={notFoundTitle} onChange={(e) => setNotFoundTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
          <textarea value={notFoundText} onChange={(e) => setNotFoundText(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action Button</label>
          <input type="text" value={notFoundCta} onChange={(e) => setNotFoundCta(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
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