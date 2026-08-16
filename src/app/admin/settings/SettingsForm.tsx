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
  const [currencyPosition, setCurrencyPosition] = useState(initialSettings.currencyPosition || 'left');
  const [thousandSeparator, setThousandSeparator] = useState(initialSettings.thousandSeparator || ',');
  const [decimalSeparator, setDecimalSeparator] = useState(initialSettings.decimalSeparator || '.');
  const [enableBuyNow, setEnableBuyNow] = useState(initialSettings.ENABLE_BUY_NOW_BUTTON === 'true');
  const [chatEnabled, setChatEnabled] = useState(initialSettings.CHAT_ENABLED === 'true');
  const [chatStoreName, setChatStoreName] = useState(initialSettings.CHAT_STORE_NAME || 'Shopelios');
  const [chatStoreIcon, setChatStoreIcon] = useState(initialSettings.CHAT_STORE_ICON || '');
  
  // Tax settings
  const [taxIncludedInPrice, setTaxIncludedInPrice] = useState(initialSettings.TAX_INCLUDED_IN_PRICE === 'true');
  const [defaultVatRate, setDefaultVatRate] = useState(initialSettings.DEFAULT_VAT_RATE || '20');
  const [enableEuVat, setEnableEuVat] = useState(initialSettings.ENABLE_EU_VAT === 'true');

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
    
    await updateSetting('currencyPosition', currencyPosition);
    await updateSetting('thousandSeparator', thousandSeparator);
    await updateSetting('decimalSeparator', decimalSeparator);
    await updateSetting('ENABLE_BUY_NOW_BUTTON', enableBuyNow.toString());
    await updateSetting('CHAT_ENABLED', chatEnabled.toString());
    await updateSetting('CHAT_STORE_NAME', chatStoreName);
    await updateSetting('CHAT_STORE_ICON', chatStoreIcon);
    
    await updateSetting('TAX_INCLUDED_IN_PRICE', taxIncludedInPrice.toString());
    await updateSetting('DEFAULT_VAT_RATE', defaultVatRate);
    await updateSetting('ENABLE_EU_VAT', enableEuVat.toString());
    
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
            <p className="mt-2 text-xs text-gray-500">C'est la devise par défaut utilisée pour afficher les prix.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position du symbole</label>
            <select
              value={currencyPosition}
              onChange={(e) => setCurrencyPosition(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="left">Gauche (ex: $10)</option>
              <option value="right">Droite (ex: 10$)</option>
              <option value="left-space">Gauche avec espace (ex: $ 10)</option>
              <option value="right-space">Droite avec espace (ex: 10 $)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Séparateur des milliers</label>
            <select
              value={thousandSeparator}
              onChange={(e) => setThousandSeparator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Aucun (ex: 1000)</option>
              <option value=",">Virgule (ex: 1,000)</option>
              <option value=".">Point (ex: 1.000)</option>
              <option value=" ">Espace (ex: 1 000)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Séparateur décimal</label>
            <select
              value={decimalSeparator}
              onChange={(e) => setDecimalSeparator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value=".">Point (ex: 10.50)</option>
              <option value=",">Virgule (ex: 10,50)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Taxes & TVA</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="taxIncludedInPrice"
              checked={taxIncludedInPrice}
              onChange={(e) => setTaxIncludedInPrice(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="taxIncludedInPrice" className="text-sm font-medium text-gray-700 cursor-pointer">
              Les prix saisis dans le catalogue sont Toutes Taxes Comprises (TTC)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enableEuVat"
              checked={enableEuVat}
              onChange={(e) => setEnableEuVat(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="enableEuVat" className="text-sm font-medium text-gray-700 cursor-pointer">
              Appliquer la TVA dynamique selon les pays de l'Union Européenne (à venir au Checkout)
            </label>
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Taux de TVA par défaut (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={defaultVatRate}
              onChange={(e) => setDefaultVatRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ex: 20"
            />
            <p className="mt-2 text-xs text-gray-500">Taux appliqué si la TVA dynamique est désactivée ou si le pays du client est inconnu.</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fonctionnalités Boutique</h3>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enableBuyNow"
            checked={enableBuyNow}
            onChange={(e) => setEnableBuyNow(e.target.checked)}
            className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
          />
          <label htmlFor="enableBuyNow" className="text-sm font-medium text-gray-700 cursor-pointer">
            Activer le bouton "Buy Now" (Achat rapide) sur les pages produits
          </label>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres du Chat</h3>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="chatEnabled"
              checked={chatEnabled}
              onChange={(e) => setChatEnabled(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="chatEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
              Activer le module de Chat pour les clients
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la boutique (Chat)</label>
              <input
                type="text"
                value={chatStoreName}
                onChange={(e) => setChatStoreName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: Support Shopelios"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icône de la boutique (URL)</label>
              <input
                type="text"
                value={chatStoreIcon}
                onChange={(e) => setChatStoreIcon(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: /logo.png"
              />
            </div>
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
