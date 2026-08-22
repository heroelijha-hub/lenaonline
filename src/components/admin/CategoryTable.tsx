'use client';

import { useState } from 'react';
import { updateCategory, deleteCategory } from '@/actions/admin';

type Category = {
  id: string;
  name: string;
  slug?: string | null;
  parentId?: string | null;
  parent?: { name: string } | null;
};

export default function CategoryTable({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editParentId, setEditParentId] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const generateSlug = (text: string) => 
    text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug || '');
    setEditParentId(cat.parentId || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSlug('');
    setEditParentId('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const res = await updateCategory(id, editName, editSlug, editParentId || null);
    if (res.error) {
      alert(res.error);
    } else {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    setIsDeleting(id);
    const res = await deleteCategory(id);
    if (res.error) {
      alert(res.error);
    }
    setIsDeleting(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Aucune catégorie existante.</td>
            </tr>
          ) : (
            categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="truncate w-24 inline-block" title={cat.id}>{cat.id.split('-')[0]}...</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {editingId === cat.id ? (
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        setEditSlug(generateSlug(e.target.value));
                      }}
                      className="px-2 py-1 border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                      autoFocus
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === cat.id ? (
                    <input 
                      type="text" 
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="px-2 py-1 border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-gray-50"
                    />
                  ) : (
                    cat.slug
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === cat.id ? (
                    <select
                      value={editParentId}
                      onChange={(e) => setEditParentId(e.target.value)}
                      className="px-2 py-1 border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm bg-white"
                    >
                      <option value="">Aucun</option>
                      {categories.filter(c => c.id !== cat.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    cat.parent ? <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{cat.parent.name}</span> : <span className="text-gray-400 italic">Principale</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === cat.id ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleSaveEdit(cat.id)} className="text-green-600 hover:text-green-900">Sauver</button>
                      <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">Annuler</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEditClick(cat)} className="text-orange-600 hover:text-orange-900">Éditer</button>
                      <button 
                        onClick={() => handleDelete(cat.id)} 
                        disabled={isDeleting === cat.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {isDeleting === cat.id ? 'Suppr...' : 'Supprimer'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
