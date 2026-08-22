'use client';

import { useState, useRef, useEffect } from 'react';
import { updateSetting } from '@/actions/settings';
import { uploadImage } from '@/actions/admin';
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
        
        <div className="grid grid-cols-3 gap-2 mb-3">
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
        
        <div className="pt-2 border-t border-gray-100">
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={section.settings[`HERO_${blockNum}_HIDE_MOBILE`] === 'true'} 
              onChange={e => updateSectionSettings(section.id, `HERO_${blockNum}_HIDE_MOBILE`, e.target.checked ? 'true' : 'false')}
              className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
            />
            <span className="font-medium text-red-600">Masquer ce bloc sur mobile</span>
          </label>
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
    } else if (type === 'ProductGrid') {
      newSec.settings = { 
        title: "Tondeuses Autoportées", 
        filterType: 'LATEST', 
        categoryId: '',
        variant: '1',
        cardBorderColor: '#ea580c',
        btnBgColor: '#ea580c',
        btnTextColor: '#ffffff'
      };
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

    if (section.type === 'ProductGrid') {
      return (
        <div className="p-4 bg-gray-50 border rounded space-y-4">
          <p className="text-sm text-gray-500">Affiche une grille de produits personnalisée (bordures et boutons modifiables).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Titre de la section</label>
              <input type="text" value={section.settings.title || ''} onChange={e => updateSectionSettings(section.id, 'title', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500" placeholder="ex: Tondeuses Autoportées" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Catégorie des produits</label>
              <select value={section.settings.categoryId || ''} onChange={e => updateSectionSettings(section.id, 'categoryId', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500">
                <option value="">Toutes les catégories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Filtre (Tri)</label>
              <select value={section.settings.filterType || 'LATEST'} onChange={e => updateSectionSettings(section.id, 'filterType', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500">
                <option value="POPULAR">Les plus populaires (Meilleures Ventes)</option>
                <option value="LATEST">Les plus récents</option>
                <option value="ON_SALE">En promotion (Prix réduit)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Variante de Design</label>
              <select value={section.settings.variant || '1'} onChange={e => updateSectionSettings(section.id, 'variant', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500">
                <option value="1">Variante 1 (Bouton en bas de carte)</option>
                <option value="2">Variante 2 (Bouton sur l'image au survol)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2 border-t pt-4 mt-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Couleur Bordure (Carte)</label>
                <input type="color" value={section.settings.cardBorderColor || '#ea580c'} onChange={e => updateSectionSettings(section.id, 'cardBorderColor', e.target.value)} className="w-full h-8 cursor-pointer rounded" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Fond Bouton (Panier)</label>
                <input type="color" value={section.settings.btnBgColor || '#ea580c'} onChange={e => updateSectionSettings(section.id, 'btnBgColor', e.target.value)} className="w-full h-8 cursor-pointer rounded" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Texte Bouton (Panier)</label>
                <input type="color" value={section.settings.btnTextColor || '#ffffff'} onChange={e => updateSectionSettings(section.id, 'btnTextColor', e.target.value)} className="w-full h-8 cursor-pointer rounded" />
              </div>
            </div>
          </div>
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

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-100 relative -m-4 sm:-m-6 lg:-m-8">
      {/* Top Navbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-4 z-20 shrink-0 shadow-sm relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar flex-grow">
          {sections.map((section, index) => (
            <div 
              key={section.id} 
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md border transition cursor-pointer select-none ${editingId === section.id ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-inner' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300'}`} 
              onClick={() => setEditingId(editingId === section.id ? null : section.id)}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${section.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-sm font-medium whitespace-nowrap">{section.name || section.type}</span>
              <svg className={`w-4 h-4 ml-1 flex-shrink-0 ${editingId === section.id ? 'text-orange-500' : 'text-gray-400 hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
          ))}
          {/* Add section dropdown */}
          <div className="relative group">
            <button className="px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-700 text-sm font-medium rounded-md flex items-center gap-1 whitespace-nowrap transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Ajouter section
            </button>
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 hidden group-hover:block w-48 z-50">
              <button onClick={() => addSection('Hero')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">En-tête Principal (Hero)</button>
              <button onClick={() => addSection('BestDeals')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Promotions du Jour</button>
              <button onClick={() => addSection('BestSeller')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Meilleures Ventes</button>
              <button onClick={() => addSection('ProductGrid')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Grille de Produits</button>
              <button onClick={() => addSection('PromoBanners')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bannières Promo</button>
              <button onClick={() => addSection('LatestBlogs')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Derniers Articles</button>
              <button onClick={() => addSection('Newsletter')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Newsletter</button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {message && <span className="text-sm text-green-600 font-medium px-2 bg-green-50 py-1 rounded">{message}</span>}
          <button onClick={handleSave} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-1.5 rounded-md font-medium disabled:opacity-50 transition shadow-sm whitespace-nowrap flex items-center gap-2">
            {isLoading && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {isLoading ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Dropdown Editor Panel */}
      {editingId && (
        <div className="absolute top-[60px] left-0 right-0 max-w-4xl mx-auto bg-white rounded-b-xl shadow-2xl border border-gray-200 z-30 max-h-[75vh] overflow-y-auto custom-scrollbar flex flex-col">
          {sections.map((section, index) => section.id === editingId && (
            <div key={section.id} className="p-6">
              {/* Dropdown Header with Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
                <div className="flex items-center gap-3 flex-grow">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded">{section.type}</span>
                  <input 
                    type="text" 
                    value={section.name} 
                    onChange={e => updateSectionName(section.id, e.target.value)} 
                    className="font-bold text-xl border-b-2 border-transparent hover:border-gray-200 focus:border-orange-500 outline-none px-1 py-0.5 w-full max-w-md transition" 
                    placeholder="Nom de la section" 
                  />
                </div>
                
                <div className="flex items-center gap-2 shrink-0 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                   <button 
                     onClick={() => toggleSection(index)} 
                     className={`text-xs px-3 py-1.5 rounded font-medium transition ${section.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                   >
                     {section.enabled ? 'Section Visible' : 'Section Masquée'}
                   </button>
                   <div className="w-px h-6 bg-gray-300 mx-1"></div>
                   <button disabled={index === 0} onClick={() => moveSection(index, 'UP')} className="p-1.5 hover:bg-white text-gray-600 rounded disabled:opacity-30 transition border border-transparent hover:border-gray-300 shadow-sm" title="Déplacer vers la gauche / Monter"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
                   <button disabled={index === sections.length - 1} onClick={() => moveSection(index, 'DOWN')} className="p-1.5 hover:bg-white text-gray-600 rounded disabled:opacity-30 transition border border-transparent hover:border-gray-300 shadow-sm" title="Déplacer vers la droite / Descendre"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
                   <div className="w-px h-6 bg-gray-300 mx-1"></div>
                   <button onClick={() => { removeSection(index); setEditingId(null); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition border border-transparent hover:border-red-200 shadow-sm" title="Supprimer la section"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                   <button onClick={() => setEditingId(null)} className="ml-2 p-1.5 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-full transition" title="Fermer le panneau"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              </div>
              
              {/* Form Config */}
              <div className="mt-2">
                {renderConfig(section, false)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-screen Preview Iframe */}
      <div className="flex-grow w-full relative z-10 bg-gray-200">
        <iframe 
          ref={iframeRef} 
          src="/preview" 
          className="w-full h-full bg-white shadow-inner" 
          title="Live Preview" 
        />
        {/* Helper overlay when editing */}
        {editingId && (
          <div className="absolute inset-0 bg-black bg-opacity-20 pointer-events-none transition-opacity duration-300"></div>
        )}
      </div>
    </div>
  );
}
