import { getCategories } from '@/actions/admin';
import Link from 'next/link';
import ProductsTable from '@/components/admin/ProductsTable';
import AdminPagination from '@/components/admin/AdminPagination';
import WooCommerceImportModal from '@/components/admin/WooCommerceImportModal';
import ProductSearchBar from '@/components/admin/ProductSearchBar';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const t = await getTranslations('AdminProducts');
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const query = resolvedParams.q?.trim() || '';
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = query
    ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { slug: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: { categories: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const categories = await getCategories();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Barre de recherche */}
          <Suspense fallback={null}>
            <ProductSearchBar defaultValue={query} />
          </Suspense>
          <WooCommerceImportModal />
          <Link
            href="/admin/products/new"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-md transition flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t('add_product')}</span>
          </Link>
        </div>
      </div>

      {/* Résumé de la recherche */}
      {query && (
        <p className="text-sm text-gray-500">
          {total === 0
            ? `Aucun produit trouvé pour « ${query} »`
            : `${total} produit${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''} pour « ${query} »`}
        </p>
      )}

      <ProductsTable products={products as any} categories={categories} />
      <Suspense fallback={null}>
        <AdminPagination currentPage={page} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
