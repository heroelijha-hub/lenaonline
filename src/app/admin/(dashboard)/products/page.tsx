import { getProducts, getCategories } from '@/actions/admin';
import Link from 'next/link';
import ProductsTable from '@/components/admin/ProductsTable';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const t = await getTranslations('AdminProducts');
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          {t('add_product')}
        </Link>
      </div>

      <ProductsTable products={products} categories={categories} />
    </div>
  );
}
