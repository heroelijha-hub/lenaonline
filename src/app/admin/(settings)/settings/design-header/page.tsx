import { getSettings } from '@/actions/settings';
import { getMenus } from '@/actions/menus';
import DesignHeaderForm from '@/components/admin/settings/DesignHeaderForm';

export const metadata = {
  title: 'Header and product cards Settings | Top Kamin Brennstoffe Admin',
};

export default async function DesignHeaderSettingsPage() {
  const settings = await getSettings();
  const menus = await getMenus();

  return (
    <div className="max-w-4xl">
      <DesignHeaderForm initialSettings={settings} menus={menus} />
    </div>
  );
}
