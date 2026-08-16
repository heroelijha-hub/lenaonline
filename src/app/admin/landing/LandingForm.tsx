'use client';

import { useState } from 'react';
import { updateSetting } from '@/actions/settings';

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

  const renderConfig = (section: SectionConfig) => {
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2">Bloc 1 (Gauche)</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.HERO_1_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_1_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Apple Iphone 17 Pro Max" />
              <label className="block text-xs font-medium mb-1">Sous-titre</label>
              <input type="text" value={section.settings.HERO_1_SUBTITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_1_SUBTITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Supper Discount" />
              <label className="block text-xs font-medium mb-1">Prix/Texte</label>
              <input type="text" value={section.settings.HERO_1_PRICE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_1_PRICE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="from $349.99" />
              <label className="block text-xs font-medium mb-1">Bouton</label>
              <input type="text" value={section.settings.HERO_1_CTA || ''} onChange={e => updateSectionSettings(section.id, 'HERO_1_CTA', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="Shop Now" />
            </div>

            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2">Bloc 2 (Haut Centre)</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.HERO_2_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_2_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Heavy On Features..." />
              <label className="block text-xs font-medium mb-1">Sous-titre</label>
              <input type="text" value={section.settings.HERO_2_SUBTITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_2_SUBTITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="Use Code: SALE35%" />
            </div>

            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2">Bloc 3 (Haut Droite)</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.HERO_3_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_3_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Sale 10% Off" />
              <label className="block text-xs font-medium mb-1">Sous-titre</label>
              <input type="text" value={section.settings.HERO_3_SUBTITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_3_SUBTITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="New Product" />
            </div>

            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2">Bloc 4 (Bas Droite)</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.HERO_4_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_4_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Headphones Listen..." />
              <label className="block text-xs font-medium mb-1">Sous-titre</label>
              <input type="text" value={section.settings.HERO_4_SUBTITLE || ''} onChange={e => updateSectionSettings(section.id, 'HERO_4_SUBTITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="Last call..." />
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
          <p className="text-xs text-gray-500">Les articles sont affichés dynamiquement depuis la base de données. Si aucun article n'existe, la section n'apparaîtra pas ou affichera un espace vide.</p>
        </div>
      );
    }

    if (section.type === 'PromoBanners') {
      return (
        <div className="p-4 bg-gray-50 border rounded space-y-4">
          <p className="text-sm text-gray-500">Configurer les 2 bannières promotionnelles côte à côte.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2">Bannière Gauche</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.BANNER_1_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'BANNER_1_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Ex: Smartwatch" />
              <label className="block text-xs font-medium mb-1">Lien cible</label>
              <input type="text" value={section.settings.BANNER_1_LINK || ''} onChange={e => updateSectionSettings(section.id, 'BANNER_1_LINK', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="/category/..." />
            </div>
            <div className="border p-3 rounded bg-white">
              <h4 className="font-bold text-sm mb-2">Bannière Droite</h4>
              <label className="block text-xs font-medium mb-1">Titre</label>
              <input type="text" value={section.settings.BANNER_2_TITLE || ''} onChange={e => updateSectionSettings(section.id, 'BANNER_2_TITLE', e.target.value)} className="w-full border rounded px-2 py-1 text-sm mb-2" placeholder="Ex: Smartphones" />
              <label className="block text-xs font-medium mb-1">Lien cible</label>
              <input type="text" value={section.settings.BANNER_2_LINK || ''} onChange={e => updateSectionSettings(section.id, 'BANNER_2_LINK', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="/category/..." />
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
    <div className="space-y-6">
      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Constructeur de Page d'Accueil</h2>
          <button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition"
          >
            {isLoading ? 'Sauvegarde...' : 'Enregistrer la disposition'}
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Réorganisez les sections de votre page d'accueil en les montant ou descendant. Cliquez sur "Configurer" pour modifier le titre, le filtre de produits et le compte à rebours (le cas échéant).
        </p>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className={`border rounded-lg overflow-hidden ${!section.enabled ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
              <div className="flex items-center p-4 gap-4">
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
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded">{section.type}</span>
                    <input 
                      type="text" 
                      value={section.name} 
                      onChange={e => updateSectionName(section.id, e.target.value)}
                      className="font-bold text-lg border-b border-transparent hover:border-gray-300 focus:border-orange-500 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                    className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition"
                  >
                    {editingId === section.id ? 'Fermer' : 'Configurer'}
                  </button>
                  <button 
                    onClick={() => toggleSection(index)}
                    className={`text-sm px-3 py-1.5 rounded transition ${section.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {section.enabled ? 'Visible' : 'Masqué'}
                  </button>
                  <button onClick={() => removeSection(index)} className="text-red-500 hover:text-red-700 p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              {/* Config Panel */}
              {editingId === section.id && (
                <div className="border-t border-gray-100 bg-white p-4">
                  {renderConfig(section)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold mb-3">Ajouter une nouvelle section</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => addSection('BestDeals')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded transition">+ Grille Promo (Compte à rebours)</button>
            <button onClick={() => addSection('BestSeller')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded transition">+ Grille Simple (Produits)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
