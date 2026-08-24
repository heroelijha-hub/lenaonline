import { getCategories } from '@/actions/admin';
import Link from 'next/link';
import ProductsTable from '@/components/admin/ProductsTable';
import AdminPagination from '@/components/admin/AdminPagination';
import WooCommerceImportModal from '@/components/admin/WooCommerceImportModal';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const t = await getTranslations('AdminProducts');
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      include: { categories: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count()
  ]);

  const totalPages = Math.ceil(total / limit);
  const categories = await getCategories();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <div className="flex items-center space-x-4">
          <WooCommerceImportModal />
          <Link 
            href="/admin/products/new" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-md transition flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>{t('add_product')}</span>
          </Link>
        </div>
      </div>

      <ProductsTable products={products as any} categories={categories} />
      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
