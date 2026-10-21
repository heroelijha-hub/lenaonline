import { getSettings } from '@/actions/settings';
import SeoForm from '@/components/admin/settings/SeoForm';

export const metadata = {
  title: 'Paramètres SEO et OpenGraph | Administration',
};

export default async function SeoSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <SeoForm initialSettings={settings} />
    </div>
  );
}
