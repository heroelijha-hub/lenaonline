'use client';
import { useTranslations } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { updateSetting } from '@/actions/settings';
import { uploadImage, getMinimalProducts } from '@/actions/admin';
import Cookies from 'js-cookie';

export type SectionType = 'Hero' | 'BestDeals' | 'BestSeller' | 'LatestBlogs' | 'Newsletter' | 'PromoBanners' | 'ProductGrid';

export interface SectionConfig {
  id: string;
  type: SectionType;
  name: string;
  enabled: boolean;
  settings: any;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'sec_1', type: 'Hero', name: 'Main Header (Hero)', enabled: true, settings: {} },
  { id: 'sec_2', type: 'BestDeals', name: "Today's Best Deals", enabled: true, settings: { title: "Today's Best Deals", countdown: '2026-12-31T23:59:59', filterType: 'ON_SALE', categoryId: '' } },
  { id: 'sec_3', type: 'ProductGrid', name: 'New section (ProductGrid)', enabled: true, settings: { title: "Featured Products", filterType: 'LATEST', categoryId: '' } },
  { id: 'sec_4', type: 'BestSeller', name: 'Best Sellers', enabled: true, settings: { title: "Best Seller", filterType: 'POPULAR', categoryId: '' } },
  { id: 'sec_5', type: 'LatestBlogs', name: 'Latest Blog Articles', enabled: true, settings: { title: "Latest Blogs" } },
  { id: 'sec_6', type: 'Newsletter', name: 'Newsletter Subscription', enabled: true, settings: {} }
];

export default function LandingForm({ initialSettings, categories }: { initialSettings: Record<string, string>, categories: any[] }) {
  const t = useTranslations('AdminLanding');

  const [sections, setSections] = useState<SectionConfig[]>(() => {
    try {
      if (initialSettings.HOMEPAGE_LAYOUT) {
        return JSON.parse(initialSettings.HOMEPAGE_LAYOUT);
      }
      return DEFAULT_SECTIONS;
    } catch {
      return DEFAULT_SECTIONS;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [globalFont, setGlobalFont] = useState(initialSettings.GLOBAL_FONT_FAMILY || 'Inter');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    getMinimalProducts().then(setAllProducts).catch(console.error);
  }, []);

  const iframeRef = useRef<HTMLIFrameElement>(null);


  // Sync to cookie for preview iframe
  useEffect(() => {
    Cookies.set('preview_layout', JSON.stringify(sections), { path: '/' });
    Cookies.set('preview_font', globalFont, { path: '/' });
    
    // Debounce iframe reload
    const timer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.location.reload();
      }
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(timer);
  }, [sections, globalFont]);

  // Listen for messages from iframe (PreviewSectionWrapper)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if needed, but for now we accept all since it's same-origin usually
      if (event.data && event.data.type === 'EDIT_SECTION') {
        if (event.data.sectionId) {
          setEditingId(event.data.sectionId);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      await updateSetting('HOMEPAGE_LAYOUT', JSON.stringify(sections));
      await updateSetting('GLOBAL_FONT_FAMILY', globalFont);
      setMessage(t('update_success'));
    } catch (e) {
      setMessage(t('update_failed'));
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const moveSection = (index: number, direction: 'UP' | 'DOWN') => {
    const newSections = [...sections];
    if (direction === 'UP' && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    } else if (direction === 'DOWN' && index < newSections.length - 1) {
      [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
    }
    setSections(newSections);
  };

  const toggleSection = (index: number) => {
    const newSections = [...sections];
    newSections[index].enabled = !newSections[index].enabled;
    setSections(newSections);
  };

  const removeSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const duplicateSection = (index: number) => {
    const original = sections[index];
    const newSec: SectionConfig = {
      ...original,
      id: 'sec_' + Date.now(),
      name: `${original.name || original.type} (Copie)`,
      settings: JSON.parse(JSON.stringify(original.settings)) // Deep copy settings
    };
    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSec);
    setSections(newSections);
  };

  const updateSectionSettings = (id: string, key: string, value: any) => {
    setSections(sections.map(s => {
      if (s.id === id) {
        return { ...s, settings: { ...s.settings, [key]: value } };
      }
      return s;
    }));
  };

  const updateSectionName = (id: string, name: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, name } : s));
  };

  const handleUpload = async (id: string, key: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = await uploadImage(formData);
      if (url) {
        updateSectionSettings(id, key, url);
      }
    } catch (e) {
      console.error("Upload error", e);
    }
  };

  const renderResponsiveInput = (section: SectionConfig, label: string, baseKey: string, placeholder: string, colorKey?: string, defaultColor?: string) => {
    const sizeKey = `${baseKey}_SIZE_${previewMode.toUpperCase()}`;
    return (
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-medium">{label}</label>
          <div className="flex items-center gap-1">
            {colorKey && (
              <div className="relative w-[18px] h-[18px] rounded-full overflow-hidden border border-gray-300 shadow-sm shrink-0 cursor-pointer" title="Couleur du texte">
                <input 
                  type="color" 
                  value={section.settings[colorKey] || defaultColor || '#000000'} 
                  onChange={e => updateSectionSettings(section.id, colorKey, e.target.value)} 
                  className="absolute -top-1 -left-1 w-8 h-8 cursor-pointer border-0 p-0" 
                />
              </div>
            )}
            <span className="text-[9px] text-gray-500 font-medium bg-gray-100 px-1 rounded uppercase tracking-wider" title={`Taille pour ${previewMode}`}>
              {previewMode}
            </span>
            <input 
              type="text" 
              value={section.settings[sizeKey] || ''} 
              onChange={e => updateSectionSettings(section.id, sizeKey, e.target.value)} 
              className="w-14 border rounded px-1 py-[1px] text-[10px] text-center focus:ring-1 focus:ring-orange-500" 
              placeholder="ex: 32px" 
            />
          </div>
        </div>
        <input 
          type="text" 
          value={section.settings[baseKey] || ''} 
          onChange={e => updateSectionSettings(section.id, baseKey, e.target.value)} 
          className="w-full border rounded px-2 py-1 text-sm focus:border-orange-500 outline-none" 
          placeholder={placeholder} 
        />
      </div>
    );
  };

  const renderHeroBlockConfig = (section: SectionConfig, blockNum: number, prefix: string = 'HERO') => {
    return (
      <div className="border-t border-gray-200 mt-3 pt-3">
        <h5 className="font-bold text-sm mb-2 text-red-600">Design, Links & Media</h5>
        <label className="block text-[11px] font-medium mb-1">Redirect Link (URL)</label>
        <input type="text" value={section.settings[`${prefix}_${blockNum}_LINK`] || ''} onChange={e => updateSectionSettings(section.id, `${prefix}_${blockNum}_LINK`, e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-3" placeholder="/product/..." />
        
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <input type="checkbox" checked={section.settings[`${prefix}_${blockNum}_SHOW_IMAGE`] !== 'false'} onChange={e => updateSectionSettings(section.id, `${prefix}_${blockNum}_SHOW_IMAGE`, e.target.checked ? 'true' : 'false')} />
            <label className="text-[11px] font-bold text-red-600">Afficher l'Image Principale</label>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <input type="checkbox" checked={section.settings[`${prefix}_${blockNum}_SHOW_BG_IMAGE`] !== 'false'} onChange={e => updateSectionSettings(section.id, `${prefix}_${blockNum}_SHOW_BG_IMAGE`, e.target.checked ? 'true' : 'false')} />
            <label className="text-[11px] font-bold text-red-600">Afficher l'Image de Fond (BG)</label>
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1 text-red-600">Image Principale</label>
            <label className="cursor-pointer bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-100 text-[11px] font-semibold block text-center mt-1 transition">
              Cliquez ici pour uploader
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(section.id, `${prefix}_${blockNum}_IMAGE`, e.target.files[0])} className="hidden" />
            </label>
            {section.settings[`${prefix}_${blockNum}_IMAGE`] && <div className="mt-1 flex items-center justify-between bg-gray-50 p-1 border rounded"><img src={section.settings[`${prefix}_${blockNum}_IMAGE`]} className="h-6 object-contain" /><button onClick={() => updateSectionSettings(section.id, `${prefix}_${blockNum}_IMAGE`, '')} className="text-red-500 text-xs px-1">&times;</button></div>}
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1 text-red-600">Image de Fond (BG)</label>
            <label className="cursor-pointer bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-100 text-[11px] font-semibold block text-center mt-1 transition">
              Cliquez ici pour uploader
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(section.id, `${prefix}_${blockNum}_BG_IMAGE`, e.target.files[0])} className="hidden" />
            </label>
            {section.settings[`${prefix}_${blockNum}_BG_IMAGE`] && <div className="mt-1 flex items-center justify-between bg-gray-50 p-1 border rounded"><img src={section.settings[`${prefix}_${blockNum}_BG_IMAGE`]} className="h-6 object-cover" /><button onClick={() => updateSectionSettings(section.id, `${prefix}_${blockNum}_BG_IMAGE`, '')} className="text-red-500 text-xs px-1">&times;</button></div>}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="block text-[11px] font-medium mb-1 text-gray-500">Couleur Fond</label>
            <input type="color" value={section.settings[`${prefix}_${blockNum}_BG_COLOR`] || '#ffffff'} onChange={e => updateSectionSettings(section.id, `${prefix}_${blockNum}_BG_COLOR`, e.target.value)} className="w-full h-8 cursor-pointer rounded" />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1 text-gray-500">Button Background</label>
            <input type="color" value={section.settings[`${prefix}_${blockNum}_BTN_BG_COLOR`] || '#f97316'} onChange={e => updateSectionSettings(section.id, `${prefix}_${blockNum}_BTN_BG_COLOR`, e.target.value)} className="w-full h-8 cursor-pointer rounded" />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1 text-gray-500">Button Text</label>
            <input type="color" value={section.settings[`${prefix}_${blockNum}_BTN_TEXT_COLOR`] || '#ffffff'} onChange={e => updateSectionSettings(section.id, `${prefix}_${blockNum}_BTN_TEXT_COLOR`, e.target.value)} className="w-full h-8 cursor-pointer rounded" />
          </div>
        </div>
      </div>
    );
  };

  const renderPromoBannerConfig = (section: SectionConfig, blockNum: number, prefix: string = 'BANNER') => {
    return (
      <div className="border-t border-gray-200 mt-3 pt-3">
        <h5 className="font-bold text-sm mb-2 text-red-600">Design & Media</h5>
        <div className="flex flex-col gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold mb-1 text-red-600">Image Principale</label>
            <label className="cursor-pointer bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-100 text-[11px] font-semibold block text-center mt-1 transition">
              Cliquez ici pour uploader
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(section.id, `${prefix}_${blockNum}_IMAGE`, e.target.files[0])} className="hidden" />
            </label>
            {section.settings[`${prefix}_${blockNum}_IMAGE`] && <div className="mt-1 flex items-center justify-between bg-gray-50 p-1 border rounded"><img src={section.settings[`${prefix}_${blockNum}_IMAGE`]} className="h-6 object-contain" /><button onClick={() => updateSectionSettings(section.id, `${prefix}_${blockNum}_IMAGE`, '')} className="text-red-500 text-xs px-1">&times;</button></div>}
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1 text-red-600">Image de Fond (BG)</label>
            <label className="cursor-pointer bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-100 text-[11px] font-semibold block text-center mt-1 transition">
              Cliquez ici pour uploader
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(section.id, `${prefix}_${blockNum}_BG_IMAGE`, e.target.files[0])} className="hidden" />
            </label>
            {section.settings[`${prefix}_${blockNum}_BG_IMAGE`] && <div className="mt-1 flex items-center justify-between bg-gray-50 p-1 border rounded"><img src={section.settings[`${prefix}_${blockNum}_BG_IMAGE`]} className="h-6 object-cover" /><button onClick={() => updateSectionSettings(section.id, `${prefix}_${blockNum}_BG_IMAGE`, '')} className="text-red-500 text-xs px-1">&times;</button></div>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium mb-1 text-gray-500">Couleur Fond</label>
            <input type="color" value={section.settings[`${prefix}_${blockNum}_BG_COLOR`] || (blockNum === 1 ? '#ffedd5' : '#f3f4f6')} onChange={e => updateSectionSettings(section.id, `${prefix}_${blockNum}_BG_COLOR`, e.target.value)} className="w-full h-8 cursor-pointer rounded" />
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1 text-gray-500">Couleur Texte</label>
            <input type="color" value={section.settings[`${prefix}_${blockNum}_TEXT_COLOR`] || '#111827'} onChange={e => updateSectionSettings(section.id, `${prefix}_${blockNum}_TEXT_COLOR`, e.target.value)} className="w-full h-8 cursor-pointer rounded" />
          </div>
        </div>
      </div>
    );
  };

  const renderManualProductSelection = (section: SectionConfig) => {
    if (section.settings.filterType !== 'MANUAL') return null;
    return (
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Select Specific Products</label>
        
        <input 
          type="text" 
          placeholder="Search products by title..." 
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500 mb-2"
        />
        
        {productSearch && (
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm mb-4">
            {allProducts
              .filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()))
              .slice(0, 10)
              .map(p => (
                <div 
                  key={p.id} 
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 border-b last:border-b-0 flex items-center gap-3"
                  onClick={() => {
                    const currentIds = section.settings.productIds || [];
                    if (!currentIds.includes(p.id)) {
                      updateSectionSettings(section.id, 'productIds', [...currentIds, p.id]);
                    }
                    setProductSearch('');
                  }}
                >
                  {p.images && p.images[0] && (
                     <img src={p.images[0]} alt="" className="w-8 h-8 object-cover rounded" />
                  )}
                  <span className="font-medium truncate">{p.title}</span>
                </div>
            ))}
            {allProducts.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No products found.</div>
            )}
          </div>
        )}
        
        {/* Selected Products List */}
        <div className="flex flex-col gap-2 mt-2">
          {(section.settings.productIds || []).map((id: string) => {
            const prod = allProducts.find(p => p.id === id);
            if (!prod) return null;
            return (
              <div key={id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-2 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  {prod.images && prod.images[0] && (
                    <img src={prod.images[0]} alt="" className="w-8 h-8 object-cover rounded flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{prod.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newIds = section.settings.productIds.filter((pid: string) => pid !== id);
                    updateSectionSettings(section.id, 'productIds', newIds);
                  }}
                  className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const addSection = (type: SectionType) => {
    const newSec: SectionConfig = {
      id: 'sec_' + Date.now(),
      type,
      name: `New section (${type})`,
      enabled: true,
      settings: {}
    };
    if (type === 'BestDeals') {
      newSec.settings = { title: "New Deals", countdown: '2026-12-31T23:59:59', filterType: 'ON_SALE', categoryId: '' };
    } else if (type === 'BestSeller') {
      newSec.settings = { title: "New Selection", filterType: 'POPULAR', categoryId: '' };
    } else if (type === 'ProductGrid') {
      newSec.settings = { 
        title: "Ride-on Mowers", 
        filterType: 'LATEST', 
        categoryId: '',
        variant: '1',
        cardBorderColor: '#ea580c',
        btnBgColor: '#ea580c',
        btnTextColor: '#ffffff',
        maxProducts: '12',
        colsDesktop: '5',
        colsTablet: '3',
        colsMobile: '1'
      };
    }
    setSections([...sections, newSec]);
  };

  const renderConfig = (section: SectionConfig, inPopup: boolean) => {
    if (section.type === 'Newsletter') {
      return (
        <div className="p-4 bg-gray-50 border rounded text-sm text-gray-500">
          The settings for this section are managed elsewhere. You can however move or disable it.
        </div>
      );
    }

    if (section.type === 'ProductGrid') {
      return (
        <div className="p-4 bg-gray-50 border rounded space-y-4">
          <p className="text-sm text-gray-500">Displays a customized product grid (editable borders and buttons).</p>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-4">
              {renderResponsiveInput(section, 'Section Title', 'title', 'ex: Ride-on Mowers')}
              {renderResponsiveInput(section, 'Texte du lien "Voir tout"', 'SEE_ALL_TEXT', 'See All')}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Product category</label>
              <select value={section.settings.categoryId || ''} onChange={e => updateSectionSettings(section.id, 'categoryId', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500">
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Filter (Sort)</label>
              <select value={section.settings.filterType || 'LATEST'} onChange={e => updateSectionSettings(section.id, 'filterType', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500">
                <option value="POPULAR">Most popular (Best Sellers)</option>
                <option value="LATEST">Most recent</option>
                <option value="ON_SALE">On sale (Reduced price)</option>
                <option value="MANUAL">Sélection Manuelle (par ID)</option>
              </select>
            </div>
            
            {renderManualProductSelection(section)}
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">URL personnalisée du bouton "Voir tout"</label>
              <input
                type="text"
                value={section.settings.seeAllUrl || ''}
                onChange={e => updateSectionSettings(section.id, 'seeAllUrl', e.target.value)}
                placeholder="ex: /shop ou /search?category=... (laisser vide pour auto)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">Si vide, le lien pointe automatiquement vers la catégorie sélectionnée ci-dessus.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Design Variant</label>
              <select value={section.settings.variant || '1'} onChange={e => updateSectionSettings(section.id, 'variant', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500">
                <option value="1">Variant 1 (Button at bottom of card)</option>
                <option value="2">Variant 2 (Button on image on hover)</option>
              </select>
            </div>
            
            <div className="border-t pt-4 mt-2">
              <h4 className="font-bold text-xs text-gray-800 mb-3">Grille & Affichage</h4>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-gray-700">Total number of products to display</label>
                <input 
                  type="number" 
                  min="1" max="50"
                  value={section.settings.maxProducts || '12'} 
                  onChange={e => updateSectionSettings(section.id, 'maxProducts', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700 text-center">Columns<br/>(Desktop)</label>
                  <select value={section.settings.colsDesktop || '5'} onChange={e => updateSectionSettings(section.id, 'colsDesktop', e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-orange-500">
                    <option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700 text-center">Columns<br/>(Tablet)</label>
                  <select value={section.settings.colsTablet || '3'} onChange={e => updateSectionSettings(section.id, 'colsTablet', e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-orange-500">
                    <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700 text-center">Columns<br/>(Mobile)</label>
                  <select value={section.settings.colsMobile || '1'} onChange={e => updateSectionSettings(section.id, 'colsMobile', e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-orange-500">
                    <option value="1">1</option><option value="2">2</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 italic">Note: If the total number of products exceeds the number of columns, a carousel (autoslide) will activate automatically.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t pt-4 mt-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Border Color (Card)</label>
                <input type="color" value={section.settings.cardBorderColor || '#ea580c'} onChange={e => updateSectionSettings(section.id, 'cardBorderColor', e.target.value)} className="w-full h-8 cursor-pointer rounded" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Button Background (Cart)</label>
                <div className="flex gap-2">
                  <input type="color" value={section.settings.PRODUCT_GRID_BTN_BG_COLOR || '#ea580c'} onChange={e => updateSectionSettings(section.id, 'PRODUCT_GRID_BTN_BG_COLOR', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Button Text (Cart)</label>
                <input type="color" value={section.settings.btnTextColor || '#ffffff'} onChange={e => updateSectionSettings(section.id, 'btnTextColor', e.target.value)} className="w-full h-8 cursor-pointer rounded" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (section.type === 'Hero') {
      const isStyle2 = section.settings.HERO_LAYOUT === 'STYLE_2';
      return (
        <div className="p-4 bg-gray-50 border rounded space-y-4">
          <div className="mb-4 bg-white p-3 border rounded shadow-sm">
            <h4 className="font-bold text-sm mb-3 text-gray-800 border-b pb-2">🎨 Layout Design</h4>
            <div className="flex flex-col gap-2">
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name={`layout-${section.id}`}
                  checked={!isStyle2}
                  onChange={() => updateSectionSettings(section.id, 'HERO_LAYOUT', 'STYLE_1')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span>Style 1 (4 Blocks)</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input 
                  type="radio" 
                  name={`layout-${section.id}`}
                  checked={isStyle2}
                  onChange={() => updateSectionSettings(section.id, 'HERO_LAYOUT', 'STYLE_2')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span>Style 2 (3 Blocks - Modern)</span>
              </label>
            </div>
          </div>

          <div className="mb-4 bg-white p-3 border rounded shadow-sm">
            <h4 className="font-bold text-sm mb-3 text-gray-800 border-b pb-2">📱 Mobile Display</h4>
            <p className="text-xs text-gray-500 mb-3">Select the blocks you want to <strong>display</strong> on the mobile version :</p>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, ...(isStyle2 ? [] : [4])].map(num => (
                <label key={num} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer bg-gray-50 p-2 rounded border hover:bg-gray-100 transition">
                  <input 
                    type="checkbox" 
                    checked={section.settings[isStyle2 ? `STYLE2_HERO_${num}_HIDE_MOBILE` : `HERO_${num}_HIDE_MOBILE`] !== 'true'} 
                    onChange={e => updateSectionSettings(section.id, isStyle2 ? `STYLE2_HERO_${num}_HIDE_MOBILE` : `HERO_${num}_HIDE_MOBILE`, e.target.checked ? 'false' : 'true')}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="font-medium">Show Block {num}</span>
                </label>
              ))}
            </div>
            {isStyle2 && (
              <p className="text-xs text-gray-500 mt-2 italic">Note: In Style 2, blocks 2 and 3 are stacked in the same slide on mobile to preserve proportions.</p>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mb-4">Edit the main texts and designs below.</p>
          
          <div className="flex flex-col gap-4">
            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">Bloc 1 (Left)</h4>
              {renderResponsiveInput(section, 'Title', isStyle2 ? 'STYLE2_HERO_1_TITLE' : 'HERO_1_TITLE', 'BRENNHOLZ UND PELLETS...', isStyle2 ? 'STYLE2_HERO_1_TEXT_COLOR' : 'HERO_1_TEXT_COLOR', '#1e293b')}
              {renderResponsiveInput(section, 'Subtitle / Badge', isStyle2 ? 'STYLE2_HERO_1_SUBTITLE' : 'HERO_1_SUBTITLE', 'Supper Discount', isStyle2 ? 'STYLE2_HERO_1_SUBTITLE_COLOR' : 'HERO_1_SUBTITLE_COLOR', '#ef4444')}
              {!isStyle2 && renderResponsiveInput(section, 'Price/Texte', 'HERO_1_PRICE', 'from $349.99', 'HERO_1_TEXT_COLOR', '#1e293b')}
              {renderResponsiveInput(section, 'Button', isStyle2 ? 'STYLE2_HERO_1_CTA' : 'HERO_1_CTA', 'Shop Now')}
              {renderHeroBlockConfig(section, 1, isStyle2 ? 'STYLE2_HERO' : 'HERO')}
            </div>

            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">{isStyle2 ? 'Bloc 2 (Top Right)' : 'Bloc 2 (Top Center)'}</h4>
              {renderResponsiveInput(section, 'Title', isStyle2 ? 'STYLE2_HERO_2_TITLE' : 'HERO_2_TITLE', 'Heavy On Features...', isStyle2 ? 'STYLE2_HERO_2_TEXT_COLOR' : 'HERO_2_TEXT_COLOR', '#1e293b')}
              {renderResponsiveInput(section, 'Subtitle', isStyle2 ? 'STYLE2_HERO_2_SUBTITLE' : 'HERO_2_SUBTITLE', 'Use Code: SALE35%', isStyle2 ? 'STYLE2_HERO_2_SUBTITLE_COLOR' : 'HERO_2_SUBTITLE_COLOR', '#6b7280')}
              {renderResponsiveInput(section, 'Button', isStyle2 ? 'STYLE2_HERO_2_CTA' : 'HERO_2_CTA', 'Shop Now')}
              {renderHeroBlockConfig(section, 2, isStyle2 ? 'STYLE2_HERO' : 'HERO')}
            </div>

            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">{isStyle2 ? 'Bloc 3 (Bottom Right)' : 'Bloc 3 (Top Right)'}</h4>
              {renderResponsiveInput(section, 'Title', isStyle2 ? 'STYLE2_HERO_3_TITLE' : 'HERO_3_TITLE', 'Sale 10% Off', isStyle2 ? 'STYLE2_HERO_3_TEXT_COLOR' : 'HERO_3_TEXT_COLOR', '#1e293b')}
              {renderResponsiveInput(section, 'Subtitle', isStyle2 ? 'STYLE2_HERO_3_SUBTITLE' : 'HERO_3_SUBTITLE', 'New Product', isStyle2 ? 'STYLE2_HERO_3_SUBTITLE_COLOR' : 'HERO_3_SUBTITLE_COLOR', '#ef4444')}
              {renderResponsiveInput(section, 'Button', isStyle2 ? 'STYLE2_HERO_3_CTA' : 'HERO_3_CTA', 'Shop Now')}
              {renderHeroBlockConfig(section, 3, isStyle2 ? 'STYLE2_HERO' : 'HERO')}
            </div>

            {!isStyle2 && (
              <div className="border p-3 rounded bg-white">
                <h4 className="font-bold text-sm mb-2 text-red-600">Bloc 4 (Bottom Right)</h4>
                {renderResponsiveInput(section, 'Title', 'HERO_4_TITLE', 'Headphones Listen...', 'HERO_4_TEXT_COLOR', '#1e293b')}
                {renderResponsiveInput(section, 'Subtitle', 'HERO_4_SUBTITLE', 'Last call...', 'HERO_4_SUBTITLE_COLOR', '#6b7280')}
                {renderResponsiveInput(section, 'Button', 'HERO_4_CTA', 'Shop Now')}
                {renderHeroBlockConfig(section, 4, 'HERO')}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (section.type === 'LatestBlogs') {
      return (
        <div className="p-4 bg-gray-50 border rounded space-y-4">
          {renderResponsiveInput(section, 'Blog Section Title', 'title', 'Latest Blogs')}
          {renderResponsiveInput(section, 'Texte du lien "Voir tout"', 'SEE_ALL_TEXT', 'See All')}
          
          <div>
            <label className="block text-sm font-medium mb-1">Display Mode</label>
            <select
              value={section.settings.displayMode || 'DATE_DESC'}
              onChange={e => updateSectionSettings(section.id, 'displayMode', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="DATE_DESC">Newest first</option>
              <option value="DATE_ASC">Plus Anciens d'abord</option>
              <option value="MANUAL">Manual selection (by ID)</option>
            </select>
          </div>

          {section.settings.displayMode === 'MANUAL' && (
            <div>
              <label className="block text-sm font-medium mb-1">Article IDs (comma-separated)</label>
              <input 
                type="text" 
                value={section.settings.manualIds || ''} 
                onChange={e => updateSectionSettings(section.id, 'manualIds', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Ex: id1, id2, id3"
              />
              <p className="text-xs text-gray-500 mt-1">Enter the exact IDs of the articles you want to display on the homepage.</p>
            </div>
          )}
          
          <p className="text-xs text-gray-500">Articles are displayed dynamically from the database. If no article exists, the section will not appear.</p>
        </div>
      );
    }

    if (section.type === 'PromoBanners') {
      return (
        <div className="p-4 bg-gray-50 border rounded space-y-4">
          <p className="text-sm text-gray-500">Configure the 2 promotional banners side by side.</p>
          <div className="flex flex-col gap-4">
            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">Left Banner</h4>
              {renderResponsiveInput(section, 'Title', 'BANNER_1_TITLE', 'Ex: Smartwatch')}
              <label className="block text-[11px] font-medium mb-1">Lien cible</label>
              <input type="text" value={section.settings.BANNER_1_LINK || ''} onChange={e => updateSectionSettings(section.id, 'BANNER_1_LINK', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="/category/..." />
              {renderPromoBannerConfig(section, 1)}
            </div>
            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">Right Banner</h4>
              {renderResponsiveInput(section, 'Title', 'BANNER_2_TITLE', 'Ex: Smartphones')}
              <label className="block text-[11px] font-medium mb-1">Lien cible</label>
              <input type="text" value={section.settings.BANNER_2_LINK || ''} onChange={e => updateSectionSettings(section.id, 'BANNER_2_LINK', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="/category/..." />
              {renderPromoBannerConfig(section, 2)}
            </div>
          </div>
        </div>
      );
    }
    
    if (section.type === 'BestDeals' || section.type === 'BestSeller') {
      return (
        <div className="p-4 bg-gray-50 border rounded space-y-4">
          {renderResponsiveInput(section, 'Section Title', 'title', 'Title...')}
          {renderResponsiveInput(section, '"See All" link text', 'SEE_ALL_TEXT', 'See All')}
          {section.type === 'BestDeals' && (
            <>
              <div className="mt-2 border p-3 rounded bg-white">
                <label className="block text-sm font-medium mb-2">Offer end (Countdown)</label>
                <input 
                  type="datetime-local" 
                  value={section.settings.countdown ? section.settings.countdown.substring(0,16) : ''} 
                  onChange={e => updateSectionSettings(section.id, 'countdown', e.target.value + ':00Z')}
                  className="w-full border rounded px-3 py-2 text-sm mb-3"
                />
                <h4 className="font-bold text-xs text-gray-800 mb-2">Show countdown timer on:</h4>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={section.settings.SHOW_TIMER_MOBILE !== 'false'} 
                      onChange={e => updateSectionSettings(section.id, 'SHOW_TIMER_MOBILE', e.target.checked ? 'true' : 'false')}
                      className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                    />
                    <span>Mobile</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={section.settings.SHOW_TIMER_TABLET !== 'false'} 
                      onChange={e => updateSectionSettings(section.id, 'SHOW_TIMER_TABLET', e.target.checked ? 'true' : 'false')}
                      className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                    />
                    <span>Tablet</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={section.settings.SHOW_TIMER_DESKTOP !== 'false'} 
                      onChange={e => updateSectionSettings(section.id, 'SHOW_TIMER_DESKTOP', e.target.checked ? 'true' : 'false')}
                      className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                    />
                    <span>Desktop</span>
                  </label>
                </div>
              </div>

              {/* Promo Banners within BestDeals */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-2">Bloc Promo 1 (Haut)</h4>
                {renderResponsiveInput(section, 'Title Promo 1', 'PROMO_1_TITLE', 'NOTHING WATCH PRO 2')}
                {renderResponsiveInput(section, 'Sous-titre Promo 1', 'PROMO_1_SUBTITLE', 'Price Start $69')}
                {renderResponsiveInput(section, 'Bouton Promo 1', 'PROMO_1_CTA', 'Shop Now')}
                {renderPromoBannerConfig(section, 1, 'PROMO')}
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-2">Bloc Promo 2 (Bas)</h4>
                {renderResponsiveInput(section, 'Title Promo 2', 'PROMO_2_TITLE', 'Get 20% Off')}
                {renderResponsiveInput(section, 'Sous-titre Promo 2', 'PROMO_2_SUBTITLE', 'Women Store')}
                {renderResponsiveInput(section, 'Bouton Promo 2', 'PROMO_2_CTA', 'Shop Now')}
                {renderPromoBannerConfig(section, 2, 'PROMO')}
              </div>
            </>
          )}

          <div className="mt-4 border-t pt-4">
            <h4 className="font-bold text-gray-800 mb-2">Product Appearance</h4>
            <label className="block text-sm font-medium mb-1">Product Card Border Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={section.settings[`${section.type.toUpperCase()}_CARD_BORDER_COLOR`] || '#e5e7eb'} 
                onChange={e => updateSectionSettings(section.id, `${section.type.toUpperCase()}_CARD_BORDER_COLOR`, e.target.value)}
                className="w-10 h-10 border rounded p-1 cursor-pointer"
              />
              <input 
                type="text" 
                value={section.settings[`${section.type.toUpperCase()}_CARD_BORDER_COLOR`] || '#e5e7eb'} 
                onChange={e => updateSectionSettings(section.id, `${section.type.toUpperCase()}_CARD_BORDER_COLOR`, e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
            </div>
            <label className="block text-sm font-medium mb-1 mt-3">Icons Background Color (Cart, Wishlist...)</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={section.settings[`${section.type.toUpperCase()}_BTN_BG_COLOR`] || '#ea580c'} 
                onChange={e => updateSectionSettings(section.id, `${section.type.toUpperCase()}_BTN_BG_COLOR`, e.target.value)}
                className="w-10 h-10 border rounded p-1 cursor-pointer"
              />
              <input 
                type="text" 
                value={section.settings[`${section.type.toUpperCase()}_BTN_BG_COLOR`] || '#ea580c'} 
                onChange={e => updateSectionSettings(section.id, `${section.type.toUpperCase()}_BTN_BG_COLOR`, e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
            </div>

            <label className="block text-sm font-medium mb-1 mt-3">Icons Text Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={section.settings[`${section.type.toUpperCase()}_BTN_TEXT_COLOR`] || '#ffffff'} 
                onChange={e => updateSectionSettings(section.id, `${section.type.toUpperCase()}_BTN_TEXT_COLOR`, e.target.value)}
                className="w-10 h-10 border rounded p-1 cursor-pointer"
              />
              <input 
                type="text" 
                value={section.settings[`${section.type.toUpperCase()}_BTN_TEXT_COLOR`] || '#ffffff'} 
                onChange={e => updateSectionSettings(section.id, `${section.type.toUpperCase()}_BTN_TEXT_COLOR`, e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 mt-4 border-t pt-4">Product display criteria</label>
            <select 
              value={section.settings.filterType || (section.type === 'BestDeals' ? 'ON_SALE' : 'POPULAR')} 
              onChange={e => updateSectionSettings(section.id, 'filterType', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="POPULAR">Most popular (Best Sellers)</option>
              <option value="LATEST">Most recent</option>
              <option value="ON_SALE">On sale (Reduced price)</option>
              <option value="CATEGORY">By Specific Category</option>
              <option value="MANUAL">Sélection Manuelle (par ID)</option>
            </select>
          </div>
          {section.settings.filterType === 'CATEGORY' && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Category</label>
              <select 
                value={section.settings.categoryId || ''}
                onChange={e => updateSectionSettings(section.id, 'categoryId', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">-- Choose --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {renderManualProductSelection(section)}

        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-gray-100 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20 shadow-xl overflow-hidden transition-all duration-300">
        {/* Sidebar Header */}
        <div className="bg-slate-800 text-white px-3 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <a href="/admin" className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition" title="Exit editor">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </a>
            <span className="font-semibold text-xs tracking-wide">{t('editor_title')}</span>
          </div>
          <button onClick={handleSave} disabled={isLoading} className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50 flex items-center gap-1">
            {isLoading && <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isLoading ? t('saving') : t('save')}
          </button>
        </div>
        {message && <div className="px-4 py-2 bg-green-50 text-green-600 text-xs text-center border-b border-green-100 font-medium shrink-0">{message}</div>}

        {/* Sidebar Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar relative">
          {!editingId ? (
            // LIST VIEW
            <div className="p-3">
              {/* Global Settings */}
              <div className="mb-6 bg-white p-3 border rounded shadow-sm">
                <h4 className="font-bold text-xs text-gray-800 mb-2 border-b pb-1">{t('global_settings')}</h4>
                <label className="block text-xs font-medium mb-1">{t('font_family')}</label>
                <select 
                  value={globalFont} 
                  onChange={e => setGlobalFont(e.target.value)} 
                  className="w-full border rounded px-2 py-1 text-sm focus:border-orange-500 outline-none"
                >
                  <option value="Inter">Inter (Default)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Playfair Display">Playfair Display (Serif)</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lora">Lora</option>
                  <option value="Oswald">Oswald</option>
                  <option value="Raleway">Raleway</option>
                  <option value="Nunito">Nunito</option>
                  <option value="Ubuntu">Ubuntu</option>
                  <option value="Merriweather">Merriweather</option>
                </select>
              </div>

              <p className="text-[11px] leading-tight text-gray-500 mb-4">{t('click_section_preview')}</p>
              
              <div className="space-y-3 mb-6">
                {sections.map((section, index) => (
                  <div key={section.id} className={`flex flex-col border rounded p-2 transition ${!section.enabled ? 'bg-gray-50 opacity-60' : 'bg-white hover:border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setEditingId(section.id)}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${section.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm font-medium group-hover:text-orange-600 transition-colors">{section.name || section.type}</span>
                        <svg className="w-3 h-3 text-gray-300 group-hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); duplicateSection(index); }} className="p-1 text-blue-500 hover:bg-blue-50 hover:text-blue-700 rounded" title="Dupliquer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                        </button>
                        <div className="flex flex-col -space-y-1">
                          <button disabled={index === 0} onClick={(e) => { e.stopPropagation(); moveSection(index, 'UP'); }} className="p-0.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                          <button disabled={index === sections.length - 1} onClick={(e) => { e.stopPropagation(); moveSection(index, 'DOWN'); }} className="p-0.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeSection(index); }} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded ml-1" title="Delete"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t("add_widget")}</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => addSection('Hero')} className="border rounded bg-gray-50 hover:bg-gray-100 p-1.5 text-center text-[10px] flex flex-col items-center gap-1 transition text-gray-600 hover:text-gray-900 hover:border-gray-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Hero
                  </button>
                  <button onClick={() => addSection('PromoBanners')} className="border rounded bg-gray-50 hover:bg-gray-100 p-1.5 text-center text-[10px] flex flex-col items-center gap-1 transition text-gray-600 hover:text-gray-900 hover:border-gray-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                    Banners
                  </button>
                  <button onClick={() => addSection('BestDeals')} className="border rounded bg-gray-50 hover:bg-gray-100 p-1.5 text-center text-[10px] flex flex-col items-center gap-1 transition text-gray-600 hover:text-gray-900 hover:border-gray-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Promos
                  </button>
                  <button onClick={() => addSection('BestSeller')} className="border rounded bg-gray-50 hover:bg-gray-100 p-1.5 text-center text-[10px] flex flex-col items-center gap-1 transition text-gray-600 hover:text-gray-900 hover:border-gray-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Grille
                  </button>
                  <button onClick={() => addSection('LatestBlogs')} className="border rounded bg-gray-50 hover:bg-gray-100 p-1.5 text-center text-[10px] flex flex-col items-center gap-1 transition text-gray-600 hover:text-gray-900 hover:border-gray-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" /></svg>
                    Blog
                  </button>
                  <button onClick={() => addSection('Newsletter')} className="border rounded bg-gray-50 hover:bg-gray-100 p-1.5 text-center text-[10px] flex flex-col items-center gap-1 transition text-gray-600 hover:text-gray-900 hover:border-gray-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Newsletter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // EDIT VIEW
            <div className="bg-gray-50 min-h-full">
              {sections.map((section, index) => section.id === editingId && (
                <div key={section.id}>
                  {/* Edit Header */}
                  <div className="bg-white px-3 py-2 border-b flex items-center gap-1.5 sticky top-0 z-10 shadow-sm">
                    <button onClick={() => setEditingId(null)} className="p-1 hover:bg-gray-100 hover:text-gray-900 rounded-full text-gray-500 transition-colors shrink-0" title="Back to list">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex-grow min-w-0 flex items-center gap-1.5">
                      <span className="px-1 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold uppercase tracking-wider rounded shrink-0 hidden sm:inline-block">{section.type}</span>
                      <input 
                        type="text" 
                        value={section.name} 
                        onChange={e => updateSectionName(section.id, e.target.value)}
                        className="text-xs font-bold border-b border-transparent hover:border-gray-200 focus:border-orange-500 outline-none bg-transparent w-full truncate transition-colors py-0.5"
                        placeholder="Name..."
                      />
                    </div>
                    <button onClick={() => toggleSection(index)} className={`p-1 rounded-full transition-colors shrink-0 ${section.enabled ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`} title={section.enabled ? 'Hide' : 'Show'}>
                      {section.enabled ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                    </button>
                  </div>
                  <div className="p-3 bg-white text-sm">
                    {renderConfig(section, false)}
                  </div>
                  {/* Delete Section button at bottom */}
                  <div className="p-3 bg-gray-50 border-t flex justify-center">
                    <button onClick={() => { removeSection(index); setEditingId(null); }} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1 p-1.5 rounded hover:bg-red-50 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete section
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Iframe Preview */}
      <div className="flex-grow w-full relative z-10 bg-gray-200 flex flex-col items-center">
        {/* Device Toggle Bar */}
        <div className="w-full bg-white border-b flex justify-center items-center py-2 gap-2 shadow-sm z-20">
          <button 
            onClick={() => setPreviewMode('desktop')} 
            className={`p-2 rounded transition-colors flex items-center justify-center ${previewMode === 'desktop' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Desktop Preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </button>
          <button 
            onClick={() => setPreviewMode('tablet')} 
            className={`p-2 rounded transition-colors flex items-center justify-center ${previewMode === 'tablet' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Tablet Preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </button>
          <button 
            onClick={() => setPreviewMode('mobile')} 
            className={`p-2 rounded transition-colors flex items-center justify-center ${previewMode === 'mobile' ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Mobile Preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </button>
        </div>

        {/* Iframe Container */}
        <div className={`flex-grow relative transition-all duration-500 ease-in-out ${previewMode === 'desktop' ? 'w-full' : previewMode === 'tablet' ? 'w-[768px] shadow-2xl my-4 rounded-xl overflow-hidden border-8 border-gray-800' : 'w-[375px] shadow-2xl my-4 rounded-3xl overflow-hidden border-[12px] border-gray-800'}`}>
          {previewMode === 'mobile' && (
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 z-30 flex justify-center rounded-b-xl">
               <div className="w-24 h-4 bg-black rounded-b-xl"></div>
            </div>
          )}
          <iframe 
            ref={iframeRef} 
            src="/preview" 
            className="w-full h-full bg-white" 
            title="Live Preview" 
          />
        </div>
      </div>
    </div>
  );
}
