'use client';

import { useState } from 'react';
import { restoreProduct, restoreMedia, permanentlyDeleteProduct, permanentlyDeleteMedia, emptyTrash } from '@/actions/trash';

export default function TrashPageClient({ initialProducts, initialMedia }: { initialProducts: any[], initialMedia: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [media, setMedia] = useState(initialMedia);
  const [activeTab, setActiveTab] = useState<'products' | 'media'>('products');
  const [loading, setLoading] = useState(false);

  const handleRestoreProduct = async (id: string) => {
    setLoading(true);
    const res = await restoreProduct(id);
    if (res.success) {
      setProducts(products.filter(p => p.id !== id));
      alert('Produit restauré avec succès.');
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleRestoreMedia = async (id: string) => {
    setLoading(true);
    const res = await restoreMedia(id);
    if (res.success) {
      setMedia(media.filter(m => m.id !== id));
      alert('Média restauré avec succès.');
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit DÉFINITIVEMENT ? Cette action est irréversible.')) return;
    setLoading(true);
    const res = await permanentlyDeleteProduct(id);
    if (res.success) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce média DÉFINITIVEMENT ? Cette action est irréversible.')) return;
    setLoading(true);
    const res = await permanentlyDeleteMedia(id);
    if (res.success) {
      setMedia(media.filter(m => m.id !== id));
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Voulez-vous vraiment VIDER TOUTE LA CORBEILLE ? Cette action est irréversible.')) return;
    setLoading(true);
    const res = await emptyTrash();
    if (res.success) {
      setProducts([]);
      setMedia([]);
      alert('Corbeille vidée avec succès.');
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Corbeille</h1>
        <button 
          onClick={handleEmptyTrash} 
          disabled={loading || (products.length === 0 && media.length === 0)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Vider la corbeille
        </button>
      </div>

      <div className="flex border-b mb-6">
        <button 
          className={`py-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-primary font-bold text-primary' : 'text-gray-500 hover:text-black'}`}
          onClick={() => setActiveTab('products')}
        >
          Produits ({products.length})
        </button>
        <button 
          className={`py-2 px-4 ${activeTab === 'media' ? 'border-b-2 border-primary font-bold text-primary' : 'text-gray-500 hover:text-black'}`}
          onClick={() => setActiveTab('media')}
        >
          Médias ({media.length})
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucun produit dans la corbeille.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-4 font-semibold text-gray-600">Produit</th>
                  <th className="p-4 font-semibold text-gray-600">Supprimé le</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                        )}
                      </div>
                      <span className="font-medium text-gray-800">{product.title}</span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {product.deletedAt ? new Date(product.deletedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button 
                        onClick={() => handleRestoreProduct(product.id)} 
                        disabled={loading}
                        className="text-green-600 font-medium hover:underline disabled:opacity-50"
                      >
                        Restaurer
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)} 
                        disabled={loading}
                        className="text-red-600 font-medium hover:underline disabled:opacity-50"
                      >
                        Supprimer définitivement
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'media' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg shadow">Aucun média dans la corbeille.</div>
          ) : (
            media.map(m => (
              <div key={m.id} className="relative aspect-square border rounded overflow-hidden group bg-gray-100">
                <img src={m.url} alt="media" className="object-cover w-full h-full opacity-70" />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                  <button 
                    onClick={() => handleRestoreMedia(m.id)} 
                    disabled={loading}
                    className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600"
                  >
                    Restaurer
                  </button>
                  <button 
                    onClick={() => handleDeleteMedia(m.id)} 
                    disabled={loading}
                    className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
