'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function CookieConsent() {
  const t = useTranslations('CookieConsent');
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has already been given or declined
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowBanner(false);
    // You can trigger GA loading here or dispatch a custom event
    window.dispatchEvent(new Event('cookie_consent_accepted'));
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1 max-w-3xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('title')}</h3>
        <p className="text-sm text-gray-600">
          {t('message')}
        </p>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
        <button
          onClick={handleDecline}
          className="flex-1 md:flex-none px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          {t('decline')}
        </button>
        <button
          onClick={handleAccept}
          className="flex-1 md:flex-none px-6 py-2.5 rounded-md bg-[var(--theme-color)] text-white font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--theme-color)] shadow-sm"
        >
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
