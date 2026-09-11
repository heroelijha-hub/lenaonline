'use client';
import { useState } from 'react';
import { renderContentInput, renderDesignTextControls } from './SharedUI';

interface LatestBlogsEditorProps {
  section: any;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  updateSectionSettings: (id: string, key: string, value: any) => void;
  goBack: () => void;
}

export default function LatestBlogsEditor({ 
  section, 
  previewMode, 
  updateSectionSettings, 
  goBack 
}: LatestBlogsEditorProps) {
  
  const [openSection, setOpenSection] = useState<'content' | 'design' | ''>('content');

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col h-full">
      {/* HEADER */}
      <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={goBack} 
            className="text-gray-500 hover:text-gray-800 transition p-1.5 hover:bg-gray-200 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">Edit Section</h3>
            <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
              Latest Blogs
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        
        {/* GENERAL SETTINGS */}
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">General Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Display Mode</label>
              <select
                value={section.settings.displayMode || 'DATE_DESC'}
                onChange={e => updateSectionSettings(section.id, 'displayMode', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-orange-500"
              >
                <option value="DATE_DESC">Newest first</option>
                <option value="DATE_ASC">Oldest first</option>
                <option value="MANUAL">Manual selection (by ID)</option>
              </select>
            </div>

            {section.settings.displayMode === 'MANUAL' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Article IDs (comma-separated)</label>
                <input 
                  type="text" 
                  value={section.settings.manualIds || ''} 
                  onChange={e => updateSectionSettings(section.id, 'manualIds', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-orange-500"
                  placeholder="Ex: id1, id2, id3"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the exact IDs of the articles you want to display on the homepage.</p>
              </div>
            )}
            <p className="text-xs text-gray-500">Articles are displayed dynamically from the database. If no article exists, the section will not appear.</p>
          </div>
        </div>

        {/* CONTENT ACCORDION */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-6">
          <button
            type="button"
            onClick={() => setOpenSection(openSection === 'content' ? '' : 'content')}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-semibold text-sm text-gray-800">Content Settings</span>
            <svg className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'content' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openSection === 'content' && (
            <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="space-y-4">
            {renderContentInput(section, updateSectionSettings, 'Blog Section Title', 'title', 'Latest Blogs')}
            {renderContentInput(section, updateSectionSettings, '"See All" Link Text', 'SEE_ALL_TEXT', 'See All')}
          </div>

            </div>
          )}
        </div>

        {/* DESIGN ACCORDION */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mt-6">
          <button
            type="button"
            onClick={() => setOpenSection(openSection === 'design' ? '' : 'design')}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-semibold text-sm text-gray-800">Design Settings</span>
            <svg className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'design' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {openSection === 'design' && (
            <div className="p-4 border-t border-gray-200">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Typography & Colors</h4>
            {renderDesignTextControls(section, updateSectionSettings, previewMode, 'Section Title', 'title', 'titleColor', '#111827')}
            {renderDesignTextControls(section, updateSectionSettings, previewMode, '"See All" Link', 'SEE_ALL_TEXT', 'seeAllColor', '#ea580c')}
          </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
