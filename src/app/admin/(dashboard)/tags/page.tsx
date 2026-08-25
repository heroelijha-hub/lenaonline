import { getTags } from '@/actions/admin';
import TagCreateForm from '@/components/admin/TagCreateForm';
import TagTable from '@/components/admin/TagTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Tags | Admin',
};

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gérer les Tags</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un nouveau tag</h2>
        <TagCreateForm />
      </div>

      <TagTable tags={tags as any} />
    </div>
  );
}
