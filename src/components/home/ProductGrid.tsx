import Link from 'next/link';
import { getFilteredProducts } from '@/actions/public';
import Price from '@/components/Price';

type ProductGridProps = {
  config: {
    title: string;
    filterType: string;
    categoryId?: string;
    cardBorderColor?: string;
    btnBgColor?: string;
    btnTextColor?: string;
  };
};

export default async function ProductGrid({ config }: ProductGridProps) {
  const { 
    title = 'Produits', 
    filterType = 'LATEST', 
    categoryId,
    variant = '1',
    cardBorderColor = '#ea580c',
    btnBgColor = '#ea580c',
    btnTextColor = '#ffffff'
  } = config;

  // Fetch exactly 5 products to match the 5-column layout in the screenshot
  const products = await getFilteredProducts(filterType, categoryId, 5);

  if (products.length === 0) {
    return null; // Do not render section if no products
  }

  const seeAllUrl = categoryId ? `/search?category=${categoryId}` : '/search';

  return (
    <section className="max-w-7xl mx-auto px-4 w-full py-12 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Link href={seeAllUrl} className="flex items-center text-sm font-semibold text-gray-900 hover:text-orange-500 transition">
          Voir Tout
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map(p => (
          <div 
            key={p.id} 
            className="group flex flex-col rounded-xl overflow-hidden bg-white transition relative"
            style={{ 
              border: `2px solid ${cardBorderColor}`
            }}
          >
            {/* Image Container */}
            <Link href={`/product/${p.slug}`} className="block relative bg-gray-50 aspect-square p-6 overflow-hidden">
              {p.images && p.images.length > 0 ? (
                <img 
                  src={p.images[0]} 
                  alt={p.title} 
                  className="w-full h-full object-contain transition duration-300 group-hover:opacity-80" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">🛒</div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                
                {/* Variant 2: Button is in the overlay */}
                {variant === '2' && (
                  <button 
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm shadow-sm transition transform hover:scale-105"
                    style={{ backgroundColor: btnBgColor, color: btnTextColor }}
                    onClick={(e) => { e.preventDefault(); }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Ajouter Au Panier
                  </button>
                )}

                {/* Icons */}
                <div className="flex items-center justify-center gap-2">
                  <button 
                    className="p-2 rounded-md shadow-sm transition transform hover:scale-105" 
                    style={variant === '1' ? { backgroundColor: 'white', color: '#374151' } : { backgroundColor: btnBgColor, color: btnTextColor }}
                    onClick={(e) => { e.preventDefault(); }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </button>
                  <button 
                    className="p-2 rounded-md shadow-sm transition transform hover:scale-105" 
                    style={variant === '1' ? { backgroundColor: 'white', color: '#374151' } : { backgroundColor: btnBgColor, color: btnTextColor }}
                    onClick={(e) => { e.preventDefault(); }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  </button>
                  <button 
                    className="p-2 rounded-md shadow-sm transition transform hover:scale-105" 
                    style={variant === '1' ? { backgroundColor: 'white', color: '#374151' } : { backgroundColor: btnBgColor, color: btnTextColor }}
                    onClick={(e) => { e.preventDefault(); }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
            </Link>

            {/* Content Container */}
            <div className="p-4 flex flex-col flex-1">
              <Link href={`/product/${p.slug}`} className="flex-1 flex flex-col">
                <p className="text-xs text-gray-400 font-medium mb-1 truncate">{p.category?.name || 'Général'}</p>
                <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-orange-600 transition">
                  {p.title}
                </h3>
                <div className="mt-auto pt-2">
                  <Price amount={p.price} className="text-sm font-bold text-gray-900" />
                </div>
              </Link>
              
              {/* Variant 1: Add to Cart Button at the bottom */}
              {variant === '1' && (
                <div className="mt-4">
                  <button 
                    className="w-full flex items-center justify-center gap-2 py-2 border rounded-md font-medium text-sm transition-all duration-300"
                    style={{
                      borderColor: '#e5e7eb', // gray-200 default
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = btnBgColor;
                      e.currentTarget.style.color = btnTextColor;
                      e.currentTarget.style.borderColor = btnBgColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#374151'; // gray-700
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Ajouter Au Panier
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
