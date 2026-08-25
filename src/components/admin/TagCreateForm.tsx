'use client';

import { useState } from 'react';
import { createTag } from '@/actions/admin';

export default function TagCreateForm() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
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
    await createTag(formData);
    setName('');
    setSlug('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row flex-wrap gap-4">
      <input 
        type="text" 
        value={name}
        onChange={handleNameChange}
        placeholder="Nom du tag"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
        required
      />
      <input 
        type="text" 
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="Slug"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800 bg-gray-50"
        required
      />
      <button 
        type="submit" 
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition disabled:opacity-50"
      >
        Ajouter
      </button>
    </form>
  );
}
