import { getBrands } from '@/actions/admin';
import BrandCreateForm from '@/components/admin/BrandCreateForm';
import BrandTable from '@/components/admin/BrandTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Brands | Admin',
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gérer les Marques</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ajouter une nouvelle marque</h2>
        <BrandCreateForm />
      </div>

      <BrandTable brands={brands as any} />
    </div>
  );
}
