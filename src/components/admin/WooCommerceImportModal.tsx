'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { importWooCommerceProducts } from '@/actions/woocommerce';

export default function WooCommerceImportModal() {
  const t = useTranslations('AdminProducts');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage(null);

    try {
      const res = await importWooCommerceProducts(url, consumerKey, consumerSecret);
      if (res.success) {
        setResultMessage({ type: 'success', text: t('import_success').replace('{count}', res.count?.toString() || '0') });
        // Optional: auto close after a few seconds
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        setResultMessage({ type: 'error', text: t('import_error') + ': ' + res.message });
      }
    } catch (error: any) {
      setResultMessage({ type: 'error', text: t('import_error') + ': ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        <span>{t('import_woo_btn')}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <button 
              onClick={() => !loading && setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('import_woo_title')}</h2>
            <p className="text-sm text-gray-500 mb-6">{t('import_woo_desc')}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('import_woo_url')}</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://votreboutique.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('import_woo_key')}</label>
                <input 
                  type="text" 
                  required
                  placeholder="ck_..."
                  value={consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('import_woo_secret')}</label>
                <input 
                  type="password" 
                  required
                  placeholder="cs_..."
                  value={consumerSecret}
                  onChange={(e) => setConsumerSecret(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={loading}
                />
              </div>

              {resultMessage && (
                <div className={`p-3 rounded-lg text-sm ${resultMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {resultMessage.text}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || !url || !consumerKey || !consumerSecret}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('import_woo_loading')}
                  </>
                ) : (
                  t('import_woo_submit')
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
