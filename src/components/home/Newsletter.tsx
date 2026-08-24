'use client';

import { useState } from 'react';
import { submitNewsletter } from '@/actions/contact';
import { useTranslations } from 'next-intl';
import DOMPurify from 'dompurify';

export default function Newsletter({ config }: { config?: any }) {
  const t = useTranslations('Home');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const getResponsiveVars = (baseKey: string, defaultSizes: { m: string, t: string, d: string }) => {
    return {
      '--sz-m': config?.[`${baseKey}_SIZE_MOBILE`] || defaultSizes.m,
      '--sz-t': config?.[`${baseKey}_SIZE_TABLET`] || defaultSizes.t,
      '--sz-d': config?.[`${baseKey}_SIZE_DESKTOP`] || defaultSizes.d,
    } as React.CSSProperties;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const res = await submitNewsletter(formData);
    
    if (res.error) {
      setStatus('error');
      setMessage(res.error);
    } else if (res.success) {
      setStatus('success');
      setMessage(res.message || t('success_msg'));
      e.currentTarget.reset();
    }
  };
  return (
    <div className="w-full border-t border-gray-200 mt-8 font-sans">
      <section className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Text */}
        <div className="flex-1">
          <h2 
            className="font-bold text-gray-900 mb-2 text-[length:var(--sz-m)] md:text-[length:var(--sz-t)] lg:text-[length:var(--sz-d)]"
            style={getResponsiveVars('title', {m: '24px', t: '24px', d: '24px'})}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(config?.title || t.raw('newsletter_title')) }}
          />
          <p className="text-gray-500 text-sm">
            {t('newsletter_desc')}
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 w-full max-w-lg">
          {status === 'success' ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col w-full gap-2">
              <div className="flex w-full">
                <input 
                  type="email" 
                  name="email"
                  placeholder={t('email_placeholder')} 
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-l-md px-4 py-3 h-12 text-sm text-gray-700 outline-none focus:border-orange-300 transition"
                  required
                />
                <button 
                  type="submit"
                  disabled={status === 'loading'} 
                  className="bg-[#FF5C00] hover:bg-[#E55300] text-white font-bold px-8 h-12 rounded-r-md transition shadow-sm disabled:opacity-50"
                >
                  {status === 'loading' ? '...' : t('subscribe')}
                </button>
              </div>
              {status === 'error' && <div className="text-red-500 text-sm mt-1">{message}</div>}
            </form>
          )}
        </div>

      </section>
    </div>
  );
}
