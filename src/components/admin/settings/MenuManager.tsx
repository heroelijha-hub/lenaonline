'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMenu, updateMenu, deleteMenu, updateMenuItems, MenuItemInput } from '@/actions/menus';
import { FaTrash, FaPlus, FaArrowUp, FaArrowDown, FaSave, FaEdit } from 'react-icons/fa';

type PageItem = { label: string; url: string };

type MenuManagerProps = {
  initialMenus: any[];
  systemPages: PageItem[];
  customPages: PageItem[];
};

export default function MenuManager({ initialMenus, systemPages, customPages }: MenuManagerProps) {
  const router = useRouter();
  const [menus, setMenus] = useState(initialMenus);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(initialMenus[0]?.id || null);
  
  const [newMenuName, setNewMenuName] = useState('');
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);

  // Active menu state
  const activeMenu = menus.find(m => m.id === activeMenuId);
  const [items, setItems] = useState<MenuItemInput[]>(
    activeMenu ? activeMenu.items.map((i: any) => ({ ...i })) : []
  );
  const [isSavingItems, setIsSavingItems] = useState(false);

  // New item form
  const [newItemType, setNewItemType] = useState<'system' | 'custom' | 'link'>('system');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');

  // Update items when active menu changes
  React.useEffect(() => {
    if (activeMenu) {
      setItems(activeMenu.items.map((i: any) => ({ ...i })));
    } else {
      setItems([]);
    }
  }, [activeMenuId, menus]);

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;
    setIsCreatingMenu(true);
    const res = await createMenu(newMenuName.trim());
    if (res.success && res.menu) {
      setMenus([...menus, { ...res.menu, items: [] }]);
      setActiveMenuId(res.menu.id);
      setNewMenuName('');
      router.refresh();
    } else {
      alert(res.error || 'Erreur lors de la création du menu');
    }
    setIsCreatingMenu(false);
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) return;
    const res = await deleteMenu(id);
    if (res.success) {
      const updated = menus.filter(m => m.id !== id);
      setMenus(updated);
      if (activeMenuId === id) setActiveMenuId(updated[0]?.id || null);
      router.refresh();
    } else {
      alert(res.error || 'Erreur lors de la suppression');
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemLabel.trim() || !newItemUrl.trim()) return;
    
    const newItem: MenuItemInput = {
      label: newItemLabel.trim(),
      url: newItemUrl.trim(),
      order: items.length
    };
    
    setItems([...items, newItem]);
    
    // Reset form based on type
    if (newItemType === 'link') {
      setNewItemLabel('');
      setNewItemUrl('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    // Reorder
    newItems.forEach((item, i) => item.order = i);
    setItems(newItems);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    newItems.forEach((item, i) => item.order = i);
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    newItems.forEach((item, i) => item.order = i);
    setItems(newItems);
  };

  const handleSaveItems = async () => {
    if (!activeMenuId) return;
    setIsSavingItems(true);
    const res = await updateMenuItems(activeMenuId, items);
    if (res.success) {
      alert('Menu sauvegardé avec succès !');
      router.refresh();
      // Update local state to avoid jump
      setMenus(menus.map(m => m.id === activeMenuId ? { ...m, items } : m));
    } else {
      alert(res.error || 'Erreur lors de la sauvegarde');
    }
    setIsSavingItems(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar: Menus List */}
      <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-fit">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Vos Menus</h2>
        
        <form onSubmit={handleCreateMenu} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newMenuName}
            onChange={e => setNewMenuName(e.target.value)}
            placeholder="Nom du nouveau menu..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
            disabled={isCreatingMenu}
          />
          <button
            type="submit"
            disabled={isCreatingMenu || !newMenuName.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            <FaPlus />
          </button>
        </form>

        <ul className="space-y-2">
          {menus.length === 0 ? (
            <li className="text-gray-500 text-sm italic">Aucun menu créé.</li>
          ) : (
            menus.map(menu => (
              <li 
                key={menu.id} 
                className={`flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors ${activeMenuId === menu.id ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50 border border-transparent'}`}
                onClick={() => setActiveMenuId(menu.id)}
              >
                <div>
                  <span className={`font-medium ${activeMenuId === menu.id ? 'text-orange-800' : 'text-gray-700'}`}>{menu.name}</span>
                  <div className="text-xs text-gray-500">/{menu.slug}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteMenu(menu.id); }}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Supprimer ce menu"
                >
                  <FaTrash size={14} />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Main Content: Edit active menu */}
      <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {!activeMenuId ? (
          <div className="text-center py-12 text-gray-500">
            Sélectionnez ou créez un menu pour le gérer.
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Gérer les liens : <span className="text-orange-600">{activeMenu?.name}</span>
              </h2>
              <button
                onClick={handleSaveItems}
                disabled={isSavingItems}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                <FaSave />
                {isSavingItems ? 'Enregistrement...' : 'Enregistrer le menu'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add items form */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-4">Ajouter un lien</h3>
                
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setNewItemType('system')}
                    className={`flex-1 py-1 text-sm font-medium rounded-md ${newItemType === 'system' ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Pages Système
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemType('custom')}
                    className={`flex-1 py-1 text-sm font-medium rounded-md ${newItemType === 'custom' ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Vos Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemType('link')}
                    className={`flex-1 py-1 text-sm font-medium rounded-md ${newItemType === 'link' ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Lien personnalisé
                  </button>
                </div>

                <form onSubmit={handleAddItem} className="space-y-4">
                  {newItemType === 'system' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Sélectionner une page</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        onChange={e => {
                          const page = systemPages.find(p => p.url === e.target.value);
                          if (page) {
                            setNewItemUrl(page.url);
                            setNewItemLabel(page.label);
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>-- Choisir --</option>
                        {systemPages.map(p => (
                          <option key={p.url} value={p.url}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newItemType === 'custom' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Sélectionner une page</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        onChange={e => {
                          const page = customPages.find(p => p.url === e.target.value);
                          if (page) {
                            setNewItemUrl(page.url);
                            setNewItemLabel(page.label);
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>-- Choisir --</option>
                        {customPages.length === 0 && <option disabled>Aucune page créée</option>}
                        {customPages.map(p => (
                          <option key={p.url} value={p.url}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newItemType === 'link' && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">URL / Lien</label>
                        <input
                          type="text"
                          value={newItemUrl}
                          onChange={e => setNewItemUrl(e.target.value)}
                          placeholder="https://... ou /ma-page"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </>
                  )}

                  {(newItemType === 'system' || newItemType === 'custom') && newItemUrl && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Texte du lien (modifiable)</label>
                      <input
                        type="text"
                        value={newItemLabel}
                        onChange={e => setNewItemLabel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  )}

                  {newItemType === 'link' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Texte du lien</label>
                      <input
                        type="text"
                        value={newItemLabel}
                        onChange={e => setNewItemLabel(e.target.value)}
                        placeholder="Ex: Mon Lien"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!newItemLabel.trim() || !newItemUrl.trim()}
                    className="w-full bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    Ajouter au menu
                  </button>
                </form>
              </div>

              {/* Items List */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Structure du menu</h3>
                {items.length === 0 ? (
                  <div className="text-gray-500 text-sm italic p-4 border border-dashed border-gray-300 rounded-md text-center">
                    Ce menu est vide. Ajoutez des liens depuis le panneau de gauche.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <li key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-md shadow-sm">
                        <div className="flex-1 min-w-0 mr-4">
                          <input 
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].label = e.target.value;
                              setItems(newItems);
                            }}
                            className="font-medium text-gray-800 w-full border-none p-0 focus:ring-0 text-sm mb-1 bg-transparent"
                          />
                          <input 
                            type="text"
                            value={item.url}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].url = e.target.value;
                              setItems(newItems);
                            }}
                            className="text-xs text-gray-500 w-full border-none p-0 focus:ring-0 bg-transparent"
                          />
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors bg-gray-50 rounded"
                          >
                            <FaArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === items.length - 1}
                            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors bg-gray-50 rounded"
                          >
                            <FaArrowDown size={12} />
                          </button>
                          <div className="w-px h-6 bg-gray-200 mx-1"></div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                
                {items.length > 0 && (
                  <div className="mt-4 text-xs text-gray-500 bg-blue-50 text-blue-800 p-3 rounded border border-blue-100">
                    <span className="font-semibold">Note:</span> N'oubliez pas de cliquer sur "Enregistrer le menu" pour sauvegarder l'ordre et les liens de ce menu.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
