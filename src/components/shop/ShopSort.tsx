'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ShopSort({ totalResults, currentRange }: { totalResults: number, currentRange: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('Shop');

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    
    if (val) {
      params.set('sort', val);
    } else {
      params.delete('sort');
    }
    
    // Reset page on sort change
    params.delete('page');
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentSort = searchParams.get('sort') || '';
  const currentView = searchParams.get('view') || 'grid';

  const handleViewChange = (view: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white py-3 border-b border-gray-100 mb-6">
      <div className="text-sm text-gray-500 mb-4 sm:mb-0">
        {t('showing_results', { currentRange, totalResults })}
      </div>
      
      <div className="flex items-center gap-4">
        <select 
          value={currentSort}
          onChange={handleSortChange}
          className="border-none bg-transparent text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer"
        >
          <option value="">{t('default_sort')}</option>
          <option value="price_asc">{t('price_asc')}</option>
          <option value="price_desc">{t('price_desc')}</option>
          <option value="newest">{t('new_arrivals')}</option>
        </select>
        
        <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
          <button 
            onClick={() => handleViewChange('grid')}
            className={`p-1.5 rounded ${currentView === 'grid' ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button 
            onClick={() => handleViewChange('list')}
            className={`p-1.5 rounded ${currentView === 'list' ? 'text-orange-600 bg-orange-50' : 'text-gray-500 hover:text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
