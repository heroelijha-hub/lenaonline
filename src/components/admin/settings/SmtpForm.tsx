'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function SmtpForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [smtpHost, setSmtpHost] = useState(initialSettings.SMTP_HOST || '');
  const [smtpPort, setSmtpPort] = useState(initialSettings.SMTP_PORT || '');
  const [smtpUser, setSmtpUser] = useState(initialSettings.SMTP_USER || '');
  const [smtpPass, setSmtpPass] = useState(initialSettings.SMTP_PASS || '');
  const [smtpFrom, setSmtpFrom] = useState(initialSettings.SMTP_FROM || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await updateSettingsBatch({
      SMTP_HOST: smtpHost,
      SMTP_PORT: smtpPort,
      SMTP_USER: smtpUser,
      SMTP_PASS: smtpPass,
      SMTP_FROM: smtpFrom
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{tSettings('nav_smtp') || 'Email server (SMTP)'}</h2>
        <p className="text-gray-500 mt-1">{tSettings('smtp_desc')}</p>
      </div>
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('smtp_host')}</label>
          <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" placeholder="smtp.gmail.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('smtp_port')}</label>
          <input type="text" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" placeholder="587" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('smtp_username')}</label>
          <input type="text" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('smtp_password')}</label>
          <input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" placeholder="••••••••" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('smtp_sender_email')}</label>
          <input type="text" value={smtpFrom} onChange={(e) => setSmtpFrom(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
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