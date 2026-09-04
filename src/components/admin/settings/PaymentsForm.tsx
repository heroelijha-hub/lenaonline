'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function PaymentsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [enableStripe, setEnableStripe] = useState(initialSettings.ENABLE_STRIPE !== 'false');
  const [enablePaypal, setEnablePaypal] = useState(initialSettings.ENABLE_PAYPAL !== 'false');
  const [enableBankTransfer, setEnableBankTransfer] = useState(initialSettings.ENABLE_BANK_TRANSFER !== 'false');
  const [stripePublicKey, setStripePublicKey] = useState(initialSettings.STRIPE_PUBLIC_KEY || '');
  const [stripeSecretKey, setStripeSecretKey] = useState(initialSettings.STRIPE_SECRET_KEY || '');
  const [paypalClientId, setPaypalClientId] = useState(initialSettings.PAYPAL_CLIENT_ID || '');
  const [paypalSecret, setPaypalSecret] = useState(initialSettings.PAYPAL_SECRET || '');
  const [bankTransferIban, setBankTransferIban] = useState(initialSettings.BANK_TRANSFER_IBAN || '');
  const [bankTransferBic, setBankTransferBic] = useState(initialSettings.BANK_TRANSFER_BIC || '');
  const [bankTransferAccountHolder, setBankTransferAccountHolder] = useState(initialSettings.BANK_TRANSFER_ACCOUNT_HOLDER || '');
  const [bankTransferBankName, setBankTransferBankName] = useState(initialSettings.BANK_TRANSFER_BANK_NAME || '');
  const [bankTransferCheckoutMessage, setBankTransferCheckoutMessage] = useState(initialSettings.BANK_TRANSFER_CHECKOUT_MESSAGE || 'Veuillez effectuer le virement sur le compte ci-dessous.');
  const [bankTransferInstructions, setBankTransferInstructions] = useState(initialSettings.BANK_TRANSFER_INSTRUCTIONS || 'Your order will be processed upon payment receipt.');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await updateSettingsBatch({
      ENABLE_STRIPE: enableStripe.toString(),
      ENABLE_PAYPAL: enablePaypal.toString(),
      ENABLE_BANK_TRANSFER: enableBankTransfer.toString(),
      STRIPE_PUBLIC_KEY: stripePublicKey,
      STRIPE_SECRET_KEY: stripeSecretKey,
      PAYPAL_CLIENT_ID: paypalClientId,
      PAYPAL_SECRET: paypalSecret,
      BANK_TRANSFER_IBAN: bankTransferIban,
      BANK_TRANSFER_BIC: bankTransferBic,
      BANK_TRANSFER_ACCOUNT_HOLDER: bankTransferAccountHolder,
      BANK_TRANSFER_BANK_NAME: bankTransferBankName,
      BANK_TRANSFER_CHECKOUT_MESSAGE: bankTransferCheckoutMessage,
      BANK_TRANSFER_INSTRUCTIONS: bankTransferInstructions
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payments Configuration</h2>
        <p className="text-gray-500 mt-1">{tSettings('payment_enable_desc')}</p>
      </div>
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="md:col-span-2 flex items-center justify-between border-b pb-2 mb-4">
          <h4 className="text-md font-bold text-gray-900">{tSettings('stripe_config')}</h4>
          <div className="flex items-center gap-3">  <button type="button" role="switch" aria-checked={enableStripe} onClick={() => setEnableStripe(!enableStripe)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enableStripe ? "bg-blue-600" : "bg-gray-200"}`}>    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enableStripe ? "translate-x-5" : "translate-x-0"}`} />  </button>  <span className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setEnableStripe(!enableStripe)}>{tSettings('enable_this_mode')}</span></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('stripe_public_key')}</label>
          <input type="text" value={stripePublicKey} onChange={(e) => setStripePublicKey(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" placeholder="pk_test_..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('stripe_secret_key')}</label>
          <input type="password" value={stripeSecretKey} onChange={(e) => setStripeSecretKey(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" placeholder="sk_test_..." />
        </div>

        <div className="md:col-span-2 mt-4 flex items-center justify-between border-b pb-2 mb-4">
          <h4 className="text-md font-bold text-gray-900">{tSettings('paypal_config')}</h4>
          <div className="flex items-center gap-3">  <button type="button" role="switch" aria-checked={enablePaypal} onClick={() => setEnablePaypal(!enablePaypal)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enablePaypal ? "bg-blue-600" : "bg-gray-200"}`}>    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enablePaypal ? "translate-x-5" : "translate-x-0"}`} />  </button>  <span className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setEnablePaypal(!enablePaypal)}>{tSettings('enable_this_mode')}</span></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('paypal_client_id')}</label>
          <input type="text" value={paypalClientId} onChange={(e) => setPaypalClientId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('paypal_secret')}</label>
          <input type="password" value={paypalSecret} onChange={(e) => setPaypalSecret(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>

        <div className="md:col-span-2 mt-4 flex items-center justify-between border-b pb-2 mb-4">
          <h4 className="text-md font-bold text-gray-900">{tSettings('bank_transfer_config')}</h4>
          <div className="flex items-center gap-3">  <button type="button" role="switch" aria-checked={enableBankTransfer} onClick={() => setEnableBankTransfer(!enableBankTransfer)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enableBankTransfer ? "bg-blue-600" : "bg-gray-200"}`}>    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enableBankTransfer ? "translate-x-5" : "translate-x-0"}`} />  </button>  <span className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setEnableBankTransfer(!enableBankTransfer)}>{tSettings('enable_this_mode')}</span></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('iban')}</label>
          <input type="text" value={bankTransferIban} onChange={(e) => setBankTransferIban(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('bic_swift')}</label>
          <input type="text" value={bankTransferBic} onChange={(e) => setBankTransferBic(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('account_holder')}</label>
          <input type="text" value={bankTransferAccountHolder} onChange={(e) => setBankTransferAccountHolder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('bank_name')}</label>
          <input type="text" value={bankTransferBankName} onChange={(e) => setBankTransferBankName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('checkout_message')}</label>
          <textarea value={bankTransferCheckoutMessage} onChange={(e) => setBankTransferCheckoutMessage(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('instructions_client')}</label>
          <textarea value={bankTransferInstructions} onChange={(e) => setBankTransferInstructions(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
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