import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Price from '@/components/Price';

export const dynamic = 'force-dynamic';

export default async function HotProductsPage() {
  const t = await getTranslations('HotProducts');

  const products = await prisma.product.findMany({
    include: { categories: true },
    orderBy: {
      orderItems: {
        _count: 'desc'
      }
    },
    take: 40 // Fetch hot products
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-gray-200">
            <h2 className="text-xl font-medium text-gray-900 mb-2">{t('no_products')}</h2>
            <Link href="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2 rounded transition">
              {t('back_to_home')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition group flex flex-col h-full">
                <Link href={`/product/${product.slug}`} className="relative h-40 sm:h-56 p-4 flex items-center justify-center bg-white overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      {t('no_image')}
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded">
                    {t('hot_badge')}
                  </span>
                </Link>
                <div className="p-3 sm:p-4 flex-grow flex flex-col">
                  {product.categories && product.categories.length > 0 && (
                    <span className="text-[10px] sm:text-xs text-gray-500 mb-1">{product.categories[0].name}</span>
                  )}
                  <Link href={`/product/${product.slug}`} className="text-xs sm:text-sm font-medium text-gray-900 hover:text-orange-600 transition line-clamp-2 mb-2 flex-grow">
                    {product.title}
                  </Link>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Price amount={product.price} showTax={false} className="font-bold text-orange-600 text-sm sm:text-base" />
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <Price amount={product.compareAtPrice} showTax={false} className="text-[10px] sm:text-xs text-gray-400 line-through" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
