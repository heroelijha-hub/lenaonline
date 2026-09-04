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
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white w-[70px]">
             <input 
                type="number" 
                value={currentValue || ''} 
                onChange={e => updateSectionSettings(section.id, sizeKey, e.target.value + 'px')} 
                className="w-10 px-1 py-1 text-sm text-center outline-none" 
             />
             <span className="bg-gray-50 text-gray-500 text-[10px] px-1 py-1 border-l border-gray-300 w-full text-center">px</span>
          </div>
          <div className="relative w-8 h-8 rounded overflow-hidden border border-gray-300 shadow-sm shrink-0 cursor-pointer">
            <input 
              type="color" 
              value={section.settings[colorKey] || defaultColor || '#000000'} 
              onChange={e => updateSectionSettings(section.id, colorKey, e.target.value)} 
              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0" 
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
      
      {/* Editor Area */}
      <div className="p-5 lg:p-6 bg-gray-50/50">
        {activeBlock === 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 bg-gray-100 px-4 py-2 rounded-lg inline-block w-full text-center">Paramètres Généraux</h3>
            
            <div className="flex flex-col gap-4">
              <div className="bg-white p-4 border rounded-xl shadow-sm">
                <h4 className="font-bold text-sm mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                  <span>🎨</span> Layout Design
                </h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100 hover:border-gray-300">
                    <input 
                      type="radio" 
                      name={`layout-${section.id}`}
                      checked={!isStyle2}
                      onChange={() => updateSectionSettings(section.id, 'HERO_LAYOUT', 'STYLE_1')}
                      className="text-orange-600 focus:ring-orange-500 w-5 h-5"
                    />
                    <span className="font-medium text-base">Style 1 (4 Blocks)</span>
                  </label>
                  <label className="flex items-center space-x-3 text-sm text-gray-700 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100 hover:border-gray-300">
                    <input 
                      type="radio" 
                      name={`layout-${section.id}`}
                      checked={isStyle2}
                      onChange={() => updateSectionSettings(section.id, 'HERO_LAYOUT', 'STYLE_2')}
                      className="text-orange-600 focus:ring-orange-500 w-5 h-5"
                    />
                    <span className="font-medium text-base">Style 2 (3 Blocks - Modern)</span>
                  </label>
                </div>
              </div>

              <div className="bg-white p-4 border rounded-xl shadow-sm">
                <h4 className="font-bold text-sm mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                  <span>📱</span> Mobile Display
                </h4>
                <p className="text-sm text-gray-500 mb-4">Select the blocks to <strong>display</strong> on mobile:</p>
                <div className="flex flex-col gap-2">
                  {Array.from({ length: totalBlocks }).map((_, i) => {
                    const num = i + 1;
                    const mobileHideKey = isStyle2 ? `STYLE2_HERO_${num}_HIDE_MOBILE` : `HERO_${num}_HIDE_MOBILE`;
                    return (
                      <label key={num} className="flex items-center justify-between space-x-2 text-sm text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                        <span className="font-semibold">Block {num}</span>
                        <input 
                          type="checkbox" 
                          checked={section.settings[mobileHideKey] !== 'true'} 
                          onChange={e => updateSectionSettings(section.id, mobileHideKey, e.target.checked ? 'false' : 'true')}
                          className="rounded text-orange-600 focus:ring-orange-500 w-5 h-5"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Header & Tabs */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 bg-gray-100 px-4 py-2 rounded-lg inline-block">Image Box {activeBlock}</h3>
              
              <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-sm">
                <button 
                  type="button"
                  onClick={() => setActiveTab('content')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${
                    activeTab === 'content' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Content
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
            </div>

            {/* Tab Content */}
            <div className="max-w-2xl">
              {activeTab === 'content' ? renderContentTab(activeBlock) : renderDesignTab(activeBlock)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
