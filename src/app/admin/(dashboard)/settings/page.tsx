import { getTranslations } from 'next-intl/server';
import { getSettings } from '@/actions/settings';
import SettingsForm from './SettingsForm';

export const metadata = {
  title: 'Settings | Shopelios Admin',
};

export default async function SettingsPage() {
  const t = await getTranslations('Admin');
  const settings = await getSettings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("shop_settings")}</h1>
        <p className="text-gray-500 mt-2">{t("shop_settings_desc")}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
