'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';
import MediaPickerModal from '@/components/admin/MediaPickerModal';

export default function SeoForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const router = useRouter();
  
  const [metaTitle, setMetaTitle] = useState(initialSettings.HOME_META_TITLE || '');
  const [metaDescription, setMetaDescription] = useState(initialSettings.HOME_META_DESCRIPTION || '');
  const [ogImage, setOgImage] = useState(initialSettings.HEADER_LOGO_IMAGE || '');
  const [showMediaModal, setShowMediaModal] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    const settingsMap: Record<string, string> = {
      HOME_META_TITLE: metaTitle,
      HOME_META_DESCRIPTION: metaDescription,
      HEADER_LOGO_IMAGE: ogImage,
    };

    await updateSettingsBatch(settingsMap);

    setMessage('Paramètres SEO mis à jour avec succès');
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">SEO & OpenGraph</h2>
        <p className="text-gray-500 mt-1">Paramètres de référencement globaux (appliqués à la page d'accueil et par défaut).</p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <label className="block text-sm font-medium text-gray-700">Meta Titre (Page d'accueil)</label>
            <p className="text-xs text-gray-500 mt-1">L'inspecteur recommande 50 à 60 caractères.</p>
          </div>
          <div className="md:w-2/3">
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Nom de la boutique | Slogan percutant"
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <div className={`text-xs mt-1 ${metaTitle.length < 50 ? 'text-red-500' : metaTitle.length > 60 ? 'text-orange-500' : 'text-green-600'}`}>
              {metaTitle.length} caractères {metaTitle.length > 0 && (metaTitle.length < 50 ? '(Trop court)' : metaTitle.length > 60 ? '(Peut être tronqué)' : '(Parfait)')}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-gray-100 pb-6">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <label className="block text-sm font-medium text-gray-700">Meta Description</label>
            <p className="text-xs text-gray-500 mt-1">L'inspecteur recommande 80 à 125 caractères pour un meilleur taux de clic (CTR).</p>
          </div>
          <div className="md:w-2/3">
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              placeholder="Découvrez notre boutique..."
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <div className={`text-xs mt-1 ${metaDescription.length < 80 ? 'text-red-500' : metaDescription.length > 125 ? 'text-orange-500' : 'text-green-600'}`}>
              {metaDescription.length} caractères {metaDescription.length > 0 && (metaDescription.length < 80 ? '(Trop court)' : metaDescription.length > 125 ? '(Peut être tronqué)' : '(Parfait)')}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between pb-2">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <label className="block text-sm font-medium text-gray-700">Image OpenGraph (og:image)</label>
            <p className="text-xs text-gray-500 mt-1">Image utilisée lors du partage sur les réseaux sociaux. L'inspecteur recommande un ratio de 1.91:1 (idéalement 1200x630 pixels) avec un texte d'accroche.</p>
          </div>
          <div className="md:w-2/3">
            {ogImage && (
              <div className="mb-3">
                <img src={ogImage} alt="OG Image" className="max-w-xs rounded-md border border-gray-200 shadow-sm" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowMediaModal(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {ogImage ? 'Changer l\'image' : 'Choisir une image (1200x630)'}
            </button>
            
            {showMediaModal && (
              <MediaPickerModal 
                onClose={() => setShowMediaModal(false)}
                onSelect={(url) => {
                  setOgImage(url);
                  setShowMediaModal(false);
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors"
        >
          {isLoading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}
