'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
  { code: 'XOF', symbol: 'CFA', name: 'Franc CFA' },
];

export default function RegionalForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const t = useTranslations('Admin');
  const router = useRouter();
  
  const [currency, setCurrency] = useState(initialSettings.currency || 'USD');
  const [currencyPosition, setCurrencyPosition] = useState(initialSettings.currencyPosition || 'left');
  const [thousandSeparator, setThousandSeparator] = useState(initialSettings.thousandSeparator || ',');
  const [decimalSeparator, setDecimalSeparator] = useState(initialSettings.decimalSeparator || '.');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const settingsMap: Record<string, string> = {
      currencyPosition,
      thousandSeparator,
      decimalSeparator
    };

    const selectedCurr = CURRENCIES.find(c => c.code === currency);
    if (selectedCurr) {
      settingsMap['currency'] = selectedCurr.code;
      settingsMap['currencySymbol'] = selectedCurr.symbol;
    }

    await updateSettingsBatch(settingsMap);

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{tSettings('nav_regional') || 'Regional and currency'}</h2>
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
            <label className="block text-sm font-medium text-gray-700">{t("main_currency")}</label>
          </div>
          <div className="md:w-2/3">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <label className="block text-sm font-medium text-gray-700">{t("symbol_position")}</label>
          </div>
          <div className="md:w-2/3">
            <select
              value={currencyPosition}
              onChange={(e) => setCurrencyPosition(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="left">Left (ex: $10)</option>
              <option value="right">{t("right_ex")}</option>
              <option value="left-space">{t("left_space_ex")}</option>
              <option value="right-space">{t("right_space_ex")}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <label className="block text-sm font-medium text-gray-700">{tSettings('thousand_separator')}</label>
          </div>
          <div className="md:w-2/3">
            <select
              value={thousandSeparator}
              onChange={(e) => setThousandSeparator(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t("none_ex")}</option>
              <option value=",">{t("comma_ex")}</option>
              <option value=".">{t("dot_ex_thousand")}</option>
              <option value=" ">{t("space_ex")}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between pb-2">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <label className="block text-sm font-medium text-gray-700">{tSettings('decimal_separator')}</label>
          </div>
          <div className="md:w-2/3">
            <select
              value={decimalSeparator}
              onChange={(e) => setDecimalSeparator(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value=".">{t("dot_ex_decimal")}</option>
              <option value=",">{t("comma_ex_decimal")}</option>
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
