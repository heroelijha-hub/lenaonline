import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import CategoryTable from '@/components/admin/CategoryTable';
import CategoryCreateForm from '@/components/admin/CategoryCreateForm';
import AdminPagination from '@/components/admin/AdminPagination';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage({ searchParams }: { searchParams: { page?: string } }) {
  const t = await getTranslations('AdminCategories');
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      skip,
      take: limit,
      include: { parent: true, children: true },
      orderBy: { name: 'asc' }
    }),
    prisma.category.count()
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("manage_categories")}</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">{t("add_category")}</h2>
        <CategoryCreateForm categories={categories} />
      </div>

      <CategoryTable categories={categories as any} />
      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
