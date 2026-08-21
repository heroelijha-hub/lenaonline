'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { getPage, createPage, updatePage } from '@/actions/pages';

export default function AdminPageForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    desktopContent: '',
    mobileContent: '',
    isPublished: false
  });

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    
    getPage(id).then((res) => {
      if (res.success && res.data) {
        setFormData({
          title: res.data.title,
          slug: res.data.slug,
          desktopContent: res.data.desktopContent || '',
          mobileContent: res.data.mobileContent || '',
          isPublished: res.data.isPublished
        });
      } else {
        setError(res.error || "Page introuvable");
      }
      setLoading(false);
    });
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    let res;
    if (isNew) {
      res = await createPage(formData);
    } else {
      res = await updatePage(id, formData);
    }
    
    setSaving(false);
    if (res.success) {
      router.push('/admin/pages');
      router.refresh();
    } else {
      setError(res.error || "Erreur lors de l'enregistrement");
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Créer une page' : 'Éditer la page'}
        </h1>
        <button
          onClick={() => router.push('/admin/pages')}
          className="text-gray-600 hover:text-gray-900 font-medium text-sm border border-gray-300 px-4 py-2 rounded-md bg-white hover:bg-gray-50 transition"
        >
          Retour
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Informations Générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre de la page</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 transition"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (URL)</label>
              <div className="flex items-center">
                <span className="text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md px-3 py-2 text-sm select-none">/</span>
                <input
                  type="text"
                  required
                  placeholder="a-propos"
                  className="w-full border border-gray-300 rounded-r-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 transition"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center mt-6 pt-4 border-t border-gray-50">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900 font-medium cursor-pointer">
              Publier cette page (visible publiquement)
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Version Desktop (PC & Tablette)
          </h2>
          <p className="text-xs text-gray-500 mb-2">Ce contenu s'affichera sur les écrans larges.</p>
          <RichTextEditor 
            value={formData.desktopContent} 
            onChange={(val) => setFormData({...formData, desktopContent: val})}
            placeholder="Saisissez le contenu pour les ordinateurs..."
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            Version Mobile (Smartphone)
          </h2>
          <p className="text-xs text-gray-500 mb-2">Ce contenu s'affichera uniquement sur les petits écrans.</p>
          <RichTextEditor 
            value={formData.mobileContent} 
            onChange={(val) => setFormData({...formData, mobileContent: val})}
            placeholder="Saisissez le contenu spécifique pour mobile..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-8 rounded-md transition shadow-sm disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer la page'}
          </button>
        </div>
      </form>
    </div>
  );
}
