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
  
  const [footerColumns, setFooterColumns] = useState<{title: string, links: {label: string, url: string}[]}[]>(() => {
    try {
      return initialSettings.FOOTER_COLUMNS ? JSON.parse(initialSettings.FOOTER_COLUMNS) : [
        { title: 'Contact Us', links: [{ label: 'About Us', url: '/about' }, { label: 'Contact Us', url: '/contact' }] },
        { title: 'Account', links: [{ label: 'Shop', url: '/shop' }, { label: 'Checkout', url: '/checkout' }] }
      ];
    } catch {
      return [];
    }
  });
  
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
      FOOTER_COPYRIGHT: footerCopyright,
      FOOTER_COLUMNS: JSON.stringify(footerColumns)
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

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
          <label className="block text-base font-semibold text-gray-900 mb-4">Footer Columns & Links</label>
          <div className="space-y-6">
            {footerColumns.map((col, colIndex) => (
              <div key={colIndex} className="bg-white p-4 border rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <input type="text" placeholder="Column Title (e.g. Account)" value={col.title} onChange={e => {
                    const newCols = [...footerColumns];
                    newCols[colIndex].title = e.target.value;
                    setFooterColumns(newCols);
                  }} className="font-semibold px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                  <button type="button" onClick={() => setFooterColumns(footerColumns.filter((_, i) => i !== colIndex))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md text-sm font-medium">Remove Column</button>
                </div>
                
                <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                  {col.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="flex items-center gap-2">
                      <input type="text" placeholder="Label" value={link.label} onChange={e => {
                        const newCols = [...footerColumns];
                        newCols[colIndex].links[linkIndex].label = e.target.value;
                        setFooterColumns(newCols);
                      }} className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                      <input type="text" placeholder="URL" value={link.url} onChange={e => {
                        const newCols = [...footerColumns];
                        newCols[colIndex].links[linkIndex].url = e.target.value;
                        setFooterColumns(newCols);
                      }} className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                      <button type="button" onClick={() => {
                        const newCols = [...footerColumns];
                        newCols[colIndex].links = newCols[colIndex].links.filter((_, i) => i !== linkIndex);
                        setFooterColumns(newCols);
                      }} className="text-red-500 hover:text-red-700 p-1" title="Remove Link">
                        X
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const newCols = [...footerColumns];
                    newCols[colIndex].links.push({label: '', url: ''});
                    setFooterColumns(newCols);
                  }} className="text-xs text-blue-600 font-medium hover:underline mt-2 inline-block">
                    + Add Link to {col.title || 'Column'}
                  </button>
                </div>
              </div>
            ))}
            
            <button type="button" onClick={() => setFooterColumns([...footerColumns, {title: '', links: []}])} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add New Column
            </button>
          </div>
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