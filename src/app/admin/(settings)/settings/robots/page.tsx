import { getSettings } from '@/actions/settings';
import RobotsForm from '@/components/admin/settings/RobotsForm';

export const metadata = {
  title: 'Robots.txt | Administration',
};

export default async function RobotsSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <RobotsForm initialSettings={settings} />
    </div>
  );
}
