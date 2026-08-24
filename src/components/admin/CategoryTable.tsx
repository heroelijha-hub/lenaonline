'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { updateCategory, deleteCategory, bulkDeleteCategories } from '@/actions/admin';

type Category = {
  id: string;
  name: string;
  slug?: string | null;
  parentId?: string | null;
  parent?: { name: string } | null;
};

export default function CategoryTable({ categories }: { categories: Category[] }) {
  const t = useTranslations('AdminCategories');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editParentId, setEditParentId] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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
    if (!confirm(t('confirm_delete'))) return;
    setIsDeleting(id);
    const res = await deleteCategory(id);
    if (res.error) {
      alert(res.error);
    }
    setIsDeleting(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Êtes-vous sûr de vouloir supprimer ces ${selectedIds.length} catégories ?`)) {
      setIsBulkDeleting(true);
      const res = await bulkDeleteCategories(selectedIds);
      if (res.error) alert(res.error);
      else {
        setSelectedIds([]);
      }
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(categories.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selId => selId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {selectedIds.length > 0 && (
        <div className="bg-orange-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-orange-800">
            {selectedIds.length} sélectionné(s)
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
            className="text-sm bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded shadow-sm disabled:opacity-50"
          >
            {isBulkDeleting ? t('deleting') : t('delete')}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
              <input 
                type="checkbox" 
                checked={categories.length > 0 && selectedIds.length === categories.length}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('id_th')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name_th')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('slug_th')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("parent_col")}</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("actions_col")}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">{t('no_categories')}</td>
            </tr>
          ) : (
            categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(cat.id)}
                    onChange={() => toggleSelect(cat.id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </td>
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
                      <option value="">{t('none')}</option>
                      {categories.filter(c => c.id !== cat.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    cat.parent ? <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{cat.parent.name}</span> : <span className="text-gray-400 italic">{t("main_col")}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === cat.id ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleSaveEdit(cat.id)} className="text-green-600 hover:text-green-900">{t('save')}</button>
                      <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">{t('cancel')}</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEditClick(cat)} className="text-orange-600 hover:text-orange-900">{t("edit_col")}</button>
                      <button 
                        onClick={() => handleDelete(cat.id)} 
                        disabled={isDeleting === cat.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {isDeleting === cat.id ? t('deleting') : t('delete')}
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
    </div>
  );
}
