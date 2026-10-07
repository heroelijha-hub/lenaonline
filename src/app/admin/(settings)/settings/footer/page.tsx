import { getSettings } from '@/actions/settings';
import { getMenus } from '@/actions/menus';
import FooterForm from '@/components/admin/settings/FooterForm';

export const metadata = {
  title: 'Footer Settings | Top Kamin Brennstoffe Admin',
};

export default async function FooterSettingsPage() {
  const settings = await getSettings();
  const menus = await getMenus();

  return (
    <div className="max-w-4xl">
      <FooterForm initialSettings={settings} menus={menus} />
    </div>
  );
}
