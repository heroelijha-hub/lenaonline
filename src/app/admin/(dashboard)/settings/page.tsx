import { getSettings } from '@/actions/settings';
import SettingsForm from './SettingsForm';

export const metadata = {
  title: 'Paramètres | Shopelios Admin',
};

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres de la boutique</h1>
        <p className="text-gray-500 mt-2">Configurez la devise, la langue et d'autres options globales.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
