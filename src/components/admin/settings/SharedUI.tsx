export const renderContentInput = (
  section: any, 
  updateSectionSettings: any, 
  label: string, 
  baseKey: string, 
  placeholder: string
) => {
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

export const renderDesignTextControls = (
  section: any,
  updateSectionSettings: any,
  previewMode: string,
  label: string, 
  baseKey: string, 
  colorKey: string, 
  defaultColor: string
) => {
  const mode = previewMode.toUpperCase();
  const sizeKey = `${baseKey}_SIZE_${mode}`;
  const lhKey = `${baseKey}_LINE_HEIGHT_${mode}`;
  const lsKey = `${baseKey}_LETTER_SPACING_${mode}`;
  
  const currentSize = section.settings[sizeKey] ? parseInt(section.settings[sizeKey].replace('px', '')) : 16;
  const currentLh = section.settings[lhKey] || '';
  const currentLs = section.settings[lsKey] ? parseInt(section.settings[lsKey].replace('px', '')) : 0;

  return (
    <div className="mb-5 flex flex-col gap-2">
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        {/* Size */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Taille</span>
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white w-[72px] shrink-0" title="Taille (px)">
             <input 
                type="number" 
                value={currentSize || ''} 
                onChange={e => updateSectionSettings(section.id, sizeKey, e.target.value + 'px')} 
                className="flex-1 w-full text-center text-[13px] border-0 py-1.5 px-1 outline-none bg-transparent min-w-0"
                placeholder="Taille"
             />
             <span className="text-[10px] text-gray-400 bg-gray-50 h-8 px-1.5 border-l border-gray-300 flex items-center justify-center shrink-0">px</span>
          </div>
        </div>
        
        {/* Line Height */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Interligne</span>
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white w-[72px] shrink-0" title="Interligne (ex: 1.2)">
             <input 
                type="number" step="0.1"
                value={currentLh} 
                onChange={e => updateSectionSettings(section.id, lhKey, e.target.value)} 
                className="flex-1 w-full text-center text-[13px] border-0 py-1.5 px-1 outline-none bg-transparent min-w-0"
                placeholder="LH"
             />
             <span className="text-[10px] text-gray-400 bg-gray-50 h-8 px-1.5 border-l border-gray-300 flex items-center justify-center shrink-0">lh</span>
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Espace (lettres)</span>
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white w-[72px] shrink-0" title="Espacement (px)">
             <input 
                type="number" step="1"
                value={currentLs || 0} 
                onChange={e => updateSectionSettings(section.id, lsKey, e.target.value + 'px')} 
                className="flex-1 w-full text-center text-[13px] border-0 py-1.5 px-1 outline-none bg-transparent min-w-0"
                placeholder="LS"
             />
             <span className="text-[10px] text-gray-400 bg-gray-50 h-8 px-1.5 border-l border-gray-300 flex items-center justify-center shrink-0">px</span>
          </div>
        </div>

        {/* Color */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Couleur</span>
          <div className="relative w-[72px] h-8 rounded overflow-hidden border border-gray-300 shadow-sm shrink-0 cursor-pointer" title="Couleur">
            <input 
              type="color" 
              value={section.settings[colorKey] || defaultColor} 
              onChange={e => updateSectionSettings(section.id, colorKey, e.target.value)} 
              className="absolute -top-2 -left-2 w-24 h-24 cursor-pointer border-0 p-0" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
