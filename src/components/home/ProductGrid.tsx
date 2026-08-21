import Link from 'next/link';
import { getFilteredProducts } from '@/actions/public';
import ProductGridCard from './ProductGridCard';

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
