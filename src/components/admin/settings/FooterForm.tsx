'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function FooterForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [footerBgColor, setFooterBgColor] = useState(initialSettings.FOOTER_BG_COLOR || '#0B162C');
  const [footerTextColor, setFooterTextColor] = useState(initialSettings.FOOTER_TEXT_COLOR || '#d1d5db');
  const [footerDescription, setFooterDescription] = useState(initialSettings.FOOTER_DESCRIPTION || 'Unsere Verpflichtungen...');
  const [footerShowAddress, setFooterShowAddress] = useState(initialSettings.FOOTER_SHOW_ADDRESS !== 'false');
  const [footerShowEmail, setFooterShowEmail] = useState(initialSettings.FOOTER_SHOW_EMAIL !== 'false');
  const [footerShowPhone, setFooterShowPhone] = useState(initialSettings.FOOTER_SHOW_PHONE !== 'false');
  const [footerCopyright, setFooterCopyright] = useState(initialSettings.FOOTER_COPYRIGHT || '© 2026 My Store. All rights reserved.');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await updateSettingsBatch({
      FOOTER_BG_COLOR: footerBgColor,
      FOOTER_TEXT_COLOR: footerTextColor,
      FOOTER_DESCRIPTION: footerDescription,
      FOOTER_SHOW_ADDRESS: footerShowAddress.toString(),
      FOOTER_SHOW_EMAIL: footerShowEmail.toString(),
      FOOTER_SHOW_PHONE: footerShowPhone.toString(),
      FOOTER_COPYRIGHT: footerCopyright
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Footer Settings</h2>
      </div>
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
            <input type="color" value={footerBgColor} onChange={(e) => setFooterBgColor(e.target.value)} className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <input type="color" value={footerTextColor} onChange={(e) => setFooterTextColor(e.target.value)} className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea value={footerDescription} onChange={(e) => setFooterDescription(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Copyright</label>
          <input type="text" value={footerCopyright} onChange={(e) => setFooterCopyright(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={footerShowAddress} onChange={(e) => setFooterShowAddress(e.target.checked)} className="w-4 h-4 text-orange-600 rounded" />
            <span className="text-sm">Show Address</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={footerShowEmail} onChange={(e) => setFooterShowEmail(e.target.checked)} className="w-4 h-4 text-orange-600 rounded" />
            <span className="text-sm">Show Email</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={footerShowPhone} onChange={(e) => setFooterShowPhone(e.target.checked)} className="w-4 h-4 text-orange-600 rounded" />
            <span className="text-sm">Show Phone</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors">
          {isLoading ? tSettings('saving') : 'Save changes'}
        </button>
      </div>
    </form>
  );
}