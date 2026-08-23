import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Price from '@/components/Price';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : 'all';

  let where: any = {};
  
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (category && category !== 'all') {
    where.categories = { some: { id: category } };
  }

  const products = await prisma.product.findMany({
    where,
    include: { categories: true },
    orderBy: { createdAt: 'desc' }
  });

  const t = await getTranslations('Search');

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('search_results')}</h1>
        <p className="text-gray-600 mb-8">
          {t('products_found', { count: products.length, q })}
          {category !== 'all' ? t('in_category') : ''}
        </p>

        {products.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-gray-200">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h2 className="text-xl font-medium text-gray-900 mb-2">{t('no_results')}</h2>
            <p className="text-gray-500 mb-6">{t('no_products_match')}</p>
            <Link href="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2 rounded transition">
              {t('back_to_home')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition group flex flex-col h-full">
                <Link href={`/product/${product.slug}`} className="relative h-48 sm:h-56 p-4 flex items-center justify-center bg-white overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      {t('no_image')}
                    </div>
                  )}
                  {product.isDealOfTheDay && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {t('sale')}
                    </span>
                  )}
                </Link>
                <div className="p-4 flex-grow flex flex-col">
                  {product.categories && product.categories.length > 0 && (
                    <span className="text-xs text-gray-500 mb-1">{product.categories[0].name}</span>
                  )}
                  <Link href={`/product/${product.slug}`} className="text-sm font-medium text-gray-900 hover:text-orange-600 transition line-clamp-2 mb-2 flex-grow">
                    {product.title}
                  </Link>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <Price amount={product.price} showTax={false} className="font-bold text-orange-600" />
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <Price amount={product.compareAtPrice} showTax={false} className="text-xs text-gray-400 line-through" />
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
