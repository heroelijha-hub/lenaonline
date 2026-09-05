'use client';

import { useState } from 'react';
import { createCategory } from '@/actions/admin';
import { useTranslations } from 'next-intl';

export default function CategoryCreateForm({ categories }: { categories: any[] }) {
  const t = useTranslations('AdminCategories');
  const tSeo = useTranslations('AdminSEO');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [showSeo, setShowSeo] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateSlug = (text: string) => 
    text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(generateSlug(newName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    if (parentId) formData.append('parentId', parentId);
    if (metaTitle) formData.append('metaTitle', metaTitle);
    if (metaDescription) formData.append('metaDescription', metaDescription);
    if (metaKeywords) formData.append('metaKeywords', metaKeywords);
    
    await createCategory(formData);
    setName('');
    setSlug('');
    setParentId('');
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
    setShowSeo(false);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row flex-wrap gap-4">
      <input 
        type="text" 
        value={name}
        onChange={handleNameChange}
        placeholder={t('name_placeholder')}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
        required
      />
      <input 
        type="text" 
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder={t('slug_placeholder')}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 bg-gray-50"
        required
      />
      <select 
        value={parentId}
        onChange={(e) => setParentId(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 bg-white"
      >
        <option value="">{t('no_parent_option')}</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.displayName || c.name}</option>
        ))}
      </select>
      <button 
        type="submit" 
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition disabled:opacity-50"
      >
        {t('add_btn')}
      </button>
      <div className="w-full mt-2">
        <button 
          type="button" 
          onClick={() => setShowSeo(!showSeo)}
          className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center transition"
        >
          <svg className={`w-4 h-4 mr-1 transition-transform ${showSeo ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          {tSeo('seo_section_title')}
        </button>
      </div>

      {showSeo && (
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-4 bg-gray-50 border border-gray-100 rounded-md">
          <input 
            type="text" 
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={tSeo('meta_title_placeholder')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input 
            type="text" 
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder={tSeo('meta_desc_placeholder')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input 
            type="text" 
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            placeholder={tSeo('meta_keywords_placeholder')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}
    </form>
  );
}
