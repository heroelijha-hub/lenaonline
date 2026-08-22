'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteProduct, duplicateProduct, quickEditProduct } from '@/actions/admin';

export default function ProductsTable({ products, categories }: { products: any[], categories: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{title: string, categoryIds: string[], slug: string, price: number, compareAtPrice: number | ''}>({ title: '', categoryIds: [], slug: '', price: 0, compareAtPrice: '' });
  const [isLoading, setIsLoading] = useState(false);

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditData({ 
      title: p.title, 
      categoryIds: p.categories?.map((c: any) => c.id) || [], 
      slug: p.slug,
      price: p.price || 0,
      compareAtPrice: p.compareAtPrice || ''
    });
  };

  const handleQuickEditSubmit = async (id: string) => {
    setIsLoading(true);
    const res = await quickEditProduct(id, editData);
    if (res.error) {
      alert(res.error);
    } else {
      setEditingId(null);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      setIsLoading(true);
      const res = await deleteProduct(id);
      if (res.error) alert(res.error);
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsLoading(true);
    const res = await duplicateProduct(id);
    if (res.error) alert(res.error);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit & Actions</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                Aucun produit dans le catalogue. Cliquez sur "Add un produit" pour commencer.
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const isEditing = editingId === product.id;

              return (
                <tr key={product.id} className={`hover:bg-gray-50 transition ${isEditing ? 'bg-orange-50/30' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.title} className="h-12 w-12 rounded object-cover border border-gray-200" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400 border border-gray-200">N/A</div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top w-full">
                    {isEditing ? (
                      <div className="space-y-3 bg-white p-4 border border-gray-200 rounded-md shadow-sm">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600">Title</label>
                          <input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="border px-2 py-1 rounded text-sm w-full" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600">Slug</label>
                          <input type="text" value={editData.slug} onChange={e => setEditData({...editData, slug: e.target.value})} className="border px-2 py-1 rounded text-sm w-full" />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs font-semibold text-gray-600">Price de base ($)</label>
                            <input type="number" step="0.01" value={editData.price} onChange={e => setEditData({...editData, price: parseFloat(e.target.value) || 0})} className="border px-2 py-1 rounded text-sm w-full" />
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs font-semibold text-gray-600">Price promo ($)</label>
                            <input type="number" step="0.01" value={editData.compareAtPrice} onChange={e => setEditData({...editData, compareAtPrice: e.target.value ? parseFloat(e.target.value) : ''})} className="border px-2 py-1 rounded text-sm w-full" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600">Categories</label>
                          <div className="border rounded p-2 max-h-32 overflow-y-auto bg-gray-50 flex flex-col gap-1 text-sm">
                            {categories.map(c => (
                              <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={editData.categoryIds.includes(c.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditData({...editData, categoryIds: [...editData.categoryIds, c.id]});
                                    } else {
                                      setEditData({...editData, categoryIds: editData.categoryIds.filter(id => id !== c.id)});
                                    }
                                  }}
                                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                {c.name}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <button onClick={() => setEditingId(null)} className="text-sm px-3 py-1 text-gray-500 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
                          <button onClick={() => handleQuickEditSubmit(product.id)} disabled={isLoading} className="text-sm px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600">Save</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-gray-900 mb-1">{product.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">ID: {product.id.substring(0,8)}</span>
                          <span>•</span>
                          <span className="text-orange-600 font-medium">{product.categories?.map((c: any) => c.name).join(', ') || 'Sans catégorie'}</span>
                        </div>
                        
                        {/* Woo-style Row Actions */}
                        <div className="flex items-center gap-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:underline">Edit</Link>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => startEdit(product)} className="text-blue-600 hover:underline">Modification rapide</button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => handleDelete(product.id)} disabled={isLoading} className="text-red-600 hover:underline">Corbeille</button>
                          <span className="text-gray-300">|</span>
                          <Link href={`/product/${product.slug}`} target="_blank" className="text-blue-600 hover:underline">Voir</Link>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => handleDuplicate(product.id)} disabled={isLoading} className="text-blue-600 hover:underline">Dupliquer</button>
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium align-top">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm align-top">
                    {product.stock === null ? (
                      <span className="text-teal-600 font-medium">En stock</span>
                    ) : product.stock > 0 ? (
                      <span className="text-teal-600 font-medium">{product.stock} restants</span>
                    ) : (
                      <span className="text-red-600 font-medium">Épuisé</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {/* Astuce CSS pour afficher les actions au survol de la ligne entière */}
      <style dangerouslySetInnerHTML={{__html: `
        tr { cursor: default; }
        tr:hover .opacity-0 { opacity: 1 !important; }
      `}} />
    </div>
  );
}
