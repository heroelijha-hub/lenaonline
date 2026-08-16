'use client';

import { useState } from 'react';
import { updateCategory, deleteCategory } from '@/actions/admin';

type Category = {
  id: string;
  name: string;
};

export default function CategoryTable({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleEditClick = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const res = await updateCategory(id, editName);
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom de la Catégorie</th>
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
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2 py-1 border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                      autoFocus
                    />
                  ) : (
                    cat.name
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
