'use client';

import { useState } from 'react';
import { updateTag, deleteTag, bulkDeleteTags } from '@/actions/admin';

export default function TagTable({ tags }: { tags: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const generateSlug = (text: string) => 
    text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

  const handleEditClick = (t: any) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditSlug(t.slug || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const res = await updateTag(id, editName, editSlug);
    if (res.error) alert(res.error);
    else setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce tag ?")) return;
    setIsDeleting(id);
    const res = await deleteTag(id);
    if (res.error) alert(res.error);
    setIsDeleting(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Voulez-vous supprimer ces ${selectedIds.length} tags ?`)) {
      setIsBulkDeleting(true);
      const res = await bulkDeleteTags(selectedIds);
      if (res.error) alert(res.error);
      else setSelectedIds([]);
      setIsBulkDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(selId => selId !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {selectedIds.length > 0 && (
        <div className="bg-orange-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-orange-800">
            {selectedIds.length} sélectionné(s)
          </span>
          <button onClick={handleBulkDelete} disabled={isBulkDeleting} className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition disabled:opacity-50">
            Supprimer la sélection
          </button>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left w-12"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? tags.map(t => t.id) : [])} checked={tags.length > 0 && selectedIds.length === tags.length} className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"/></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tags.length === 0 ? (
            <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Aucun tag trouvé.</td></tr>
          ) : (
            tags.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleSelect(t.id)} className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"/></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {editingId === t.id ? (
                    <input type="text" value={editName} onChange={(e) => { setEditName(e.target.value); setEditSlug(generateSlug(e.target.value)); }} className="px-2 py-1 border border-orange-300 rounded text-sm" autoFocus/>
                  ) : t.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === t.id ? (
                    <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className="px-2 py-1 border border-orange-300 rounded text-sm"/>
                  ) : t.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === t.id ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700">Annuler</button>
                      <button onClick={() => handleSaveEdit(t.id)} className="text-blue-600 hover:text-blue-800">Enregistrer</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEditClick(t)} className="text-blue-600 hover:text-blue-800 transition">Modifier</button>
                      <button onClick={() => handleDelete(t.id)} disabled={isDeleting === t.id} className="text-red-600 hover:text-red-800 transition disabled:opacity-50">Supprimer</button>
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
