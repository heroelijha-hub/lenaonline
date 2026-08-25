'use client';

import { useState, useRef } from 'react';
import { createBrandAction, uploadImage } from '@/actions/admin';

export default function BrandCreateForm() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prévisualisation locale immédiate
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = await uploadImage(formData);
      if (url) {
        setLogoUrl(url);
      }
    } catch (err) {
      alert("Erreur lors de l'upload du logo.");
      setLogoPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    await createBrandAction(formData, logoUrl || undefined);
    setName('');
    setSlug('');
    setLogoUrl('');
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row flex-wrap gap-4 items-end">
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Nom de la marque"
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

      {/* Zone upload logo */}
      <div className="flex items-center gap-3">
        {/* Prévisualisation */}
        {logoPreview ? (
          <div className="relative w-10 h-10 flex-shrink-0">
            <img
              src={logoPreview}
              alt="Logo prévisualisation"
              className="w-10 h-10 object-contain rounded border border-gray-200"
            />
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none hover:bg-red-600"
              title="Supprimer le logo"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="w-10 h-10 flex-shrink-0 border border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50">
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Bouton upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="hidden"
          id="brand-logo-upload"
        />
        <label
          htmlFor="brand-logo-upload"
          className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {uploading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Upload...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {logoUrl ? 'Changer le logo' : 'Logo (optionnel)'}
            </>
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || uploading}
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition disabled:opacity-50"
      >
        {loading ? 'Ajout...' : 'Ajouter'}
      </button>
    </form>
  );
}
