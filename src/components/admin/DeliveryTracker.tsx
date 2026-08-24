'use client';

import { useState } from 'react';
import { updateOrderTracking, addDeliveryPosition, deleteDeliveryPosition } from '@/actions/delivery';
import { useTranslations } from 'next-intl';

type DeliveryPosition = {
  id: string;
  city: string;
  country: string;
  note: string | null;
  createdAt: Date;
};

type OrderTrackingProps = {
  orderId: string;
  trackingNumber: string | null;
  originCity: string | null;
  originCountry: string | null;
  destinationAddress: string | null;
  destinationCountry: string | null;
  deliveryPositions: DeliveryPosition[];
};

export default function DeliveryTracker({
  orderId,
  trackingNumber,
  originCity,
  originCountry,
  destinationAddress,
  destinationCountry,
  deliveryPositions,
}: OrderTrackingProps) {
  const t = useTranslations('AdminOrders');
  const [loadingBase, setLoadingBase] = useState(false);
  const [baseForm, setBaseForm] = useState({
    trackingNumber: trackingNumber || '',
    originCity: originCity || '',
    originCountry: originCountry || '',
    destinationAddress: destinationAddress || '',
    destinationCountry: destinationCountry || '',
  });

  const [loadingPos, setLoadingPos] = useState(false);
  const [posForm, setPosForm] = useState({
    city: '',
    country: '',
    note: ''
  });

  const handleUpdateBase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingBase(true);
    await updateOrderTracking(
      orderId,
      baseForm.trackingNumber,
      baseForm.originCity,
      baseForm.originCountry,
      baseForm.destinationAddress,
      baseForm.destinationCountry
    );
    setLoadingBase(false);
    alert(t('saved_success'));
  };

  const handleAddPos = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPos(true);
    try {
      await addDeliveryPosition(orderId, posForm.city, posForm.country, posForm.note);
      setPosForm({ city: '', country: '', note: '' });
    } catch (err: any) {
      alert(err.message || t('add_pos_error'));
    }
    setLoadingPos(false);
  };

  const handleDeletePos = async (posId: string) => {
    if (confirm(t('confirm_delete_pos'))) {
      await deleteDeliveryPosition(posId, orderId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration de Base */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('shipping_info')}</h2>
        <form onSubmit={handleUpdateBase} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('tracking_number')}</label>
            <input 
              type="text" 
              value={baseForm.trackingNumber} 
              onChange={e => setBaseForm({...baseForm, trackingNumber: e.target.value})}
              placeholder={t('tracking_placeholder')}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-4 rounded bg-gray-50">
              <h3 className="font-semibold text-sm mb-3">{t('origin')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('city')}</label>
                  <input type="text" value={baseForm.originCity} onChange={e => setBaseForm({...baseForm, originCity: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded" placeholder={t('city_placeholder')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('country')}</label>
                  <input type="text" value={baseForm.originCountry} onChange={e => setBaseForm({...baseForm, originCountry: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded" placeholder={t('country_placeholder')} />
                </div>
              </div>
            </div>

            <div className="border p-4 rounded bg-gray-50">
              <h3 className="font-semibold text-sm mb-3">{t('destination')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('address')}</label>
                  <input type="text" value={baseForm.destinationAddress} onChange={e => setBaseForm({...baseForm, destinationAddress: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded" placeholder={t('address_placeholder')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('country')}</label>
                  <input type="text" value={baseForm.destinationCountry} onChange={e => setBaseForm({...baseForm, destinationCountry: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded" placeholder={t('dest_country_placeholder')} />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loadingBase} className="bg-orange-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50">
            {loadingBase ? t('saving') : t('save')}
          </button>
        </form>
      </div>

      {/* Historique et Nouvelle Position */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{t('delivery_history')}</h2>
        
        {deliveryPositions.length > 0 ? (
          <div className="mb-6">
            <ul className="relative border-l border-gray-200 ml-3 space-y-4">
              {deliveryPositions.map(pos => (
                <li key={pos.id} className="pl-6">
                  <span className="absolute w-3 h-3 bg-orange-500 rounded-full -left-1.5 mt-1.5 border border-white"></span>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{pos.city}, {pos.country}</p>
                      <p className="text-xs text-gray-500">{new Date(pos.createdAt).toLocaleString()}</p>
                      {pos.note && <p className="text-sm text-gray-700 italic mt-1">{pos.note}</p>}
                    </div>
                    <button onClick={() => handleDeletePos(pos.id)} className="text-red-500 text-xs hover:underline">{t('delete')}</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-6">{t('no_position')}</p>
        )}

        <form onSubmit={handleAddPos} className="bg-gray-50 p-4 rounded border">
          <h3 className="font-semibold text-sm mb-3">{t('add_position_title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <input type="text" required value={posForm.city} onChange={e => setPosForm({...posForm, city: e.target.value})} placeholder={t('current_city_placeholder')} className="w-full px-3 py-1.5 text-sm border rounded" />
            </div>
            <div>
              <input type="text" required value={posForm.country} onChange={e => setPosForm({...posForm, country: e.target.value})} placeholder={t('country')} className="w-full px-3 py-1.5 text-sm border rounded" />
            </div>
            <div className="md:col-span-2">
              <input type="text" value={posForm.note} onChange={e => setPosForm({...posForm, note: e.target.value})} placeholder={t('note_placeholder')} className="w-full px-3 py-1.5 text-sm border rounded" />
            </div>
          </div>
          <button type="submit" disabled={loadingPos} className="bg-gray-900 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50">
            {loadingPos ? t('adding') : t('add_position_btn')}
          </button>
        </form>
      </div>
    </div>
  );
}
