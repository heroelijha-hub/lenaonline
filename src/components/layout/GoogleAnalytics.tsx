'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function GoogleAnalytics({ gaId }: { gaId?: string }) {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Check initial consent state
    const consent = localStorage.getItem('cookie_consent');
    if (consent === 'true') {
      setConsentGiven(true);
    }

    // Listen for custom event from CookieConsent component
    const handleConsent = () => {
      setConsentGiven(true);
    };

    window.addEventListener('cookie_consent_accepted', handleConsent);

    return () => {
      window.removeEventListener('cookie_consent_accepted', handleConsent);
    };
  }, []);

  if (!gaId || !consentGiven) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
