import { getCategories } from '@/actions/admin';
import CategoryTable from '@/components/admin/CategoryTable';
import CategoryCreateForm from '@/components/admin/CategoryCreateForm';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Categories</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Add une catégorie</h2>
        <CategoryCreateForm categories={categories} />
      </div>

      <CategoryTable categories={categories} />
    </div>
  );
}
