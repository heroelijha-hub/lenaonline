import Link from 'next/link';
import prisma from '@/lib/prisma';

import { getFilteredProducts } from '@/actions/public';
import Price from '@/components/Price';

// ... (Star component kept the same)
const Star = ({ filled = true }: { filled?: boolean }) => (
  <svg 
    className={`w-4 h-4 ${filled ? 'text-orange-500' : 'text-gray-300'}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const SmallCard = ({ icon, title, price, imageUrl, linkUrl = '#' }: { icon: string, title: string, price: number, imageUrl?: string, linkUrl?: string }) => (
  <Link href={linkUrl} className="flex flex-col group cursor-pointer h-full">
    <div className="border border-gray-100 rounded-xl mb-2 sm:mb-3 aspect-square flex items-center justify-center p-2 sm:p-4 bg-white shadow-sm group-hover:shadow-md transition overflow-hidden">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      ) : (
        <div className="text-3xl sm:text-5xl group-hover:scale-110 transition duration-500">{icon}</div>
      )}
    </div>
    <h3 className="text-xs sm:text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-orange-500 transition">
      {title}
    </h3>
    <Price amount={price} className="text-xs sm:text-sm font-bold text-gray-900 mt-auto" />
  </Link>
);

const BigCard = ({ 
  icon, category, title, price, rating, ratingText, imageUrl, linkUrl = '#' 
}: { 
  icon: string, category: string, title: string, price: number, rating: number, ratingText: string, imageUrl?: string, linkUrl?: string 
}) => (
  <Link href={linkUrl} className="border border-gray-200 rounded-xl p-5 flex flex-col h-full group cursor-pointer hover:shadow-lg transition bg-white">
    <div className="flex-1 flex items-center justify-center mb-6 py-10 bg-gray-50/50 rounded-lg overflow-hidden">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-contain group-hover:scale-105 transition duration-500" />
      ) : (
        <div className="text-8xl group-hover:scale-110 transition duration-500">{icon}</div>
      )}
    </div>
    <div className="mt-auto">
      <p className="text-xs text-gray-500 mb-1">{category}</p>
      <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-500 transition">
        {title}
      </h3>
      <div className="flex items-center gap-1 mb-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} filled={star <= rating} />
          ))}
        </div>
        <span className="text-xs text-gray-500">{ratingText}</span>
      </div>
      <Price amount={price} className="font-bold text-gray-900" />
    </div>
  </Link>
);

export default async function BestSeller({ config }: { config?: any }) {
  const filterType = config?.filterType || 'POPULAR';
  const categoryId = config?.categoryId || undefined;

  const dbProducts = await getFilteredProducts(filterType, categoryId, 10);
  const settingsDb = await prisma.setting.findMany();
  const settings = settingsDb.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  
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

  const displayProducts = dbProducts.length > 0 ? dbProducts.map(p => ({
    id: p.id,
    slug: p.slug,
    imageUrl: p.images[0],
    category: p.categories && p.categories.length > 0 ? p.categories[0].name : 'N/A',
    title: p.title,
    rating: 5,
    ratingText: '(5.00)',
    price: p.price,
    oldPrice: p.compareAtPrice ? p.compareAtPrice : undefined,
    imagePlaceholder: '🛍️'
  })) : [];

  const bigProduct1 = displayProducts[0];
  const bigProduct2 = displayProducts[5];

  const smallProductsGroup1 = displayProducts.slice(1, 5);
  const smallProductsGroup2 = displayProducts.slice(6, 10);

  return (
    <section className="max-w-7xl mx-auto px-4 w-full py-12 font-sans">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 
          className="font-bold text-gray-900 text-[length:var(--sz-m)] md:text-[length:var(--sz-t)] lg:text-[length:var(--sz-d)]"
          style={getResponsiveVars('title', {m: '20px', t: '24px', d: '24px'})}
        >
          {config?.title || "Our Best Seller"}
        </h2>
        <Link href="/best-seller" className="flex items-center text-sm font-semibold text-gray-900 hover:text-orange-500 transition text-[length:var(--sz-m)] md:text-[length:var(--sz-t)] lg:text-[length:var(--sz-d)]" style={getResponsiveVars('SEE_ALL_TEXT', {m: '14px', t: '14px', d: '14px'})}>
          {config?.SEE_ALL_TEXT || "See All"}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Column 1: Big Card */}
        <div className="col-span-1">
          <BigCard 
            icon={bigProduct1?.imagePlaceholder || "👟"} 
            category={bigProduct1?.category || "Cosmetics"} 
            title={bigProduct1?.title || "Comfortable Regular Comfort Sports Sneakers"} 
            price={bigProduct1?.price || 33.00} 
            rating={5} 
            ratingText="(5.00)" 
            imageUrl={bigProduct1?.imageUrl}
            linkUrl={bigProduct1 ? `/product/${bigProduct1.slug}` : '#'}
          />
        </div>

        {/* Column 2: 2x2 Small Cards */}
        <div className="col-span-1 grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((i) => {
            const p = smallProductsGroup1[i];
            return (
              <SmallCard 
                key={i}
                icon={["📱", "👟", "🍯", "⌚"][i]} 
                title={p?.title || "Product placeholder"} 
                price={p ? p.price : 18.00} 
                imageUrl={p?.imageUrl}
                linkUrl={p ? `/product/${p.slug}` : '#'}
              />
            );
          })}
        </div>

        {/* Column 3: Big Card */}
        <div className="col-span-1">
          <BigCard 
            icon="🧀" 
            category={bigProduct2?.category || "Cosmetics"} 
            title={bigProduct2?.title || "Comfortable Regular Comfort Sports Sneakers"} 
            price={bigProduct2 ? bigProduct2.price : 35.00} 
            rating={3} 
            ratingText="(3.00)" 
            imageUrl={bigProduct2?.imageUrl}
            linkUrl={bigProduct2 ? `/product/${bigProduct2.slug}` : '#'}
          />
        </div>

        {/* Column 4: 2x2 Small Cards */}
        <div className="col-span-1 grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((i) => {
            const p = smallProductsGroup2[i];
            return (
              <SmallCard 
                key={i}
                icon={["🩳", "🧀", "🎒", "👟"][i]} 
                title={p?.title || "Product placeholder"} 
                price={p ? p.price : 35.00} 
                imageUrl={p?.imageUrl}
                linkUrl={p ? `/product/${p.slug}` : '#'}
              />
            );
          })}
        </div>

      </div>

    </section>
  );
}
