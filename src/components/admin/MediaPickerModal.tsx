'use client';
import { useState, useEffect } from 'react';
import { getMediaList } from '@/actions/media';

export default function MediaPickerModal({ 
  onClose, 
  onSelect 
}: { 
  onClose: () => void; 
  onSelect: (url: string) => void;
}) {
  const [media, setMedia] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedia = async (p = 1, s = '') => {
    setIsLoading(true);
    const res = await getMediaList(p, 20, s);
    setMedia(res.items);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMedia(page, search);
  }, [page, search]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Sélectionner un Média</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black font-bold text-xl">&times;</button>
        </div>

        <div className="p-4 border-b">
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="w-full md:w-1/2 px-4 py-2 border rounded"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          {isLoading ? (
            <p className="text-center py-8">Chargement...</p>
          ) : media.length === 0 ? (
            <p className="text-center py-8">Aucun média trouvé.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {media.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => onSelect(m.url)}
                  className="relative aspect-square border rounded overflow-hidden cursor-pointer hover:border-primary group"
                >
                  <img src={m.url} alt={m.altText || m.title || 'media'} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center">
                    <span className="text-white text-sm font-bold">Sélectionner</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-between items-center bg-gray-50 rounded-b-lg">
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm bg-white">Précédent</button>
            <button disabled={media.length < 20} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm bg-white">Suivant</button>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Fermer</button>
        </div>

      </div>
    </div>
  );
}
