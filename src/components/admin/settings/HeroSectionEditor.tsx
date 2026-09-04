'use client';
import { useState, useEffect } from 'react';
import { SectionConfig } from '@/app/admin/(dashboard)/landing/LandingForm';

interface HeroSectionEditorProps {
  section: SectionConfig;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  updateSectionSettings: (id: string, key: string, value: any) => void;
  handleUpload: (id: string, key: string) => void;
  editingBlockNum?: number;
}

export default function HeroSectionEditor({ section, previewMode, updateSectionSettings, handleUpload, editingBlockNum }: HeroSectionEditorProps) {
  const isStyle2 = section.settings.HERO_LAYOUT === 'STYLE_2';
  const totalBlocks = isStyle2 ? 3 : 4;
  
  const [activeBlock, setActiveBlock] = useState<number>(editingBlockNum || 0);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  useEffect(() => {
    if (editingBlockNum !== undefined) {
      setActiveBlock(editingBlockNum);
    }
  }, [editingBlockNum]);

  const renderContentInput = (label: string, baseKey: string, placeholder: string) => {
    return (
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
        <input 
          type="text" 
          value={section.settings[baseKey] || ''} 
          onChange={e => updateSectionSettings(section.id, baseKey, e.target.value)} 
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500 outline-none transition-colors" 
          placeholder={placeholder} 
        />
      </div>
    );
  };

  const renderDesignTextControls = (label: string, baseKey: string, colorKey: string, defaultColor: string) => {
    const sizeKey = `${baseKey}_SIZE_${previewMode.toUpperCase()}`;
    const currentValue = section.settings[sizeKey] ? parseInt(section.settings[sizeKey].replace('px', '')) : 16;
    return (
      <div className="mb-5 flex flex-col gap-2">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-3">
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={currentValue || 16}
            onChange={e => updateSectionSettings(section.id, sizeKey, e.target.value + 'px')}
            className="flex-1 accent-orange-500 h-1"
          />
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white w-[85px]">
             <input 
                type="number" 
                value={currentValue || ''} 
                onChange={e => updateSectionSettings(section.id, sizeKey, e.target.value + 'px')} 
                className="w-14 px-1 py-1 text-sm text-center outline-none" 
             />
             <span className="bg-gray-50 text-gray-500 text-[10px] px-1.5 py-1.5 border-l border-gray-300 flex-1 text-center font-medium">px</span>
          </div>
          <div className="relative w-6 h-6 rounded overflow-hidden border border-gray-300 shadow-sm shrink-0 cursor-pointer">
            <input 
              type="color" 
              value={section.settings[colorKey] || defaultColor || '#000000'} 
              onChange={e => updateSectionSettings(section.id, colorKey, e.target.value)} 
              className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 p-0" 
            />
          </div>
        </div>
      </div>
    );
  };

  const getPrefix = (blockNum: number) => isStyle2 ? `STYLE2_HERO_${blockNum}` : `HERO_${blockNum}`;

  const renderContentTab = (blockNum: number) => {
    const prefix = getPrefix(blockNum);
    return (
      <div className="space-y-4 mt-4">
        {renderContentInput('Titre', `${prefix}_TITLE`, 'Entrez le titre...')}
        {renderContentInput('Sous-titre / badge', `${prefix}_SUBTITLE`, 'Sous-titre...')}
        {!isStyle2 && blockNum === 1 && renderContentInput('Price/Texte', 'HERO_1_PRICE', 'from $349.99')}
        {renderContentInput('Bouton', `${prefix}_CTA`, 'Shop Now')}
      </div>
    );
  };

  const renderDesignTab = (blockNum: number) => {
    const basePrefix = isStyle2 ? 'STYLE2_HERO' : 'HERO';
    const prefix = `${basePrefix}_${blockNum}`;
    
    return (
      <div className="space-y-5 mt-4">
        {/* Background Image */}
        <div>
          <label className="block text-sm font-semibold text-red-700 mb-2">Background image</label>
          <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[120px] transition hover:bg-gray-100">
            {section.settings[`${prefix}_BG_IMAGE`] ? (
              <>
                <img src={section.settings[`${prefix}_BG_IMAGE`]} className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-50" />
                <div className="relative z-10 flex gap-2">
                  <button type="button" onClick={() => handleUpload(section.id, `${prefix}_BG_IMAGE`)} className="bg-white text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm border">Modifier</button>
                  <button type="button" onClick={() => updateSectionSettings(section.id, `${prefix}_BG_IMAGE`, '')} className="bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">Supprimer</button>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => handleUpload(section.id, `${prefix}_BG_IMAGE`)} className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition">
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                <span className="text-xs font-medium">Ajouter une image</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id={`show_bg_${prefix}`} checked={section.settings[`${prefix}_SHOW_BG_IMAGE`] !== 'false'} onChange={e => updateSectionSettings(section.id, `${prefix}_SHOW_BG_IMAGE`, e.target.checked ? 'true' : 'false')} className="rounded text-orange-600 focus:ring-orange-500" />
            <label htmlFor={`show_bg_${prefix}`} className="text-xs text-gray-600">Afficher l'image de fond</label>
          </div>
        </div>

        {/* Main Image */}
        <div>
          <label className="block text-sm font-semibold text-red-700 mb-2">Main image (Product)</label>
          <div className="border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[120px] transition hover:bg-gray-100">
            {section.settings[`${prefix}_IMAGE`] ? (
              <>
                <img src={section.settings[`${prefix}_IMAGE`]} className="absolute inset-0 w-full h-full object-contain p-2 rounded-xl" />
                <div className="relative z-10 flex gap-2 opacity-0 hover:opacity-100 bg-white/80 p-2 rounded-lg transition">
                  <button type="button" onClick={() => handleUpload(section.id, `${prefix}_IMAGE`)} className="bg-white text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm border">Modifier</button>
                  <button type="button" onClick={() => updateSectionSettings(section.id, `${prefix}_IMAGE`, '')} className="bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">Supprimer</button>
                </div>
              </>
            ) : (
              <button type="button" onClick={() => handleUpload(section.id, `${prefix}_IMAGE`)} className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition">
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                <span className="text-xs font-medium">Ajouter une image</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id={`show_img_${prefix}`} checked={section.settings[`${prefix}_SHOW_IMAGE`] !== 'false'} onChange={e => updateSectionSettings(section.id, `${prefix}_SHOW_IMAGE`, e.target.checked ? 'true' : 'false')} className="rounded text-orange-600 focus:ring-orange-500" />
            <label htmlFor={`show_img_${prefix}`} className="text-xs text-gray-600">Afficher l'image principale</label>
          </div>
        </div>

        {/* Typographie & Couleurs des textes */}
        <div className="mt-8 border-t pt-6">
          {renderDesignTextControls('Titre', `${prefix}_TITLE`, `${prefix}_TEXT_COLOR`, '#1e293b')}
          {renderDesignTextControls('Sous-titre', `${prefix}_SUBTITLE`, `${prefix}_SUBTITLE_COLOR`, '#ef4444')}
          {!isStyle2 && blockNum === 1 && renderDesignTextControls('Price/Texte', 'HERO_1_PRICE', 'HERO_1_TEXT_COLOR', '#1e293b')}
          {renderDesignTextControls('Bouton', `${prefix}_CTA`, `${prefix}_BTN_TEXT_COLOR`, '#ffffff')}
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div>
            <label className="block text-[11px] font-medium mb-1 text-gray-500">Block Background</label>
            <div className="relative w-full h-10 rounded-md overflow-hidden border border-gray-300 shadow-sm cursor-pointer">
              <input type="color" value={section.settings[`${prefix}_BG_COLOR`] || '#ffffff'} onChange={e => updateSectionSettings(section.id, `${prefix}_BG_COLOR`, e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1 text-gray-500">Button Background</label>
            <div className="relative w-full h-10 rounded-md overflow-hidden border border-gray-300 shadow-sm cursor-pointer">
              <input type="color" value={section.settings[`${prefix}_BTN_BG_COLOR`] || '#f97316'} onChange={e => updateSectionSettings(section.id, `${prefix}_BTN_BG_COLOR`, e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0 p-0" />
            </div>
          </div>
        </div>

        {/* Link */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Redirect link (URL)</label>
          <input type="text" value={section.settings[`${prefix}_LINK`] || ''} onChange={e => updateSectionSettings(section.id, `${prefix}_LINK`, e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500 outline-none text-gray-400 placeholder-gray-300" placeholder="/product/..." />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button type="button" className="text-gray-500 hover:text-gray-900 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">HERO</span>
          <h2 className="font-bold text-base text-gray-800">Main header</h2>
        </div>
        <button type="button" className="text-green-600 hover:text-green-800 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

      <div className="p-5 lg:p-6 space-y-6">
        
        {/* Layout Design */}
        <div>
          <h3 className="font-bold text-sm text-gray-800 mb-3">Layout design</h3>
          <div className="flex flex-col gap-2">
            <label className={`flex items-center space-x-3 text-sm text-gray-700 cursor-pointer px-4 py-3 rounded-xl border transition ${!isStyle2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input 
                type="radio" 
                name={`layout-${section.id}`}
                checked={!isStyle2}
                onChange={() => updateSectionSettings(section.id, 'HERO_LAYOUT', 'STYLE_1')}
                className="text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-medium">Style 1 (4 blocks)</span>
            </label>
            <label className={`flex items-center space-x-3 text-sm text-gray-700 cursor-pointer px-4 py-3 rounded-xl border transition ${isStyle2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input 
                type="radio" 
                name={`layout-${section.id}`}
                checked={isStyle2}
                onChange={() => updateSectionSettings(section.id, 'HERO_LAYOUT', 'STYLE_2')}
                className="text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-medium">Style 2 (3 blocks)</span>
            </label>
          </div>
        </div>

        {/* Mobile Display */}
        <div>
          <h3 className="font-bold text-sm text-gray-800 mb-3">Mobile display</h3>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: totalBlocks }).map((_, i) => {
              const num = i + 1;
              const mobileHideKey = isStyle2 ? `STYLE2_HERO_${num}_HIDE_MOBILE` : `HERO_${num}_HIDE_MOBILE`;
              return (
                <label key={num} className="flex items-center justify-between space-x-2 text-sm text-gray-700 cursor-pointer bg-white px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition">
                  <span className="font-medium">Block {num}</span>
                  <input 
                    type="checkbox" 
                    checked={section.settings[mobileHideKey] !== 'true'} 
                    onChange={e => updateSectionSettings(section.id, mobileHideKey, e.target.checked ? 'false' : 'true')}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* BLOCS Accordion */}
        <div className="pt-2 border-t border-gray-100">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">Blocs</h3>
          <div className="flex flex-col gap-2">
            {Array.from({ length: totalBlocks }).map((_, i) => {
              const num = i + 1;
              const isExpanded = activeBlock === num;
              const blockTitle = isStyle2 
                ? (num === 1 ? 'Bloc 1 (gauche)' : num === 2 ? 'Bloc 2 (haut droite)' : 'Bloc 3 (bas droite)') 
                : (num === 1 ? 'Bloc 1 (gauche)' : num === 2 ? 'Bloc 2 (haut centre)' : num === 3 ? 'Bloc 3 (haut droite)' : 'Bloc 4 (bas droite)');
              
              return (
                <div key={num} className={`border rounded-xl overflow-hidden transition-all duration-200 ${isExpanded ? 'border-gray-300 shadow-sm' : 'border-gray-200'}`}>
                  <button 
                    type="button"
                    onClick={() => setActiveBlock(isExpanded ? 0 : num)}
                    className={`w-full text-left px-5 py-4 font-bold text-sm transition-colors ${isExpanded ? 'bg-gray-200/60 text-gray-900' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                  >
                    {blockTitle}
                  </button>
                  {isExpanded && (
                    <div className="p-5 bg-white border-t border-gray-200">
                      
                      {/* Tabs */}
                      <div className="flex bg-gray-100 p-1 rounded-lg w-full mb-6">
                        <button 
                          type="button"
                          onClick={() => setActiveTab('content')}
                          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${
                            activeTab === 'content' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Contenu
                        </button>
                        <button 
                          type="button"
                          onClick={() => setActiveTab('design')}
                          className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${
                            activeTab === 'design' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Design
                        </button>
                      </div>

                      {/* Tab Content */}
                      <div className="max-w-2xl">
                        {activeTab === 'content' ? renderContentTab(num) : renderDesignTab(num)}
                      </div>
                      
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
