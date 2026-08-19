'use client';

import Link from 'next/link';
import Price from '@/components/Price';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    images: string[];
    discountLabel?: string | null;
    category?: { name: string } | null;
  };
  view?: 'grid' | 'list';
}

export default function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const image = product.images?.[0] || '';

  const HoverActions = () => (
    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
      <button 
        className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-transform transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-md"
        title="Aperçu rapide"
        onClick={(e) => { e.preventDefault(); /* TODO: Implémenter l'action */ }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      </button>
      <button 
        className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-transform transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 shadow-md"
        title="Ajouter aux favoris"
        onClick={(e) => { e.preventDefault(); /* TODO: Implémenter l'action */ }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
      </button>
      <button 
        className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-transform transform translate-y-4 group-hover:translate-y-0 duration-300 delay-150 shadow-md"
        title="Ajouter au panier"
        onClick={(e) => { e.preventDefault(); /* TODO: Implémenter l'action */ }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      </button>
    </div>
  );

  if (view === 'list') {
    return (
      <Link 
        href={`/product/${product.slug}`} 
        className="group flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <div className="relative h-48 sm:h-auto sm:w-48 flex-shrink-0 bg-gray-50 flex items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-gray-100 overflow-hidden">
          {product.discountLabel && (
            <span className="absolute top-3 left-3 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm z-30">
              {product.discountLabel}
            </span>
          )}
          
          <HoverActions />
          
          {image ? (
            <img 
              src={image} 
              alt={product.title} 
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-4xl text-gray-200">🛍️</div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <span className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
            {product.category?.name || 'Général'}
          </span>
          
          <h3 
            className="text-lg font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors"
          >
            {product.title}
          </h3>

          <div className="mt-auto flex items-center gap-3">
            {product.compareAtPrice && (
              <span className="text-sm text-gray-400 line-through">
                <Price amount={product.compareAtPrice} />
              </span>
            )}
            <span className="text-xl font-bold text-gray-900">
              <Price amount={product.price} />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href={`/product/${product.slug}`} 
      className="group flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image Container with fixed height and object-contain to prevent overflow/stretching */}
      <div className="relative h-56 w-full bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
        {product.discountLabel && (
          <span className="absolute top-3 left-3 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm z-30">
            {product.discountLabel}
          </span>
        )}
        
        <HoverActions />
        
        {image ? (
          <img 
            src={image} 
            alt={product.title} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-6xl text-gray-200">🛍️</div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category */}
        <span className="text-xs text-gray-500 mb-1">
          {product.category?.name || 'Général'}
        </span>
        
        {/* Title constrained to 2 lines max with ellipsis */}
        <h3 
          className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Price (pushed to bottom if title is short) */}
        <div className="mt-auto flex items-center gap-2">
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through">
              <Price amount={product.compareAtPrice} />
            </span>
          )}
          <span className="text-sm font-bold text-gray-900">
            <Price amount={product.price} />
          </span>
        </div>
      </div>
    </Link>
  );
}
