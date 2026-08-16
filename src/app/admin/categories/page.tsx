import { getCategories, createCategory } from '@/actions/admin';
import CategoryTable from '@/components/admin/CategoryTable';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Ajouter une catégorie</h2>
        <form action={async (formData) => {
          "use server";
          await createCategory(formData);
        }} className="flex gap-4">
          <input 
            type="text" 
            name="name" 
            placeholder="Nom de la catégorie (ex: Smartphones)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
            required
          />
          <button 
            type="submit" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition"
          >
            Ajouter
          </button>
        </form>
      </div>

      <CategoryTable categories={categories} />
    </div>
  );
}
