'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Price from '@/components/Price';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface ShopFiltersProps {
  categories: Category[];
  brands: Brand[];
  globalMinPrice?: number;
  globalMaxPrice?: number;
}

export default function ShopFilters({ categories, brands, globalMinPrice = 0, globalMaxPrice = 1000 }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('Shop');

  // State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sliderMin, setSliderMin] = useState<number>(globalMinPrice);
  const [sliderMax, setSliderMax] = useState<number>(globalMaxPrice);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);

  // Initialize state from URL params
  useEffect(() => {
    const cats = searchParams.getAll('category');
    if (cats.length > 0) setSelectedCategories(cats);
    
    const min = searchParams.get('minPrice');
    if (min) { setMinPrice(min); setSliderMin(Number(min)); }
    else { setMinPrice(''); setSliderMin(globalMinPrice); }
    
    const max = searchParams.get('maxPrice');
    if (max) { setMaxPrice(max); setSliderMax(Number(max)); }
    else { setMaxPrice(''); setSliderMax(globalMaxPrice); }

    const brnds = searchParams.getAll('brand');
    if (brnds.length > 0) setSelectedBrands(brnds);

    const ratings = searchParams.getAll('rating').map(Number);
    if (ratings.length > 0) setSelectedRatings(ratings);
  }, [searchParams]);

  // Update URL
  const updateFilters = (
    cats: string[], 
    min: string, 
    max: string, 
    brnds: string[],
    ratings: number[]
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 when filters change
    params.delete('page');

    params.delete('category');
    cats.forEach(c => params.append('category', c));

    if (min) params.set('minPrice', min);
    else params.delete('minPrice');

    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');

    params.delete('brand');
    brnds.forEach(b => params.append('brand', b));

    params.delete('rating');
    ratings.forEach(r => params.append('rating', r.toString()));

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (slug: string) => {
    const newCats = selectedCategories.includes(slug)
      ? selectedCategories.filter(c => c !== slug)
      : [...selectedCategories, slug];
    setSelectedCategories(newCats);
    updateFilters(newCats, minPrice, maxPrice, selectedBrands, selectedRatings);
  };

  const handlePriceApply = () => {
    updateFilters(selectedCategories, minPrice, maxPrice, selectedBrands, selectedRatings);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePriceApply();
    }
  };

  const handleBrandChange = (slug: string) => {
    const newBrands = selectedBrands.includes(slug)
      ? selectedBrands.filter(b => b !== slug)
      : [...selectedBrands, slug];
    setSelectedBrands(newBrands);
    updateFilters(selectedCategories, minPrice, maxPrice, newBrands, selectedRatings);
  };

  const handleRatingChange = (rating: number) => {
    const newRatings = selectedRatings.includes(rating)
      ? selectedRatings.filter(r => r !== rating)
      : [...selectedRatings, rating];
    setSelectedRatings(newRatings);
    updateFilters(selectedCategories, minPrice, maxPrice, selectedBrands, newRatings);
  };

  // Helper for rendering stars
  const renderStars = (count: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        className={`w-4 h-4 ${i < count ? 'text-orange-600' : 'text-gray-300'}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="w-full">
      {/* Price */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('filter_price')}</h3>
        
        <div className="relative pt-6 pb-2 mb-2">
          {/* Track background */}
          <div className="absolute top-7 left-0 right-0 h-1.5 bg-gray-200 rounded"></div>
          
          {/* Active track */}
          <div 
            className="absolute top-7 h-1.5 bg-orange-500 rounded"
            style={{
              left: `${Math.max(0, ((sliderMin - globalMinPrice) / Math.max(1, (globalMaxPrice - globalMinPrice))) * 100)}%`,
              right: `${Math.max(0, 100 - ((sliderMax - globalMinPrice) / Math.max(1, (globalMaxPrice - globalMinPrice))) * 100)}%`
            }}
          ></div>
          
          <input
            type="range"
            min={globalMinPrice}
            max={globalMaxPrice}
            value={sliderMin}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), sliderMax - 1);
              setSliderMin(val);
            }}
            onMouseUp={() => updateFilters(selectedCategories, sliderMin.toString(), sliderMax.toString(), selectedBrands, selectedRatings)}
            onTouchEnd={() => updateFilters(selectedCategories, sliderMin.toString(), sliderMax.toString(), selectedBrands, selectedRatings)}
            className="absolute top-5 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-orange-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none shadow-sm"
            style={{ zIndex: sliderMin > globalMaxPrice - 100 ? 5 : 3 }}
          />
          <input
            type="range"
            min={globalMinPrice}
            max={globalMaxPrice}
            value={sliderMax}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), sliderMin + 1);
              setSliderMax(val);
            }}
            onMouseUp={() => updateFilters(selectedCategories, sliderMin.toString(), sliderMax.toString(), selectedBrands, selectedRatings)}
            onTouchEnd={() => updateFilters(selectedCategories, sliderMin.toString(), sliderMax.toString(), selectedBrands, selectedRatings)}
            className="absolute top-5 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-orange-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none shadow-sm"
            style={{ zIndex: 4 }}
          />
        </div>
        
        <div className="mt-4 text-sm text-gray-700 font-medium">
          Preis: <Price amount={sliderMin} showTax={false} /> — <Price amount={sliderMax} showTax={false} />
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('filter_categories')}</h3>
        <div className="relative">
          <button 
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-orange-500 hover:border-orange-500 transition-colors"
          >
            <span className="text-gray-700 truncate">
              {selectedCategories.length > 0 
                ? t('items_selected', { count: selectedCategories.length }) 
                : `-- ${t('filter_categories')} --`}
            </span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isCategoriesOpen && (
            <div className="mt-2 bg-white border border-gray-200 rounded-md max-h-60 overflow-y-auto p-4 space-y-3">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    checked={selectedCategories.includes(cat.slug)}
                    onChange={() => handleCategoryChange(cat.slug)}
                  />
                  <span className="ml-3 text-sm text-gray-600 group-hover:text-orange-600 transition-colors flex-1 truncate">
                    {cat.name}
                  </span>
                  {cat._count !== undefined && (
                    <span className="text-xs text-gray-500">({cat._count.products})</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* Brand */}
      {brands.length > 0 && (
        <>
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('filter_brand')}</h3>
            <div className="relative">
              <button 
                onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-orange-500 hover:border-orange-500 transition-colors"
              >
                <span className="text-gray-700 truncate">
                  {selectedBrands.length > 0 
                    ? t('items_selected', { count: selectedBrands.length }) 
                    : `-- ${t('filter_brand')} --`}
                </span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${isBrandsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {isBrandsOpen && (
                <div className="mt-2 bg-white border border-gray-200 rounded-md max-h-60 overflow-y-auto p-4 space-y-3">
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        checked={selectedBrands.includes(brand.slug)}
                        onChange={() => handleBrandChange(brand.slug)}
                      />
                      <span className="ml-3 text-sm text-gray-600 group-hover:text-orange-600 transition-colors flex-1 truncate">
                        {brand.name}
                      </span>
                      {brand._count !== undefined && (
                        <span className="text-xs text-gray-500">({brand._count.products})</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <hr className="border-gray-200 mb-8" />
        </>
      )}

      {/* Ratings */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('filter_rating')}</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                checked={selectedRatings.includes(rating)}
                onChange={() => handleRatingChange(rating)}
              />
              <div className="ml-3 flex items-center gap-1 flex-1">
                {renderStars(rating)}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
