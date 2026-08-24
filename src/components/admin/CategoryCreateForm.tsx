'use client';

import { useState } from 'react';
import { createCategory } from '@/actions/admin';
import { useTranslations } from 'next-intl';

export default function CategoryCreateForm({ categories }: { categories: any[] }) {
  const t = useTranslations('AdminCategories');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
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
    await createCategory(formData);
    setName('');
    setSlug('');
    setParentId('');
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
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button 
        type="submit" 
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition disabled:opacity-50"
      >
        {t('add_btn')}
      </button>
    </form>
  );
}
