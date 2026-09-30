'use client';

import { useState } from 'react';
import { submitContactMessage } from '@/actions/contact';
import { useTranslations } from 'next-intl';

export default function ContactForm({ phonePlaceholder }: { phonePlaceholder?: string }) {
  const t = useTranslations('Contact');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('loading');
    setMessage('');
    
    const formData = new FormData(form);
    const res = await submitContactMessage(formData);
    
    if (res.error) {
      setStatus('error');
      setMessage(t('error_sending'));
    } else if (res.success) {
      setStatus('success');
      setMessage(t('success_sending'));
      form.reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'success' && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input 
            type="text" 
            name="name"
            required
            placeholder={t('name_placeholder')} 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-orange-500 focus:border-orange-500" 
          />
        </div>
        <div>
          <input 
            type="email" 
            name="email"
            required
            placeholder="@" 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-orange-500 focus:border-orange-500" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input 
            type="tel" 
            name="phone"
            placeholder={phonePlaceholder || t('phone_placeholder')} 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-orange-500 focus:border-orange-500" 
          />
        </div>
        <div>
          <select 
            name="subject"
            required
            defaultValue=""
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-orange-500 focus:border-orange-500 text-gray-700" 
          >
            <option value="" disabled>{t('subject_placeholder')}</option>
            <option value={t('subject_order_return')}>{t('subject_order_return')}</option>
            <option value={t('subject_refund')}>{t('subject_refund')}</option>
            <option value={t('subject_info')}>{t('subject_info')}</option>
          </select>
        </div>
      </div>

      <div>
        <textarea 
          name="message"
          required
          placeholder={t('message_placeholder')} 
          rows={6}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-orange-500 focus:border-orange-500" 
        ></textarea>
      </div>

      <div>
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded transition-colors mt-2 disabled:opacity-50"
        >
          {status === 'loading' ? t('sending') : t('send_btn')}
        </button>
      </div>
    </form>
  );
}
