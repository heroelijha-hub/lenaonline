'use client';

import { useState } from 'react';
import { updateSetting } from '@/actions/settings';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
  { code: 'XOF', symbol: 'CFA', name: 'Franc CFA' },
];

export default function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [currency, setCurrency] = useState(initialSettings.currency || 'USD');
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
    
    setIsLoading(false);
    setMessage('Paramètres mis à jour avec succès.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          {message}
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres Régionaux</h3>
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
            <p className="mt-2 text-xs text-gray-500">C'est la devise par défaut utilisée pour afficher les prix dans la boutique.</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition disabled:opacity-50"
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </form>
  );
}
