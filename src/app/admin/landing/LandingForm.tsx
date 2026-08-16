'use client';

import { useState, useRef, useEffect } from 'react';
import { updateSetting } from '@/actions/settings';
import { uploadImage } from '@/actions/admin';
import Cookies from 'js-cookie';

export type SectionType = 'Hero' | 'BestDeals' | 'BestSeller' | 'LatestBlogs' | 'Newsletter' | 'PromoBanners';

export interface SectionConfig {
  id: string;
  type: SectionType;
  name: string;
  enabled: boolean;
  settings: any;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'sec_1', type: 'Hero', name: 'En-tête Principal (Hero)', enabled: true, settings: {} },
  { id: 'sec_2', type: 'BestDeals', name: 'Promotions du Jour (Best Deals)', enabled: true, settings: { title: "Today's Best Deals", countdown: '2026-12-31T23:59:59', filterType: 'ON_SALE', categoryId: '' } },
  { id: 'sec_3', type: 'PromoBanners', name: 'Bannières Promo', enabled: true, settings: {} },
  { id: 'sec_4', type: 'BestSeller', name: 'Meilleures Ventes', enabled: true, settings: { title: "Best Seller", filterType: 'POPULAR', categoryId: '' } },
  { id: 'sec_5', type: 'LatestBlogs', name: 'Derniers Articles de Blog', enabled: true, settings: { title: "Latest Blogs" } },
  { id: 'sec_6', type: 'Newsletter', name: 'Inscription Newsletter', enabled: true, settings: {} }
];

export default function LandingForm({ initialSettings, categories }: { initialSettings: Record<string, string>, categories: any[] }) {
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Popup Mode State
  const [isPopupMode, setIsPopupMode] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.initialX + dx,
        y: Math.max(0, dragRef.current.initialY + dy)
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Sync to cookie for preview iframe
  useEffect(() => {
    Cookies.set('preview_layout', JSON.stringify(sections), { path: '/' });
    
    // Debounce iframe reload
    const timer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.location.reload();
      }
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(timer);
  }, [sections]);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      await updateSetting('HOMEPAGE_LAYOUT', JSON.stringify(sections));
      setMessage('Mise à jour réussie !');
    } catch (e) {
      setMessage('Erreur lors de la mise à jour.');
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

  const renderHeroBlockConfig = (section: SectionConfig, blockNum: number) => {
    return (
      <div className="border-t border-gray-200 mt-3 pt-3">
        <h5 className="font-bold text-sm mb-2 text-red-600">Design, Liens & Médias</h5>
        <label className="block text-xs font-medium mb-1">Lien de redirection (URL)</label>
        <input type="text" value={section.settings[`HERO_${blockNum}_LINK`] || ''} onChange={e => updateSectionSettings(section.id, `HERO_${blockNum}_LINK`, e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-3" placeholder="/product/..." />
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-bold mb-1 text-red-600">Image Principale</label>
            <label className="cursor-pointer bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-100 text-xs font-semibold block text-center mt-1 transition">
              Cliquez ici pour uploader
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(section.id, `HERO_${blockNum}_IMAGE`, e.target.files[0])} className="hidden" />
            </label>
            {section.settings[`HERO_${blockNum}_IMAGE`] && <div className="mt-1 flex items-center justify-between bg-gray-50 p-1 border rounded"><img src={section.settings[`HERO_${blockNum}_IMAGE`]} className="h-6 object-contain" /><button onClick={() => updateSectionSettings(section.id, `HERO_${blockNum}_IMAGE`, '')} className="text-red-500 text-xs px-1">&times;</button></div>}
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-red-600">Image de Fond (BG)</label>
            <label className="cursor-pointer bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-100 text-xs font-semibold block text-center mt-1 transition">
              Cliquez ici pour uploader
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(section.id, `HERO_${blockNum}_BG_IMAGE`, e.target.files[0])} className="hidden" />
            </label>
            {section.settings[`HERO_${blockNum}_BG_IMAGE`] && <div className="mt-1 flex items-center justify-between bg-gray-50 p-1 border rounded"><img src={section.settings[`HERO_${blockNum}_BG_IMAGE`]} className="h-6 object-cover" /><button onClick={() => updateSectionSettings(section.id, `HERO_${blockNum}_BG_IMAGE`, '')} className="text-red-500 text-xs px-1">&times;</button></div>}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500">Couleur Fond</label>
            <input type="color" value={section.settings[`HERO_${blockNum}_BG_COLOR`] || '#ffffff'} onChange={e => updateSectionSettings(section.id, `HERO_${blockNum}_BG_COLOR`, e.target.value)} className="w-full h-8 cursor-pointer rounded" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500">Bouton Fond</label>
            <input type="color" value={section.settings[`HERO_${blockNum}_BTN_BG_COLOR`] || '#f97316'} onChange={e => updateSectionSettings(section.id, `HERO_${blockNum}_BTN_BG_COLOR`, e.target.value)} className="w-full h-8 cursor-pointer rounded" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500">Bouton Texte</label>
            <input type="color" value={section.settings[`HERO_${blockNum}_BTN_TEXT_COLOR`] || '#ffffff'} onChange={e => updateSectionSettings(section.id, `HERO_${blockNum}_BTN_TEXT_COLOR`, e.target.value)} className="w-full h-8 cursor-pointer rounded" />
          </div>
        </div>
      </div>
    );
  };

  const renderPromoBannerConfig = (section: SectionConfig, blockNum: number) => {
    return (
      <div className="border-t border-gray-200 mt-3 pt-3">
        <h5 className="font-bold text-sm mb-2 text-red-600">Design & Médias</h5>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-bold mb-1 text-red-600">Image Principale</label>
            <label className="cursor-pointer bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-100 text-xs font-semibold block text-center mt-1 transition">
              Cliquez ici pour uploader
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(section.id, `BANNER_${blockNum}_IMAGE`, e.target.files[0])} className="hidden" />
            </label>
            {section.settings[`BANNER_${blockNum}_IMAGE`] && <div className="mt-1 flex items-center justify-between bg-gray-50 p-1 border rounded"><img src={section.settings[`BANNER_${blockNum}_IMAGE`]} className="h-6 object-contain" /><button onClick={() => updateSectionSettings(section.id, `BANNER_${blockNum}_IMAGE`, '')} className="text-red-500 text-xs px-1">&times;</button></div>}
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-red-600">Image de Fond (BG)</label>
            <label className="cursor-pointer bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-100 text-xs font-semibold block text-center mt-1 transition">
              Cliquez ici pour uploader
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleUpload(section.id, `BANNER_${blockNum}_BG_IMAGE`, e.target.files[0])} className="hidden" />
            </label>
            {section.settings[`BANNER_${blockNum}_BG_IMAGE`] && <div className="mt-1 flex items-center justify-between bg-gray-50 p-1 border rounded"><img src={section.settings[`BANNER_${blockNum}_BG_IMAGE`]} className="h-6 object-cover" /><button onClick={() => updateSectionSettings(section.id, `BANNER_${blockNum}_BG_IMAGE`, '')} className="text-red-500 text-xs px-1">&times;</button></div>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500">Couleur Fond</label>
            <input type="color" value={section.settings[`BANNER_${blockNum}_BG_COLOR`] || (blockNum === 1 ? '#ffedd5' : '#f3f4f6')} onChange={e => updateSectionSettings(section.id, `BANNER_${blockNum}_BG_COLOR`, e.target.value)} className="w-full h-8 cursor-pointer rounded" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500">Couleur Texte</label>
            <input type="color" value={section.settings[`BANNER_${blockNum}_TEXT_COLOR`] || '#111827'} onChange={e => updateSectionSettings(section.id, `BANNER_${blockNum}_TEXT_COLOR`, e.target.value)} className="w-full h-8 cursor-pointer rounded" />
          </div>
        </div>
      </div>
    );
  };

  const addSection = (type: SectionType) => {
    const newSec: SectionConfig = {
      id: 'sec_' + Date.now(),
      type,
      name: `Nouvelle section (${type})`,
      enabled: true,
      settings: {}
    };
    if (type === 'BestDeals') {
      newSec.settings = { title: "New Deals", countdown: '2026-12-31T23:59:59', filterType: 'ON_SALE', categoryId: '' };
    } else if (type === 'BestSeller') {
      newSec.settings = { title: "New Selection", filterType: 'POPULAR', categoryId: '' };
    }
    setSections([...sections, newSec]);
  };

  const renderConfig = (section: SectionConfig, inPopup: boolean) => {
    if (section.type === 'Newsletter') {
      return (
        <div className="p-4 bg-gray-50 border rounded text-sm text-gray-500">
          Les paramètres de cette section sont gérés ailleurs. Vous pouvez cependant la déplacer ou la désactiver.
        </div>
      );
    }

    if (section.type === 'Hero') {
      return (
        <div className="p-4 bg-gray-50 border rounded space-y-4">
          <p className="text-sm text-gray-500 mb-4">L'en-tête principal contient 4 blocs. Modifiez les textes principaux ci-dessous.</p>
          
          <div className={`grid gap-4 ${inPopup ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">Bloc 1 (Gauche)</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.HERO_1_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_1_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Apple Iphone 17 Pro Max" />
              <label className="block text-xs font-medium mb-1">Sous-titre</label>
              <input type="text" value={section.settings.HERO_1_SUBTITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_1_SUBTITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Supper Discount" />
              <label className="block text-xs font-medium mb-1">Prix/Texte</label>
              <input type="text" value={section.settings.HERO_1_PRICE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_1_PRICE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="from $349.99" />
              <label className="block text-xs font-medium mb-1">Bouton</label>
              <input type="text" value={section.settings.HERO_1_CTA || ''} onChange={e => updateSectionSettings(section.id, 'HERO_1_CTA', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="Shop Now" />
              {renderHeroBlockConfig(section, 1)}
            </div>

            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">Bloc 2 (Haut Centre)</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.HERO_2_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_2_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Heavy On Features..." />
              <label className="block text-xs font-medium mb-1">Sous-titre</label>
              <input type="text" value={section.settings.HERO_2_SUBTITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_2_SUBTITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="Use Code: SALE35%" />
              {renderHeroBlockConfig(section, 2)}
            </div>

            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">Bloc 3 (Haut Droite)</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.HERO_3_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_3_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Sale 10% Off" />
              <label className="block text-xs font-medium mb-1">Sous-titre</label>
              <input type="text" value={section.settings.HERO_3_SUBTITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_3_SUBTITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="New Product" />
              {renderHeroBlockConfig(section, 3)}
            </div>

            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">Bloc 4 (Bas Droite)</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.HERO_4_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_4_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Headphones Listen..." />
              <label className="block text-xs font-medium mb-1">Sous-titre</label>
              <input type="text" value={section.settings.HERO_4_SUBTITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_4_SUBTITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="Last call..." />
              {renderHeroBlockConfig(section, 4)}
            </div>
          </div>
        </div>
      );
    }

    if (section.type === 'LatestBlogs') {
      return (
        <div className="p-4 bg-gray-50 border rounded space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre de la section Blog</label>
            <input 
              type="text" 
              value={section.settings.title || 'Latest Blogs'} 
              onChange={e => updateSectionSettings(section.id, 'title', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Ordre d'affichage des articles</label>
            <select 
              value={section.settings.displayMode || 'DATE_DESC'}
              onChange={e => updateSectionSettings(section.id, 'displayMode', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="DATE_DESC">Plus Récents d'abord</option>
              <option value="DATE_ASC">Plus Anciens d'abord</option>
              <option value="MANUAL">Sélection Manuelle (par ID)</option>
            </select>
          </div>

          {section.settings.displayMode === 'MANUAL' && (
            <div>
              <label className="block text-sm font-medium mb-1">IDs des articles (séparés par virgule)</label>
              <input 
                type="text" 
                value={section.settings.manualIds || ''} 
                onChange={e => updateSectionSettings(section.id, 'manualIds', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Ex: id1, id2, id3"
              />
              <p className="text-xs text-gray-500 mt-1">Saisissez les IDs exacts des articles que vous souhaitez afficher sur l'accueil.</p>
            </div>
          )}
          
          <p className="text-xs text-gray-500">Les articles sont affichés dynamiquement depuis la base de données. Si aucun article n'existe, la section n'apparaîtra pas.</p>
        </div>
      );
    }

    if (section.type === 'PromoBanners') {
      return (
        <div className="p-4 bg-gray-50 border rounded space-y-4">
          <p className="text-sm text-gray-500">Configurer les 2 bannières promotionnelles côte à côte.</p>
          <div className={`grid gap-4 ${inPopup ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">Bannière Gauche</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.BANNER_1_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'BANNER_1_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Ex: Smartwatch" />
              <label className="block text-xs font-medium mb-1">Lien cible</label>
              <input type="text" value={section.settings.BANNER_1_LINK || ''} onChange={e => updateSectionSettings(section.id, 'BANNER_1_LINK', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="/category/..." />
              {renderPromoBannerConfig(section, 1)}
            </div>
            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2 text-red-600">Bannière Droite</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.BANNER_2_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'BANNER_2_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Ex: Smartphones" />
              <label className="block text-xs font-medium mb-1">Lien cible</label>
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
          <div>
            <label className="block text-sm font-medium mb-1">Titre de la section</label>
            <input 
              type="text" 
              value={section.settings.title || ''} 
              onChange={e => updateSectionSettings(section.id, 'title', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          {section.type === 'BestDeals' && (
            <div>
              <label className="block text-sm font-medium mb-1">Fin de l'offre (Compte à rebours)</label>
              <input 
                type="datetime-local" 
                value={section.settings.countdown ? section.settings.countdown.substring(0,16) : ''} 
                onChange={e => updateSectionSettings(section.id, 'countdown', e.target.value + ':00Z')}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Critère d'affichage des produits</label>
            <select 
              value={section.settings.filterType || 'NEWEST'}
              onChange={e => updateSectionSettings(section.id, 'filterType', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="NEWEST">Les Plus Récents</option>
              <option value="ON_SALE">En Promotion (On Sale)</option>
              <option value="POPULAR">Les Plus Populaires (Best Sellers)</option>
              <option value="CATEGORY">Par Catégorie Spécifique</option>
            </select>
          </div>
          {section.settings.filterType === 'CATEGORY' && (
            <div>
              <label className="block text-sm font-medium mb-1">Sélectionner la Catégorie</label>
              <select 
                value={section.settings.categoryId || ''}
                onChange={e => updateSectionSettings(section.id, 'categoryId', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">-- Choisissez --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  const renderFormContent = (inPopup: boolean) => (
    <div className={`space-y-6 overflow-y-auto pr-2 custom-scrollbar ${inPopup ? 'h-[75vh] p-4' : 'h-[calc(100vh-120px)]'}`}>
      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          {message}
        </div>
      )}

      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${!inPopup && 'p-6'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Constructeur de Page</h2>
          <button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition"
          >
            {isLoading ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>

        {!inPopup && (
          <p className="text-sm text-gray-500 mb-6">
            Réorganisez les sections de votre page d'accueil en les montant ou descendant. L'aperçu en direct se trouve sur la droite.
          </p>
        )}

        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className={`border rounded-lg overflow-hidden ${!section.enabled ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
              <div className="flex items-center p-3 gap-3">
                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <button disabled={index === 0} onClick={() => moveSection(index, 'UP')} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button disabled={index === sections.length - 1} onClick={() => moveSection(index, 'DOWN')} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded self-start mb-1">{section.type}</span>
                    <input 
                      type="text" 
                      value={section.name} 
                      onChange={e => updateSectionName(section.id, e.target.value)}
                      className="font-bold text-sm md:text-base border-b border-transparent hover:border-gray-300 focus:border-orange-500 outline-none bg-transparent w-full truncate"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-col md:flex-row items-end md:items-center gap-1.5">
                  <button 
                    onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition whitespace-nowrap"
                  >
                    {editingId === section.id ? 'Fermer' : 'Éditer'}
                  </button>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => toggleSection(index)}
                      className={`text-[10px] px-1.5 py-1 rounded transition ${section.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      title={section.enabled ? 'Visible' : 'Masqué'}
                    >
                      {section.enabled ? 'Vis' : 'Masq'}
                    </button>
                    <button onClick={() => removeSection(index)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Config Panel */}
              {editingId === section.id && (
                <div className="border-t border-gray-100 bg-white p-3">
                  {renderConfig(section, inPopup)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold mb-2 text-sm">Ajouter une section</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addSection('BestDeals')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs rounded transition">+ Grille Promo</button>
            <button onClick={() => addSection('BestSeller')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs rounded transition">+ Grille Simple</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`grid grid-cols-1 ${!isPopupMode ? 'xl:grid-cols-2' : ''} gap-6 relative`}>
      
      {/* Left side: Form (Inline Mode) */}
      <div className={`${isPopupMode ? 'xl:hidden' : 'block'}`}>
        {renderFormContent(false)}
      </div>
      
      {/* Right side: Live Preview */}
      <div className={`hidden xl:block h-[calc(100vh-120px)] bg-gray-100 rounded-lg overflow-hidden border border-gray-300 relative shadow-inner ${isPopupMode ? 'col-span-1' : ''}`}>
        <div className="absolute top-0 w-full bg-slate-800 text-white py-1 px-4 text-xs font-semibold flex justify-between items-center z-10 opacity-90">
          <div className="flex items-center gap-4">
            <span>Aperçu en direct</span>
            <button 
              onClick={() => setIsPopupMode(!isPopupMode)} 
              className="bg-slate-600 hover:bg-slate-500 px-2 py-0.5 rounded border border-slate-500 transition flex items-center gap-1"
            >
              {isPopupMode ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  Figer à gauche (Mode Tablette)
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                  Détacher (Mode Pop-up)
                </>
              )}
            </button>
          </div>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            En temps réel
          </span>
        </div>
        <iframe 
          ref={iframeRef} 
          src="/preview" 
          className="w-full h-full pt-6 bg-white" 
          title="Live Preview"
        />
      </div>

      {/* Floating Popup (Desktop Only) */}
      {isPopupMode && (
        <div 
          className="hidden xl:flex absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-300 flex-col overflow-hidden w-[450px]"
          style={{ left: `${position.x}px`, top: `${position.y}px`, maxHeight: '85vh' }}
        >
          {/* Draggable Header */}
          <div 
            className="bg-slate-800 text-white px-4 py-2 cursor-move flex justify-between items-center select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <span className="font-semibold text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              Éditeur de Page
            </span>
            <button 
              onClick={() => setIsPopupMode(false)}
              className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-slate-700 transition"
              title="Fermer le pop-up (retour au mode fixe)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {/* Form Content */}
          <div className="bg-gray-50">
            {renderFormContent(true)}
          </div>
        </div>
      )}

    </div>
  );
}
