'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

export default function FooterForm({ initialSettings, menus = [] }: { initialSettings: Record<string, string>, menus?: any[] }) {
  const tSettings = useTranslations('AdminSettings');
  const tHeader = useTranslations('AdminHeaderDesign');
  const router = useRouter();

  const [selectedTheme, setSelectedTheme] = useState(initialSettings.ACTIVE_THEME || 'default');
  
  const getVal = (key: string, fallback: string) => {
    if (selectedTheme === 'default') return initialSettings[key] || fallback;
    return initialSettings[`${selectedTheme}_${key}`] || initialSettings[key] || fallback;
  };
  
  const getBool = (key: string, fallback: boolean) => {
    const val = selectedTheme === 'default' ? initialSettings[key] : (initialSettings[`${selectedTheme}_${key}`] ?? initialSettings[key]);
    if (val === undefined) return fallback;
    return val !== 'false';
  };

  const parseColumns = (key: string) => {
    const val = getVal(key, '');
    try {
      if (val) return JSON.parse(val);
      return [
        { title: 'Contact Us', links: [{ label: 'About Us', url: '/about' }, { label: 'Contact Us', url: '/contact' }] },
        { title: 'Account', links: [{ label: 'Shop', url: '/shop' }, { label: 'Checkout', url: '/checkout' }] }
      ];
    } catch {
      return [];
    }
  };

  const [footerBgColor, setFooterBgColor] = useState(getVal('FOOTER_BG_COLOR', '#0B162C'));
  const [footerTextColor, setFooterTextColor] = useState(getVal('FOOTER_TEXT_COLOR', '#d1d5db'));
  const [footerDescription, setFooterDescription] = useState(getVal('FOOTER_DESCRIPTION', 'Unsere Verpflichtungen...'));
  const [footerShowAddress, setFooterShowAddress] = useState(getBool('FOOTER_SHOW_ADDRESS', true));
  const [footerShowEmail, setFooterShowEmail] = useState(getBool('FOOTER_SHOW_EMAIL', true));
  const [footerShowPhone, setFooterShowPhone] = useState(getBool('FOOTER_SHOW_PHONE', true));
  const [footerShowWhatsapp, setFooterShowWhatsapp] = useState(getBool('FOOTER_SHOW_WHATSAPP', false));
  const [footerSupportWhatsapp, setFooterSupportWhatsapp] = useState(getVal('FOOTER_SUPPORT_WHATSAPP', ''));
  
  const [footerAddress, setFooterAddress] = useState(getVal('FOOTER_ADDRESS_1', '2972 Westheimer Rd. Illinois 85486'));
  const [footerSupportEmail, setFooterSupportEmail] = useState(getVal('FOOTER_SUPPORT_EMAIL', initialSettings.HEADER_SUPPORT_EMAIL ?? 'support@mystore.com'));
  const [footerSupportPhone, setFooterSupportPhone] = useState(getVal('FOOTER_SUPPORT_PHONE', initialSettings.HEADER_SUPPORT_PHONE ?? '+08 9229 8228'));

  const [footerCopyright, setFooterCopyright] = useState(getVal('FOOTER_COPYRIGHT', '© 2026 My Store. All rights reserved.'));
  
  const [footerLogoImage, setFooterLogoImage] = useState(getVal('FOOTER_LOGO_IMAGE', ''));
  const [footerNewsletterTitle, setFooterNewsletterTitle] = useState(getVal('FOOTER_NEWSLETTER_TITLE', 'Newsletter'));
  const [footerNewsletterText, setFooterNewsletterText] = useState(getVal('FOOTER_NEWSLETTER_TEXT', 'Subscribe to our newsletter!'));
  const [footerNewsletterPlaceholder, setFooterNewsletterPlaceholder] = useState(getVal('FOOTER_NEWSLETTER_PLACEHOLDER', 'Enter your email'));
  
  const [footerColumns, setFooterColumns] = useState<{title: string, links: {label: string, url: string}[]}[]>(() => parseColumns('FOOTER_COLUMNS'));

  const [col2Title, setCol2Title] = useState(getVal('FOOTER_COL2_TITLE', 'Navigation'));
  const [col2MenuId, setCol2MenuId] = useState(getVal('FOOTER_COL2_MENU_ID', ''));
  const [col3Title, setCol3Title] = useState(getVal('FOOTER_COL3_TITLE', 'Informations'));
  const [col3MenuId, setCol3MenuId] = useState(getVal('FOOTER_COL3_MENU_ID', ''));
  const [col4Title, setCol4Title] = useState(getVal('FOOTER_COL4_TITLE', 'Contact'));
  const [col4MenuId, setCol4MenuId] = useState(getVal('FOOTER_COL4_MENU_ID', ''));

  useEffect(() => {
    setFooterBgColor(getVal('FOOTER_BG_COLOR', '#0B162C'));
    setFooterTextColor(getVal('FOOTER_TEXT_COLOR', '#d1d5db'));
    setFooterDescription(getVal('FOOTER_DESCRIPTION', 'Unsere Verpflichtungen...'));
    setFooterShowAddress(getBool('FOOTER_SHOW_ADDRESS', true));
    setFooterShowEmail(getBool('FOOTER_SHOW_EMAIL', true));
    setFooterShowPhone(getBool('FOOTER_SHOW_PHONE', true));
    setFooterShowWhatsapp(getBool('FOOTER_SHOW_WHATSAPP', false));
    setFooterAddress(getVal('FOOTER_ADDRESS_1', '2972 Westheimer Rd. Illinois 85486'));
    setFooterSupportEmail(getVal('FOOTER_SUPPORT_EMAIL', initialSettings.HEADER_SUPPORT_EMAIL ?? 'support@mystore.com'));
    setFooterSupportPhone(getVal('FOOTER_SUPPORT_PHONE', initialSettings.HEADER_SUPPORT_PHONE ?? '+08 9229 8228'));
    setFooterSupportWhatsapp(getVal('FOOTER_SUPPORT_WHATSAPP', ''));
    setFooterCopyright(getVal('FOOTER_COPYRIGHT', '© 2026 My Store. All rights reserved.'));
    setFooterLogoImage(getVal('FOOTER_LOGO_IMAGE', ''));
    setFooterNewsletterTitle(getVal('FOOTER_NEWSLETTER_TITLE', 'Newsletter'));
    setFooterNewsletterText(getVal('FOOTER_NEWSLETTER_TEXT', 'Subscribe to our newsletter!'));
    setFooterNewsletterPlaceholder(getVal('FOOTER_NEWSLETTER_PLACEHOLDER', 'Enter your email'));
    setFooterColumns(parseColumns('FOOTER_COLUMNS'));
    setCol2Title(getVal('FOOTER_COL2_TITLE', 'Navigation'));
    setCol2MenuId(getVal('FOOTER_COL2_MENU_ID', ''));
    setCol3Title(getVal('FOOTER_COL3_TITLE', 'Informations'));
    setCol3MenuId(getVal('FOOTER_COL3_MENU_ID', ''));
    setCol4Title(getVal('FOOTER_COL4_TITLE', 'Contact'));
    setCol4MenuId(getVal('FOOTER_COL4_MENU_ID', ''));
  }, [selectedTheme]);
  
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const prefix = selectedTheme === 'default' ? '' : `${selectedTheme}_`;
    
    await updateSettingsBatch({
      [`${prefix}FOOTER_BG_COLOR`]: footerBgColor,
      [`${prefix}FOOTER_TEXT_COLOR`]: footerTextColor,
      [`${prefix}FOOTER_DESCRIPTION`]: footerDescription,
      [`${prefix}FOOTER_SHOW_ADDRESS`]: footerShowAddress.toString(),
      [`${prefix}FOOTER_SHOW_EMAIL`]: footerShowEmail.toString(),
      [`${prefix}FOOTER_SHOW_PHONE`]: footerShowPhone.toString(),
      [`${prefix}FOOTER_SHOW_WHATSAPP`]: footerShowWhatsapp.toString(),
      [`${prefix}FOOTER_ADDRESS_1`]: footerAddress,
      [`${prefix}FOOTER_SUPPORT_EMAIL`]: footerSupportEmail,
      [`${prefix}FOOTER_SUPPORT_PHONE`]: footerSupportPhone,
      [`${prefix}FOOTER_SUPPORT_WHATSAPP`]: footerSupportWhatsapp,
      [`${prefix}FOOTER_COPYRIGHT`]: footerCopyright,
      [`${prefix}FOOTER_LOGO_IMAGE`]: footerLogoImage,
      [`${prefix}FOOTER_NEWSLETTER_TITLE`]: footerNewsletterTitle,
      [`${prefix}FOOTER_NEWSLETTER_TEXT`]: footerNewsletterText,
      [`${prefix}FOOTER_NEWSLETTER_PLACEHOLDER`]: footerNewsletterPlaceholder,
      [`${prefix}FOOTER_COLUMNS`]: JSON.stringify(footerColumns),
      [`${prefix}FOOTER_COL2_TITLE`]: col2Title,
      [`${prefix}FOOTER_COL2_MENU_ID`]: col2MenuId,
      [`${prefix}FOOTER_COL3_TITLE`]: col3Title,
      [`${prefix}FOOTER_COL3_MENU_ID`]: col3MenuId,
      [`${prefix}FOOTER_COL4_TITLE`]: col4Title,
      [`${prefix}FOOTER_COL4_MENU_ID`]: col4MenuId,
    });

    setMessage(tSettings('update_success') || 'Settings updated successfully');
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{tSettings('nav_footer') || 'Footer'}</h2>
        <div className="mt-4 md:mt-0 flex items-center bg-gray-50 border border-gray-200 rounded-lg p-2">
          <label className="text-sm font-semibold text-gray-700 mr-3">{tHeader('edit_theme') || 'Edit theme:'}</label>
          <select 
            value={selectedTheme} 
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="default">Par défaut (Default)</option>
            <option value="moto">Moto</option>
          </select>
        </div>
      </div>
      
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      {selectedTheme !== 'default' && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
          {tHeader('edit_theme_desc') || 'You are editing the settings specifically for this theme. These settings will override the default settings when this theme is active.'}
        </div>
      )}

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('bg_color_label') || 'Background Color'}</label>
            <div className="relative w-10 h-10">  <input type="color" value={footerBgColor} onChange={(e) => setFooterBgColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />  <div className="w-10 h-10 rounded-xl shadow-sm border border-gray-200" style={{ backgroundColor: footerBgColor }} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('text_color_label') || 'Text Color'}</label>
            <div className="relative w-10 h-10">  <input type="color" value={footerTextColor} onChange={(e) => setFooterTextColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />  <div className="w-10 h-10 rounded-xl shadow-sm border border-gray-200" style={{ backgroundColor: footerTextColor }} /></div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{tSettings('col_1_logo_info') || 'Column 1: Logo & Info'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('footer_logo_label') || 'Footer Logo'}</label>
              <div className="flex items-center gap-4">
                {footerLogoImage && (
                  <div className="w-32 p-2 bg-gray-100 rounded border">
                    <img src={footerLogoImage} alt="Footer logo" className="max-h-12 object-contain" />
                  </div>
                )}
                <button type="button" onClick={() => setShowMediaModal(true)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {footerLogoImage ? (tSettings('change_logo') || 'Change Logo') : (tSettings('select_logo') || 'Select Logo')}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('footer_desc_label') || 'Description'}</label>
              <textarea value={footerDescription} onChange={(e) => setFooterDescription(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <button type="button" role="switch" aria-checked={footerShowAddress} onClick={() => setFooterShowAddress(!footerShowAddress)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${footerShowAddress ? "bg-blue-600" : "bg-gray-200"}`}>    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${footerShowAddress ? "translate-x-5" : "translate-x-0"}`} />  </button>
                  <span className="text-sm cursor-pointer" onClick={() => setFooterShowAddress(!footerShowAddress)}>{tSettings('show_address') || 'Show Address'}</span>
                </div>
                {footerShowAddress && (
                  <input type="text" value={footerAddress} onChange={(e) => setFooterAddress(e.target.value)} placeholder="Address" className="flex-1 px-4 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <button type="button" role="switch" aria-checked={footerShowEmail} onClick={() => setFooterShowEmail(!footerShowEmail)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${footerShowEmail ? "bg-blue-600" : "bg-gray-200"}`}>    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${footerShowEmail ? "translate-x-5" : "translate-x-0"}`} />  </button>
                  <span className="text-sm cursor-pointer" onClick={() => setFooterShowEmail(!footerShowEmail)}>{tSettings('show_email') || 'Show Email'}</span>
                </div>
                {footerShowEmail && (
                  <input type="email" value={footerSupportEmail} onChange={(e) => setFooterSupportEmail(e.target.value)} placeholder="Email" className="flex-1 px-4 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <button type="button" role="switch" aria-checked={footerShowPhone} onClick={() => setFooterShowPhone(!footerShowPhone)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${footerShowPhone ? "bg-blue-600" : "bg-gray-200"}`}>    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${footerShowPhone ? "translate-x-5" : "translate-x-0"}`} />  </button>
                  <span className="text-sm cursor-pointer" onClick={() => setFooterShowPhone(!footerShowPhone)}>{tSettings('show_phone') || 'Show Phone'}</span>
                </div>
                {footerShowPhone && (
                  <input type="text" value={footerSupportPhone} onChange={(e) => setFooterSupportPhone(e.target.value)} placeholder="Phone" className="flex-1 px-4 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <button type="button" role="switch" aria-checked={footerShowWhatsapp} onClick={() => setFooterShowWhatsapp(!footerShowWhatsapp)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${footerShowWhatsapp ? "bg-blue-600" : "bg-gray-200"}`}>    <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${footerShowWhatsapp ? "translate-x-5" : "translate-x-0"}`} />  </button>
                  <span className="text-sm cursor-pointer" onClick={() => setFooterShowWhatsapp(!footerShowWhatsapp)}>Show WhatsApp</span>
                </div>
                {footerShowWhatsapp && (
                  <input type="text" value={footerSupportWhatsapp} onChange={(e) => setFooterSupportWhatsapp(e.target.value)} placeholder="WhatsApp (e.g. 33612345678)" className="flex-1 px-4 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{tSettings('col_5_newsletter') || 'Column 5: Newsletter'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('newsletter_title_label') || 'Title'}</label>
              <input type="text" value={footerNewsletterTitle} onChange={(e) => setFooterNewsletterTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('newsletter_desc_label') || 'Description / Text'}</label>
              <textarea value={footerNewsletterText} onChange={(e) => setFooterNewsletterText(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{tSettings('newsletter_placeholder_label') || 'Input Placeholder'}</label>
              <input type="text" value={footerNewsletterPlaceholder} onChange={(e) => setFooterNewsletterPlaceholder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
          <label className="block text-base font-semibold text-gray-900 mb-4">{tSettings('footer_columns_links') || 'Footer Columns & Links'}</label>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 border rounded-md shadow-sm">
              <div className="col-span-full font-bold mb-2 text-gray-800">{tSettings('column') || 'Column'} 2</div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{tSettings('column_title') || 'Column Title'}</label>
                <input type="text" value={col2Title} onChange={(e) => setCol2Title(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{tSettings('assigned_menu') || 'Assigned Menu'}</label>
                <select value={col2MenuId} onChange={(e) => setCol2MenuId(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm">
                  <option value="">{tSettings('no_menu') || '-- No menu --'}</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 border rounded-md shadow-sm">
              <div className="col-span-full font-bold mb-2 text-gray-800">{tSettings('column') || 'Column'} 3</div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{tSettings('column_title') || 'Column Title'}</label>
                <input type="text" value={col3Title} onChange={(e) => setCol3Title(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{tSettings('assigned_menu') || 'Assigned Menu'}</label>
                <select value={col3MenuId} onChange={(e) => setCol3MenuId(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm">
                  <option value="">{tSettings('no_menu') || '-- No menu --'}</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 border rounded-md shadow-sm">
              <div className="col-span-full font-bold mb-2 text-gray-800">{tSettings('column') || 'Column'} 4</div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{tSettings('column_title') || 'Column Title'}</label>
                <input type="text" value={col4Title} onChange={(e) => setCol4Title(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{tSettings('assigned_menu') || 'Assigned Menu'}</label>
                <select value={col4MenuId} onChange={(e) => setCol4MenuId(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm">
                  <option value="">{tSettings('no_menu') || '-- No menu --'}</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <details className="cursor-pointer">
                <summary className="text-sm font-semibold text-gray-700 mb-2 hover:text-blue-600">{tSettings('advanced_mode') || 'Advanced Mode (Old column system)'}</summary>
                <div className="space-y-6 mt-4">
                  {footerColumns.map((col, colIndex) => (
                    <div key={colIndex} className="bg-white p-4 border rounded-md shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-center mb-3">
                        <input type="text" placeholder={tSettings('column_title_ex') || "Column Title (e.g. Account)"} value={col.title} onChange={e => {
                          const newCols = [...footerColumns];
                          newCols[colIndex].title = e.target.value;
                          setFooterColumns(newCols);
                        }} className="font-semibold px-3 py-1.5 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                        <button type="button" onClick={() => setFooterColumns(footerColumns.filter((_, i) => i !== colIndex))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md text-sm font-medium">{tSettings('remove_column') || 'Remove Column'}</button>
                      </div>
                      
                      <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                        {col.links.map((link, linkIndex) => (
                          <div key={linkIndex} className="flex items-center gap-2">
                            <input type="text" placeholder={tSettings('label_ex') || "Label"} value={link.label} onChange={e => {
                              const newCols = [...footerColumns];
                              newCols[colIndex].links[linkIndex].label = e.target.value;
                              setFooterColumns(newCols);
                            }} className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 text-sm" />
                            <input type="text" placeholder={tSettings('url_ex') || "URL"} value={link.url} onChange={e => {
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
                          + {tSettings('add_link_to') || 'Add Link to'} {col.title || 'Column'}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={() => setFooterColumns([...footerColumns, {title: '', links: []}])} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {tSettings('add_new_column') || 'Add New Column'}
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors">
          {isLoading ? tSettings('saving') || 'Saving...' : (tSettings('save_changes') || 'Save changes')}
        </button>
      </div>
      
      {showMediaModal && (
        <MediaPickerModal 
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => {
            setFooterLogoImage(url);
            setShowMediaModal(false);
          }}
        />
      )}
    </form>
  );
}
