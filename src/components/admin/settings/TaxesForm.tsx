'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function TaxesForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [taxIncludedInPrice, setTaxIncludedInPrice] = useState(initialSettings.TAX_INCLUDED_IN_PRICE === 'true');
  const [enableEuVat, setEnableEuVat] = useState(initialSettings.ENABLE_EU_VAT === 'true');
  const [defaultVatRate, setDefaultVatRate] = useState(initialSettings.DEFAULT_VAT_RATE || '20');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await updateSettingsBatch({
      TAX_INCLUDED_IN_PRICE: taxIncludedInPrice.toString(),
      ENABLE_EU_VAT: enableEuVat.toString(),
      DEFAULT_VAT_RATE: defaultVatRate
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Taxes and VAT</h2>
        <p className="text-gray-500 mt-1">Settings for this category only.</p>
      </div>
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <button type="button" role="switch" aria-checked={taxIncludedInPrice} onClick={() => setTaxIncludedInPrice(!taxIncludedInPrice)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${taxIncludedInPrice ? "bg-blue-600" : "bg-gray-200"}`}>  <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${taxIncludedInPrice ? "translate-x-5" : "translate-x-0"}`} /></button><span className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setTaxIncludedInPrice(!taxIncludedInPrice)}>{tSettings('tax_inclusive')}</span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" role="switch" aria-checked={enableEuVat} onClick={() => setEnableEuVat(!enableEuVat)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enableEuVat ? "bg-blue-600" : "bg-gray-200"}`}>  <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enableEuVat ? "translate-x-5" : "translate-x-0"}`} /></button><span className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setEnableEuVat(!enableEuVat)}>{tSettings('dynamic_eu_vat')}</span>
        </div>
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('default_vat_rate')}</label>
          <input type="number" step="0.1" min="0" value={defaultVatRate} onChange={(e) => setDefaultVatRate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
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