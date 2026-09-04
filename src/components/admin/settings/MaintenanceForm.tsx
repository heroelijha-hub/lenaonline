'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettingsBatch } from '@/actions/settings';

export default function MaintenanceForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const tSettings = useTranslations('AdminSettings');
  const router = useRouter();
  
  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings.MAINTENANCE_MODE === 'true');
  const [maintenanceTitle, setMaintenanceTitle] = useState(initialSettings.MAINTENANCE_TITLE || 'Site under maintenance');
  const [maintenanceMessage, setMaintenanceMessage] = useState(initialSettings.MAINTENANCE_MESSAGE || 'We are currently updating our store. Come back very soon!');
  const [maintenanceImage, setMaintenanceImage] = useState(initialSettings.MAINTENANCE_IMAGE || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await updateSettingsBatch({
      MAINTENANCE_MODE: maintenanceMode.toString(),
      MAINTENANCE_TITLE: maintenanceTitle,
      MAINTENANCE_MESSAGE: maintenanceMessage,
      MAINTENANCE_IMAGE: maintenanceImage
    });

    setMessage(tSettings('update_success'));
    setIsLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Maintenance Mode</h2>
        <p className="text-gray-500 mt-1">Hide your store while you make changes.</p>
      </div>
      {message && <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{message}</div>}

      <div className="space-y-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <button type="button" role="switch" aria-checked={maintenanceMode} onClick={() => setMaintenanceMode(!maintenanceMode)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${maintenanceMode ? "bg-blue-600" : "bg-gray-200"}`}>  <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${maintenanceMode ? "translate-x-5" : "translate-x-0"}`} /></button><span className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setMaintenanceMode(!maintenanceMode)}>Enable Maintenance Mode</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input type="text" value={maintenanceTitle} onChange={(e) => setMaintenanceTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea value={maintenanceMessage} onChange={(e) => setMaintenanceMessage(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500" />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold transition-colors">
          {isLoading ? tSettings('saving') : 'Save changes'}
        </button>
      </div>
    </form>
  );
}