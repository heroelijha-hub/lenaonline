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
  const sizeKey = `${baseKey}_SIZE_${previewMode.toUpperCase()}`;
  const currentValue = section.settings[sizeKey] ? parseInt(section.settings[sizeKey].replace('px', '')) : 16;
  return (
    <div className="mb-5 flex flex-col gap-2">
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white w-24 shrink-0">
           <input 
              type="number" 
              value={currentValue || ''} 
              onChange={e => updateSectionSettings(section.id, sizeKey, e.target.value + 'px')} 
              className="flex-1 w-full text-center text-sm border-0 py-1.5 px-1 outline-none bg-transparent min-w-0"
           />
           <span className="text-xs text-gray-500 bg-gray-50 h-8 px-2 border-l border-gray-300 flex items-center justify-center shrink-0">px</span>
        </div>
        <div className="relative w-8 h-8 rounded overflow-hidden border border-gray-300 shadow-sm shrink-0 cursor-pointer">
          <input 
            type="color" 
            value={section.settings[colorKey] || defaultColor} 
            onChange={e => updateSectionSettings(section.id, colorKey, e.target.value)} 
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 p-0" 
          />
        </div>
      </div>
    </div>
  );
};
