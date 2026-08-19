import { getSettings } from '@/actions/settings';
import { getCategories } from '@/actions/admin';
import LandingForm from './LandingForm';

export default async function AdminLandingPage() {
  const initialSettings = await getSettings();
  const categories = await getCategories();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Landing Page</h1>
        <p className="text-gray-500">Personnalisez les textes et images de la page d'accueil.</p>
      </div>
      
      
      <LandingForm initialSettings={initialSettings} categories={categories} />
    </>
  );
}
