import { getFilteredProducts } from '@/actions/public';
import Link from 'next/link';
import prisma from '@/lib/prisma';

// Composant interne pour l'étoile
const Star = ({ filled = true }: { filled?: boolean }) => (
  <svg 
    className={`w-4 h-4 ${filled ? 'text-orange-500' : 'text-gray-300'}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const staticProducts = [
  { id: 1, imagePlaceholder: '📱', category: 'Electronics', title: '256GB iphone 16 pro max Ratina Reday', rating: 5, ratingText: '(5.00)', price: '$18.00' },
  { id: 2, imagePlaceholder: '👟', category: 'Clothings', title: 'Niki Dust & Water Proof Comfort Sneakers', rating: 5, ratingText: '(5.00)', price: '$19.00' },
  { id: 3, imagePlaceholder: '🍯', category: 'Gift Box', title: 'Heinz Portion Healthy Food For Everyday', rating: 3, ratingText: '(2.00)', price: '$18.00' },
  { id: 4, imagePlaceholder: '⌚', category: 'Clothings', title: 'Explore Pixel and Samsung Watches with...', rating: 5, ratingText: '(5.00)', price: '$33.00 - $59.00', discount: '-14%' },
  { id: 5, imagePlaceholder: '🪑', category: 'Electronics', title: 'Soft Bamboo Entryway Flexible Sofa set', rating: 5, ratingText: '(5.00)', price: '$18.00 - $30.00', discount: '-18%' },
  { id: 6, imagePlaceholder: '🚲', category: 'Cosmetics', title: 'Bike Frame Performance 700C 49/51/54/57cm', rating: 5, ratingText: '(5.00)', price: '$23.00' },
];

export default async function BestDeals({ config }: { config?: any }) {
  const filterType = config?.filterType || 'ON_SALE';
  const categoryId = config?.categoryId || undefined;
  
  const dbProducts = await getFilteredProducts(filterType, categoryId, 6);
  const settingsDb = await prisma.setting.findMany();
  const settings = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  
  if (config) {
    Object.assign(settings, config);
  }

  const getResponsiveVars = (baseKey: string, defaultSizes: { m: string, t: string, d: string }) => {
    return {
      '--sz-m': settings[`${baseKey}_SIZE_MOBILE`] || defaultSizes.m,
      '--sz-t': settings[`${baseKey}_SIZE_TABLET`] || defaultSizes.t,
      '--sz-d': settings[`${baseKey}_SIZE_DESKTOP`] || defaultSizes.d,
    } as React.CSSProperties;
  };
  
  // Utiliser les produits de la BDD s'il y en a, sinon fallback sur les statiques
  const displayProducts = dbProducts.length > 0 ? dbProducts.map(p => ({
    id: p.id,
    slug: p.slug,
    imageUrl: p.images[0],
    category: p.categories && p.categories.length > 0 ? p.categories[0].name : 'N/A',
    title: p.title,
    rating: 5, // Rating statique pour l'instant
    ratingText: '(5.00)',
    price: `$${p.price.toFixed(2)}`,
    discount: p.discountLabel || undefined,
    imagePlaceholder: '🛍️'
  })) : staticProducts;

  return (
    <section className="max-w-7xl mx-auto px-4 w-full py-12 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-6">
          <h2 
            className="font-bold text-gray-900 text-[var(--sz-m)] md:text-[var(--sz-t)] lg:text-[var(--sz-d)]"
            style={getResponsiveVars('title', {m: '20px', t: '24px', d: '24px'})}
          >
            {config?.title || "Today's Best Deals"}
          </h2>
          
          {/* Countdown Timer */}
          <div className="flex items-center gap-1 sm:gap-2 border border-orange-200 bg-orange-50/50 px-2 sm:px-4 py-1.5 rounded text-xs sm:text-sm text-gray-800 font-semibold" data-countdown={config?.countdown}>
            <span>00 <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Days</span></span>
            <span className="text-gray-300">:</span>
            <span>00 <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Hrs</span></span>
            <span className="text-gray-300">:</span>
            <span>00 <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Mins</span></span>
            <span className="text-gray-300">:</span>
            <span>00 <span className="text-[10px] sm:text-xs text-gray-500 font-normal">Secs</span></span>
          </div>
        </div>

        <Link href="/deals" className="flex items-center text-sm font-semibold text-gray-900 hover:text-orange-500 transition">
          See All
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="border border-gray-200 rounded-lg bg-white mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex min-w-[1000px] divide-x divide-gray-200">
          {displayProducts.map((product) => (
            <Link href={`/product/${(product as any).slug || product.id}`} key={product.id} className="flex-1 p-5 flex flex-col group cursor-pointer hover:shadow-lg transition">
              {/* Product Image Area */}
              <div className="relative h-48 w-full bg-white mb-4 flex items-center justify-center overflow-hidden">
                {product.discount && (
                  <span className="absolute top-0 left-0 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded z-10">
                    {product.discount}
                  </span>
                )}
                {/* Image or Placeholder */}
                {(product as any).imageUrl ? (
                  <img src={(product as any).imageUrl} alt={product.title} className="w-full h-full object-contain group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="text-7xl group-hover:scale-110 transition duration-500">
                    {product.imagePlaceholder}
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="mt-auto">
                <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-500 transition">
                  {product.title}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} filled={star <= product.rating} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{product.ratingText}</span>
                </div>
                
                <p className="font-bold text-gray-900">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Promo Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Banner */}
        <div 
          className="bg-[#E5F1FC] rounded-xl overflow-hidden relative flex p-6 sm:p-8 h-[240px] border border-gray-100 items-center"
          style={{
            backgroundColor: settings.PROMO_1_BG_COLOR || undefined,
            backgroundImage: settings.PROMO_1_BG_IMAGE ? `url(${settings.PROMO_1_BG_IMAGE})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="z-20 w-[60%] sm:w-1/2">
            <span className="text-orange-600 font-bold text-sm block mb-2">
              {settings.PROMO_1_SUBTITLE || 'Price Start $69'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-tight whitespace-pre-line" style={settings.PROMO_1_TEXT_COLOR ? { color: settings.PROMO_1_TEXT_COLOR } : undefined}>
              {settings.PROMO_1_TITLE || 'NOTHING\nWATCH PRO 2'}
            </h2>
            <Link 
              href={settings.PROMO_1_LINK || '/#'} 
              className="inline-block bg-white text-gray-900 font-semibold px-6 py-2.5 rounded hover:bg-gray-50 transition shadow-sm"
              style={{
                backgroundColor: settings.PROMO_1_BTN_BG_COLOR || undefined,
                color: settings.PROMO_1_BTN_TEXT_COLOR || undefined
              }}
            >
              Shop Now
            </Link>
          </div>
          {/* Image */}
          {settings.PROMO_1_IMAGE ? (
             <img src={settings.PROMO_1_IMAGE} alt="Promo 1" className="absolute right-0 top-0 h-full w-[45%] sm:w-1/2 object-contain z-10" />
          ) : (
            <div className="absolute right-[-10%] sm:right-[-5%] top-4 w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center z-10">
               <div className="w-20 h-24 sm:w-24 sm:h-28 bg-zinc-800 rounded-3xl border-[6px] border-zinc-700 shadow-xl rotate-12 z-20 flex items-center justify-center -mr-4">
                   <span className="text-white text-xs font-mono">09:28</span>
               </div>
               <div className="w-20 h-24 sm:w-24 sm:h-28 bg-zinc-800 rounded-3xl border-[6px] border-gray-300 shadow-xl -rotate-12 z-10 flex items-center justify-center">
                   <span className="text-pink-400 text-xs font-mono">09:28</span>
               </div>
            </div>
          )}
        </div>

        {/* Right Banner */}
        <div 
          className="bg-[#FBE9DC] rounded-xl overflow-hidden relative flex p-6 sm:p-8 h-[240px] border border-gray-100 items-center"
          style={{
            backgroundColor: settings.PROMO_2_BG_COLOR || undefined,
            backgroundImage: settings.PROMO_2_BG_IMAGE ? `url(${settings.PROMO_2_BG_IMAGE})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="z-20 w-[60%] sm:w-1/2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight whitespace-pre-line" style={settings.PROMO_2_TEXT_COLOR ? { color: settings.PROMO_2_TEXT_COLOR } : undefined}>
              {settings.PROMO_2_TITLE || 'Get 20% Off'}
            </h2>
            <p className="font-bold text-gray-800 mb-6 text-lg" style={settings.PROMO_2_TEXT_COLOR ? { color: settings.PROMO_2_TEXT_COLOR } : undefined}>
              {settings.PROMO_2_SUBTITLE || 'Women Store'}
            </p>
            <Link 
              href={settings.PROMO_2_LINK || '/#'} 
              className="inline-block bg-[#FF5C00] text-white font-semibold px-6 py-2.5 rounded hover:bg-[#E55300] transition shadow-sm"
              style={{
                backgroundColor: settings.PROMO_2_BTN_BG_COLOR || undefined,
                color: settings.PROMO_2_BTN_TEXT_COLOR || undefined
              }}
            >
              Shop Now
            </Link>
          </div>
          {/* Image */}
          {settings.PROMO_2_IMAGE ? (
             <img src={settings.PROMO_2_IMAGE} alt="Promo 2" className="absolute right-0 bottom-0 h-full w-[45%] sm:w-1/2 object-contain z-10" />
          ) : (
            <div className="absolute right-2 sm:right-4 bottom-0 w-[45%] sm:w-1/2 h-[90%] flex items-end justify-center space-x-1 z-10">
                <div className="w-12 h-32 sm:w-16 sm:h-40 bg-teal-200 rounded-t-full rounded-b-lg border-2 border-white shadow-lg z-10 -ml-2 sm:-ml-4"></div>
                <div className="w-12 h-36 sm:w-16 sm:h-44 bg-amber-200 rounded-t-full rounded-b-lg border-2 border-white shadow-lg z-20"></div>
                <div className="w-12 h-28 sm:w-16 sm:h-36 bg-orange-200 rounded-t-full rounded-b-lg border-2 border-white shadow-lg z-10"></div>
            </div>
          )}
        </div>

      </div>

    </section>
  );
}
