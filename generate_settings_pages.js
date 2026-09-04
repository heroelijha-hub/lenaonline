const fs = require('fs');
const path = require('path');

const pages = [
  { id: 'store-features', name: 'StoreFeatures', title: 'Store features' },
  { id: 'shipping-info', name: 'ShippingInfo', title: 'Product shipping info' },
  { id: 'taxes', name: 'Taxes', title: 'Taxes and VAT' },
  { id: 'payments', name: 'Payments', title: 'Payments' },
  { id: 'design-header', name: 'DesignHeader', title: 'Header and product cards' },
  { id: 'navigation', name: 'Navigation', title: 'Navigation menu' },
  { id: 'footer', name: 'Footer', title: 'Footer' },
  { id: 'smtp', name: 'Smtp', title: 'Email server (SMTP)' },
  { id: 'chat', name: 'Chat', title: 'Customer chat' },
  { id: 'maintenance', name: 'Maintenance', title: 'Maintenance mode' },
  { id: 'not-found-page', name: 'NotFoundPage', title: '404 page' }
];

const componentsDir = path.join(__dirname, 'src', 'components', 'admin', 'settings');
const pagesDir = path.join(__dirname, 'src', 'app', 'admin', '(settings)', 'settings');

if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

pages.forEach(page => {
  // Create Component
  const componentPath = path.join(componentsDir, `${page.name}Form.tsx`);
  const componentContent = `'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function ${page.name}Form({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    // Add specific settings for this section
    const settingsMap: Record<string, string> = {};

    await updateSettingsBatch(settingsMap);

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">${page.title}</h2>
        <p className="text-gray-500 mt-1">Settings for this category only.</p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="py-8 text-center text-gray-500">
          <p>The fields for ${page.title} have been modularized and will be populated here.</p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors"
        >
          {isLoading ? tSettings('saving') : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
`;
  if (!fs.existsSync(componentPath)) {
    fs.writeFileSync(componentPath, componentContent);
  }

  // Create Page
  const pageDirPath = path.join(pagesDir, page.id);
  if (!fs.existsSync(pageDirPath)) {
    fs.mkdirSync(pageDirPath, { recursive: true });
  }
  
  const pagePath = path.join(pageDirPath, 'page.tsx');
  const pageContent = `import { getSettings } from '@/actions/settings';
import ${page.name}Form from '@/components/admin/settings/${page.name}Form';

export const metadata = {
  title: '${page.title} Settings | Top Kamin Brennstoffe Admin',
};

export default async function ${page.name}SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-4xl">
      <${page.name}Form initialSettings={settings} />
    </div>
  );
}
`;
  if (!fs.existsSync(pagePath)) {
    fs.writeFileSync(pagePath, pageContent);
  }
});

console.log('All templates created!');
