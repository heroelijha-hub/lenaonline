'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { countWooCommerceProducts, importWooCommerceProductsBatch, importWooCommerceCategories } from '@/actions/woocommerce';

export default function WooCommerceImportModal() {
  const t = useTranslations('AdminProducts');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Progress states
  const [importingCategories, setImportingCategories] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [importedProducts, setImportedProducts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage(null);

    setImportedProducts(0);
    setTotalProducts(0);

    try {
      // 0. Import categories hierarchy
      setImportingCategories(true);
      const catRes = await importWooCommerceCategories(url, consumerKey, consumerSecret);
      setImportingCategories(false);

      if (!catRes.success) {
        setResultMessage({ type: 'error', text: t('import_error') + ': ' + catRes.message });
        setLoading(false);
        return;
      }

      // 1. Get total products
      const countRes = await countWooCommerceProducts(url, consumerKey, consumerSecret);
      if (!countRes.success || !countRes.total) {
        setResultMessage({ type: 'error', text: t('import_error') + ': ' + countRes.message });
        setLoading(false);
        return;
      }

      const total = countRes.total;
      setTotalProducts(total);
      
      if (total === 0) {
        setResultMessage({ type: 'success', text: t('import_success').replace('{count}', '0') });
        setLoading(false);
        return;
      }

      // 2. Import in batches to avoid Vercel timeout (1 item per page)
      const perPage = 1;
      const totalPages = Math.ceil(total / perPage);
      let totalImported = 0;

      for (let page = 1; page <= totalPages; page++) {
        // Dispatch custom event to prevent auto-logout during long imports
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-activity'));
        }
        
        const batchRes = await importWooCommerceProductsBatch(url, consumerKey, consumerSecret, page, perPage);
        
        if (!batchRes.success) {
          setResultMessage({ type: 'error', text: t('import_error') + ': ' + batchRes.message });
          setLoading(false);
          return;
        }

        totalImported += (batchRes.count || 0);
        setImportedProducts(totalImported);
      }

      setResultMessage({ type: 'success', text: t('import_success').replace('{count}', totalImported.toString()) });
      setTimeout(() => setIsOpen(false), 3000);
      
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

              {loading && importingCategories && (
                <div className="space-y-2">
                  <div className="flex justify-center text-sm font-medium text-orange-600">
                    <span>{t('syncing_categories')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-orange-600 h-2.5 rounded-full animate-pulse w-full"></div>
                  </div>
                </div>
              )}

              {loading && !importingCategories && totalProducts > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>Progression des produits...</span>
                    <span>{importedProducts} / {totalProducts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-orange-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, Math.round((importedProducts / totalProducts) * 100))}%` }}></div>
                  </div>
                </div>
              )}

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
