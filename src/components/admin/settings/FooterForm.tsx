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
            <div className="relative w-10 h-10">  <input type="color" value={footerBgColor} onChange={(e) => setFooterBgColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />  <div className="w-10 h-10 rounded-xl shadow-sm border border-gray-200" style={{ backgroundColor: footerBgColor }} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <div className="relative w-10 h-10">  <input type="color" value={footerTextColor} onChange={(e) => setFooterTextColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />  <div className="w-10 h-10 rounded-xl shadow-sm border border-gray-200" style={{ backgroundColor: footerTextColor }} /></div>
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
          <div className="flex items-center gap-3">  <button type="button" role="switch" aria-checked={footerShowAddress} onClick={() => setFooterShowAddress(!footerShowAddress)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${footerShowAddress ? "bg-blue-600" : "bg-gray-200"}`}>    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${footerShowAddress ? "translate-x-5" : "translate-x-0"}`} />  </button>  <span className="text-sm cursor-pointer" onClick={() => setFooterShowAddress(!footerShowAddress)}>Show Address</span></div>
          <div className="flex items-center gap-3">  <button type="button" role="switch" aria-checked={footerShowEmail} onClick={() => setFooterShowEmail(!footerShowEmail)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${footerShowEmail ? "bg-blue-600" : "bg-gray-200"}`}>    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${footerShowEmail ? "translate-x-5" : "translate-x-0"}`} />  </button>  <span className="text-sm cursor-pointer" onClick={() => setFooterShowEmail(!footerShowEmail)}>Show Email</span></div>
          <div className="flex items-center gap-3">  <button type="button" role="switch" aria-checked={footerShowPhone} onClick={() => setFooterShowPhone(!footerShowPhone)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${footerShowPhone ? "bg-blue-600" : "bg-gray-200"}`}>    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${footerShowPhone ? "translate-x-5" : "translate-x-0"}`} />  </button>  <span className="text-sm cursor-pointer" onClick={() => setFooterShowPhone(!footerShowPhone)}>Show Phone</span></div>
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