import Link from 'next/link';
import { getFilteredProducts } from '@/actions/public';
import ProductGridCard from './ProductGridCard';
import prisma from '@/lib/prisma';

type ProductGridProps = {
  config: {
    title: string;
    filterType: string;
    categoryId?: string;
    variant?: string;
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

  const seeAllUrl = categoryId ? `/search?category=${categoryId}` : '/search';

  return (
    <section className="max-w-7xl mx-auto px-4 w-full py-12 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 
          className="text-gray-900 font-bold text-[length:var(--sz-m)] md:text-[length:var(--sz-t)] lg:text-[length:var(--sz-d)]"
          style={getResponsiveVars('title', {m: '24px', t: '24px', d: '24px'})}
        >
          {title}
        </h2>
        <Link 
          href={seeAllUrl} 
          className="flex items-center text-sm font-semibold text-gray-900 hover:text-orange-500 transition text-[length:var(--sz-m)] md:text-[length:var(--sz-t)] lg:text-[length:var(--sz-d)]" 
          style={getResponsiveVars('SEE_ALL_TEXT', {m: '14px', t: '14px', d: '14px'})}
        >
          {settings.SEE_ALL_TEXT || 'Voir Tout'}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map(p => (
          <ProductGridCard 
            key={p.id}
            product={p}
            variant={variant}
            cardBorderColor={cardBorderColor}
            btnBgColor={btnBgColor}
            btnTextColor={btnTextColor}
          />
        ))}
      </div>
    </section>
  );
}
