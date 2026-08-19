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

  if (view === 'list') {
    return (
      <Link 
        href={`/product/${product.slug}`} 
        className="group flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <div className="relative h-48 sm:h-auto sm:w-48 flex-shrink-0 bg-gray-50 flex items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-gray-100">
          {product.discountLabel && (
            <span className="absolute top-3 left-3 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm z-10">
              {product.discountLabel}
            </span>
          )}
          
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
      <div className="relative h-56 w-full bg-gray-50 flex items-center justify-center p-4">
        {product.discountLabel && (
          <span className="absolute top-3 left-3 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm z-10">
            {product.discountLabel}
          </span>
        )}
        
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
