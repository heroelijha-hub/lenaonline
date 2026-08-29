'use client';
import { useState, useEffect } from 'react';
import { getMediaList, uploadMediaAction, updateMediaAction, deleteMediaAction, deleteMultipleMediaAction } from '@/actions/media';
import { useTranslations } from 'next-intl';

export default function MediaPageClient() {
  const [media, setMedia] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const t = useTranslations('AdminMedia');
  
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);

  const toggleSelection = (m: any) => {
    setSelectedMedia(prev => {
      if (prev.some(item => item.id === m.id)) {
        return prev.filter(item => item.id !== m.id);
      } else {
        return [...prev, m];
      }
    });
  };

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
      alert(res.error || t('upload_error'));
    }
    setIsUploading(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedMedia.length !== 1) return;
    const mediaToUpdate = selectedMedia[0];

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      altText: formData.get('altText') as string,
      description: formData.get('description') as string,
      legend: formData.get('legend') as string,
      link: formData.get('link') as string,
    };

    const res = await updateMediaAction(mediaToUpdate.id, data);
    if (res.success) {
      alert(t('update_success'));
      setMedia(media.map(m => m.id === mediaToUpdate.id ? res.media : m));
      setSelectedMedia([res.media]);
    } else {
      alert(res.error);
    }
  };

  const handleDeleteMultiple = async () => {
    if (!confirm(t('delete_confirm'))) return;
    
    const ids = selectedMedia.map(m => m.id);
    const res = await deleteMultipleMediaAction(ids);
    if (res.success) {
      setSelectedMedia([]);
      fetchMedia(page, search);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div>
          <label className="bg-primary text-white px-4 py-2 rounded cursor-pointer hover:bg-primary-dark">
            {isUploading ? t('uploading') : t('add_media')}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          placeholder={t('search')}
          className="w-full md:w-1/3 px-4 py-2 border rounded"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Grille */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${selectedMedia.length > 0 ? 'md:w-2/3' : 'w-full'}`}>
          {isLoading ? (
            <p>{t('loading')}</p>
          ) : media.length === 0 ? (
            <p>{t('no_media')}</p>
          ) : (
            media.map(m => (
              <div 
                key={m.id} 
                onClick={() => toggleSelection(m)}
                className={`relative aspect-square border rounded overflow-hidden cursor-pointer ${selectedMedia.some(item => item.id === m.id) ? 'border-primary border-4' : 'border-black'}`}
              >
                <img src={m.url} alt={m.altText || m.title || 'media'} className="object-cover w-full h-full" />
              </div>
            ))
          )}
        </div>

        {/* Panneau Latéral de modification */}
        {selectedMedia.length > 0 && (
          <div className="md:w-1/3 bg-gray-50 p-4 border rounded shadow-sm self-start sticky top-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold">
                {selectedMedia.length === 1 ? t('details') : `${selectedMedia.length} sélection(s)`}
              </h2>
              <button onClick={() => setSelectedMedia([])} className="text-gray-500 hover:text-black">&times;</button>
            </div>
            
            {selectedMedia.length === 1 ? (
              <>
                <img src={selectedMedia[0].url} className="w-full h-auto mb-4 rounded" alt="Aperçu" />
                
                <div className="mb-4">
                  <span className="text-xs text-gray-500 block mb-1">{t('file_url')}</span>
                  <div className="flex">
                    <input type="text" readOnly value={selectedMedia[0].url} className="w-full text-xs p-2 border rounded-l bg-gray-100" />
                    <button 
                      onClick={() => { navigator.clipboard.writeText(selectedMedia[0].url); alert(t('copied')); }}
                      className="bg-gray-200 px-3 text-xs border border-l-0 rounded-r hover:bg-gray-300"
                    >
                      {t('copy')}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('media_title')}</label>
                    <input type="text" name="title" defaultValue={selectedMedia[0].title || ''} className="w-full p-2 border rounded" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('alt_text')}</label>
                    <input type="text" name="altText" defaultValue={selectedMedia[0].altText || ''} className="w-full p-2 border rounded" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('legend')}</label>
                    <input type="text" name="legend" defaultValue={selectedMedia[0].legend || ''} className="w-full p-2 border rounded" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('description')}</label>
                    <textarea name="description" defaultValue={selectedMedia[0].description || ''} className="w-full p-2 border rounded" rows={3}></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('link')}</label>
                    <input type="text" name="link" defaultValue={selectedMedia[0].link || ''} className="w-full p-2 border rounded" />
                  </div>

                  <div className="flex justify-between pt-4">
                    <button type="button" onClick={handleDeleteMultiple} className="text-red-500 text-sm hover:underline">
                      {t('delete')}
                    </button>
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary-dark">
                      {t('update')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                 <button type="button" onClick={handleDeleteMultiple} className="bg-red-500 text-white px-6 py-2 rounded font-bold hover:bg-red-600">
                    {t('delete')} ({selectedMedia.length})
                 </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-8">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">{t('previous')}</button>
        <span className="px-3 py-1">{t('page', { page })}</span>
        <button disabled={media.length < 20} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">{t('next')}</button>
      </div>
    </div>
  );
}
