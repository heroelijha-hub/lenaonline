'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createMenu, updateMenu, deleteMenu, updateMenuItems, MenuItemInput } from '@/actions/menus';

type PageItem = { label: string; url: string };

type MenuManagerProps = {
  initialMenus: any[];
  customPages: PageItem[];
};

export default function MenuManager({ initialMenus, customPages }: MenuManagerProps) {
  const router = useRouter();
  const t = useTranslations('Admin');
  const [menus, setMenus] = useState(initialMenus);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(initialMenus[0]?.id || null);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);

  // Active menu state
  const activeMenu = menus.find(m => m.id === activeMenuId);
  const [items, setItems] = useState<MenuItemInput[]>(
    activeMenu ? activeMenu.items.map((i: any) => ({ ...i })) : []
  );
  const [activeMenuName, setActiveMenuName] = useState(activeMenu?.name || '');
  const [isSavingItems, setIsSavingItems] = useState(false);

  // Update items when active menu changes
  React.useEffect(() => {
    if (activeMenu) {
      setItems(activeMenu.items.map((i: any) => ({ ...i })));
      setActiveMenuName(activeMenu.name);
    } else {
      setItems([]);
      setActiveMenuName('');
    }
  }, [activeMenuId, menus]);

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName || !newMenuName.trim()) return;
    setIsCreatingMenu(true);
    const res = await createMenu(newMenuName.trim());
    if (res.success && res.menu) {
      setMenus([...menus, { ...res.menu, items: [] }]);
      setActiveMenuId(res.menu.id);
      setShowCreateForm(false);
      setNewMenuName('');
      router.refresh();
    } else {
      alert(res.error || t('menu_creation_error'));
    }
    setIsCreatingMenu(false);
  };

  const handleDeleteMenu = async () => {
    if (!activeMenuId) return;
    if (!confirm(t('confirm_delete_menu'))) return;
    const res = await deleteMenu(activeMenuId);
    if (res.success) {
      const updated = menus.filter(m => m.id !== activeMenuId);
      setMenus(updated);
      if (updated.length > 0) setActiveMenuId(updated[0].id);
      else setActiveMenuId(null);
      router.refresh();
    } else {
      alert(res.error || t('delete_error'));
    }
  };

  const handleAddPredefinedPage = (page: PageItem) => {
    const newItem: MenuItemInput = {
      label: page.label,
      url: page.url,
      order: items.length
    };
    setItems([...items, newItem]);
  };

  const handleAddCustomLink = () => {
    const label = prompt(t('link_text'));
    if (!label) return;
    const url = prompt(t('url_link'));
    if (!url) return;
    
    const newItem: MenuItemInput = {
      label: label.trim(),
      url: url.trim(),
      order: items.length
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
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

  const handleSaveMenu = async () => {
    if (!activeMenuId) return;
    setIsSavingItems(true);
    
    // update menu name if changed
    if (activeMenuName !== activeMenu?.name) {
      await updateMenu(activeMenuId, { name: activeMenuName });
    }
    
    const res = await updateMenuItems(activeMenuId, items);
    if (res.success) {
      alert(t('menu_saved_success'));
      router.refresh();
      setMenus(menus.map(m => m.id === activeMenuId ? { ...m, name: activeMenuName, items } : m));
    } else {
      alert(res.error || t('save_error'));
    }
    setIsSavingItems(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Top Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">{t('menu_manager_title')}</h2>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-[#e46c14] hover:bg-[#c95c0f] text-white px-4 py-2 rounded font-medium text-sm transition-colors"
          >
            {t('create_new_menu')}
          </button>
        )}
      </div>

      {showCreateForm ? (
        <div className="p-6">
          <div className="bg-[#f9fafb] border border-gray-200 rounded-md p-6 max-w-4xl">
            <label className="block text-sm text-gray-600 mb-2">{t('new_menu_name_label')}</label>
            <form onSubmit={handleCreateMenu} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                autoFocus
                value={newMenuName}
                onChange={e => setNewMenuName(e.target.value)}
                placeholder={t('new_menu_name_placeholder')}
                className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm focus:ring-1 focus:ring-[#1d4ed8] focus:border-[#1d4ed8]"
              />
              <div className="flex gap-2">
                <button 
                  type="submit"
                  disabled={isCreatingMenu || !newMenuName.trim()}
                  className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isCreatingMenu ? t('saving') : t('create_btn')}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewMenuName('');
                  }}
                  className="bg-[#e2e8f0] hover:bg-[#cbd5e1] text-gray-700 px-6 py-2 rounded text-sm font-medium transition-colors"
                >
                  {t('cancel_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : menus.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          {t('no_menu_created')}
        </div>
      ) : (
        <div className="p-6">
          {/* Menu Selector */}
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm text-gray-600">{t('select_menu_to_edit')}</label>
            <select
              value={activeMenuId || ''}
              onChange={e => setActiveMenuId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm font-medium focus:ring-1 focus:ring-[#e46c14] focus:border-[#e46c14]"
            >
              {menus.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {activeMenu && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                {t('id_slug')} <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-mono">{activeMenu.slug}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Menu Information */}
              <div className="border border-gray-200 rounded bg-[#fcfcfc] overflow-hidden">
                <div className="bg-gray-50 p-3 border-b border-gray-200 font-semibold text-gray-800 text-sm">
                  {t('menu_information')}
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">{t('menu_name')}</label>
                    <input 
                      type="text"
                      value={activeMenuName}
                      onChange={e => setActiveMenuName(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#e46c14] focus:border-[#e46c14]"
                    />
                  </div>
                  <button 
                    onClick={handleDeleteMenu}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    {t('delete_this_menu')}
                  </button>
                </div>
              </div>

              {/* Available Pages */}
              <div className="border border-gray-200 rounded bg-[#fcfcfc] overflow-hidden">
                <div className="bg-gray-50 p-3 border-b border-gray-200 font-semibold text-gray-800 text-sm">
                  {t('available_pages')}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-4">{t('click_to_add_page')}</p>

                  {/* Custom Pages List */}
                  {customPages.length > 0 ? (
                    <div>
                      <ul className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {customPages.map(page => (
                          <li key={page.url}>
                            <button 
                              onClick={() => handleAddPredefinedPage(page)}
                              className="w-full text-left text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors"
                            >
                              + {page.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      {t('no_page_created')}
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="lg:col-span-8">
              <div className="border border-gray-200 rounded h-full flex flex-col">
                <div className="bg-gray-50 p-3 border-b border-gray-200 font-semibold text-gray-800 text-sm">
                  {t('menu_items')}
                </div>
                
                <div className="flex-1 p-6 flex flex-col">
                  {items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-gray-500 italic pb-8">
                      {t('no_links_add_one')}
                    </div>
                  ) : (
                    <div className="flex-1 mb-8">
                      <ul className="space-y-2">
                        {items.map((item, index) => (
                          <li key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded shadow-sm">
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
                                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === items.length - 1}
                                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                              </button>
                              <div className="w-px h-6 bg-gray-200 mx-1"></div>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="p-1.5 text-red-400 hover:text-red-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bottom Actions */}
                  <div className="mt-auto flex justify-between items-center border-t border-gray-100 pt-4">
                    <button
                      onClick={handleAddCustomLink}
                      className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                      {t('add_a_link')}
                    </button>
                    
                    <button
                      onClick={handleSaveMenu}
                      disabled={isSavingItems}
                      className="bg-[#e46c14] hover:bg-[#c95c0f] text-white px-5 py-2 rounded font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      {isSavingItems ? t('saving') : t('save_menu')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}
