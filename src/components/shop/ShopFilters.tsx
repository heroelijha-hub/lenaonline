'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface ShopFiltersProps {
  categories: Category[];
}

export default function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  // Initialize state from URL params
  useEffect(() => {
    const cats = searchParams.getAll('category');
    if (cats.length > 0) setSelectedCategories(cats);
    
    const min = searchParams.get('minPrice');
    if (min) setMinPrice(min);
    
    const max = searchParams.get('maxPrice');
    if (max) setMaxPrice(max);

    const ratings = searchParams.getAll('rating').map(Number);
    if (ratings.length > 0) setSelectedRatings(ratings);
  }, [searchParams]);

  // Update URL
  const updateFilters = (
    cats: string[], 
    min: string, 
    max: string, 
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

    params.delete('rating');
    ratings.forEach(r => params.append('rating', r.toString()));

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (slug: string) => {
    const newCats = selectedCategories.includes(slug)
      ? selectedCategories.filter(c => c !== slug)
      : [...selectedCategories, slug];
    setSelectedCategories(newCats);
    updateFilters(newCats, minPrice, maxPrice, selectedRatings);
  };

  const handlePriceApply = () => {
    updateFilters(selectedCategories, minPrice, maxPrice, selectedRatings);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePriceApply();
    }
  };

  const handleRatingChange = (rating: number) => {
    const newRatings = selectedRatings.includes(rating)
      ? selectedRatings.filter(r => r !== rating)
      : [...selectedRatings, rating];
    setSelectedRatings(newRatings);
    updateFilters(selectedCategories, minPrice, maxPrice, newRatings);
  };

  // Helper for rendering stars
  const renderStars = (count: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        className={`w-4 h-4 ${i < count ? 'text-orange-500' : 'text-gray-300'}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="w-full">
      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Filter by categories</h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => handleCategoryChange(cat.slug)}
              />
              <span className="ml-3 text-sm text-gray-600 group-hover:text-orange-500 transition-colors flex-1">
                {cat.name}
              </span>
              {cat._count !== undefined && (
                <span className="text-xs text-gray-400">({cat._count.products})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* Price */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Filter by price</h3>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={handlePriceKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={handlePriceKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
        <button 
          onClick={handlePriceApply}
          className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded transition-colors"
        >
          Apply price
        </button>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* Ratings */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Filter by rating</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
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
