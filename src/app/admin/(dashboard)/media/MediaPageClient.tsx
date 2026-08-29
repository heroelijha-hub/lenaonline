'use client';
import { useState, useEffect } from 'react';
import { getMediaList, uploadMediaAction, updateMediaAction, deleteMediaAction } from '@/actions/media';
import { useTranslations } from 'next-intl';

export default function MediaPageClient() {
  const [media, setMedia] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);

  const fetchMedia = async (p = 1, s = '') => {
    setIsLoading(true);
    const res = await getMediaList(p, 20, s);
    setMedia(res.items);
    setTotal(res.total);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMedia(page, search);
  }, [page, search]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await uploadMediaAction(formData);
    if (res.success) {
      setPage(1);
      fetchMedia(1, search);
    } else {
      alert(res.error || 'Erreur lors de l\'upload');
    }
    setIsUploading(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMedia) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      altText: formData.get('altText') as string,
      description: formData.get('description') as string,
      legend: formData.get('legend') as string,
      link: formData.get('link') as string,
    };

    const res = await updateMediaAction(selectedMedia.id, data);
    if (res.success) {
      alert('Média mis à jour avec succès');
      setMedia(media.map(m => m.id === selectedMedia.id ? res.media : m));
      setSelectedMedia(res.media);
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce média ? (Attention, si ce média est utilisé, il restera affiché via son URL mais disparaîtra de la bibliothèque)')) return;
    
    const res = await deleteMediaAction(id);
    if (res.success) {
      setSelectedMedia(null);
      fetchMedia(page, search);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bibliothèque de médias</h1>
        <div>
          <label className="bg-primary text-white px-4 py-2 rounded cursor-pointer hover:bg-primary-dark">
            {isUploading ? 'Upload en cours...' : 'Ajouter un média'}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Rechercher (Titre, Texte alternatif)..."
          className="w-full md:w-1/3 px-4 py-2 border rounded"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Grille */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${selectedMedia ? 'md:w-2/3' : 'w-full'}`}>
          {isLoading ? (
            <p>Chargement...</p>
          ) : media.length === 0 ? (
            <p>Aucun média trouvé.</p>
          ) : (
            media.map(m => (
              <div 
                key={m.id} 
                onClick={() => setSelectedMedia(m)}
                className={`relative aspect-square border-2 rounded overflow-hidden cursor-pointer ${selectedMedia?.id === m.id ? 'border-primary' : 'border-transparent'}`}
              >
                <img src={m.url} alt={m.altText || m.title || 'media'} className="object-cover w-full h-full" />
              </div>
            ))
          )}
        </div>

        {/* Panneau Latéral de modification */}
        {selectedMedia && (
          <div className="md:w-1/3 bg-gray-50 p-4 border rounded shadow-sm self-start sticky top-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold">Détails du média</h2>
              <button onClick={() => setSelectedMedia(null)} className="text-gray-500 hover:text-black">&times;</button>
            </div>
            
            <img src={selectedMedia.url} className="w-full h-auto mb-4 rounded" alt="Aperçu" />
            
            <div className="mb-4">
              <span className="text-xs text-gray-500 block mb-1">URL du fichier</span>
              <div className="flex">
                <input type="text" readOnly value={selectedMedia.url} className="w-full text-xs p-2 border rounded-l bg-gray-100" />
                <button 
                  onClick={() => { navigator.clipboard.writeText(selectedMedia.url); alert('Copié!'); }}
                  className="bg-gray-200 px-3 text-xs border border-l-0 rounded-r hover:bg-gray-300"
                >
                  Copier
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input type="text" name="title" defaultValue={selectedMedia.title || ''} className="w-full p-2 border rounded" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Texte alternatif (SEO & Accessibilité)</label>
                <input type="text" name="altText" defaultValue={selectedMedia.altText || ''} className="w-full p-2 border rounded" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Légende</label>
                <input type="text" name="legend" defaultValue={selectedMedia.legend || ''} className="w-full p-2 border rounded" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" defaultValue={selectedMedia.description || ''} className="w-full p-2 border rounded" rows={3}></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Lien personnalisé</label>
                <input type="text" name="link" defaultValue={selectedMedia.link || ''} className="w-full p-2 border rounded" />
              </div>

              <div className="flex justify-between pt-4">
                <button type="button" onClick={() => handleDelete(selectedMedia.id)} className="text-red-500 text-sm hover:underline">
                  Supprimer
                </button>
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary-dark">
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-8">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Précédent</button>
        <span className="px-3 py-1">Page {page}</span>
        <button disabled={media.length < 20} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Suivant</button>
      </div>
    </div>
  );
}
