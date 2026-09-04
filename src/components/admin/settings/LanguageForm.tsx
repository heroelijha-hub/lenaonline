'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function LanguageForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [activeLanguage, setActiveLanguage] = useState(initialSettings.active_language || 'en');
  const [translationScope, setTranslationScope] = useState(initialSettings.translation_scope || 'all');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const settingsMap: Record<string, string> = {
      active_language: activeLanguage,
      translation_scope: translationScope
    };

    await updateSettingsBatch(settingsMap);

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{tSettings('nav_language') || 'Language and translation'}</h2>
        <p className="text-gray-500 mt-1">{tSettings('settings_category_only') || 'Settings for this category only.'}</p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <label className="block text-sm font-medium text-gray-700">{tSettings('active_language_site')}</label>
          </div>
          <div className="md:w-2/3">
            <select
              value={activeLanguage}
              onChange={(e) => setActiveLanguage(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="fr">French (Français)</option>
              <option value="es">Spanish (Español)</option>
              <option value="de">German (Deutsch)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between pb-2">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <label className="block text-sm font-medium text-gray-700">{tSettings('translation_scope_label')}</label>
          </div>
          <div className="md:w-2/3">
            <select
              value={translationScope}
              onChange={(e) => setTranslationScope(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="frontend_only">{tSettings('translation_scope_opt1')}</option>
              <option value="admin_only">{tSettings('translation_scope_opt2')}</option>
              <option value="all">{tSettings('translation_scope_opt3')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors"
        >
          {isLoading ? tSettings('saving') : (tSettings('save_changes') || 'Save changes')}
        </button>
      </div>
    </form>
  );
}
