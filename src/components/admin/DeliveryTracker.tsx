'use client';

import { useState } from 'react';
import { updateOrderTracking, addDeliveryPosition, deleteDeliveryPosition } from '@/actions/delivery';

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
    alert('Informations de livraison enregistrées.');
  };

  const handleAddPos = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPos(true);
    try {
      await addDeliveryPosition(orderId, posForm.city, posForm.country, posForm.note);
      setPosForm({ city: '', country: '', note: '' });
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'ajout de la position.');
    }
    setLoadingPos(false);
  };

  const handleDeletePos = async (posId: string) => {
    if (confirm('Supprimer cette position ?')) {
      await deleteDeliveryPosition(posId, orderId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration de Base */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Informations d'Expédition</h2>
        <form onSubmit={handleUpdateBase} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de suivi (Tracking Number)</label>
            <input 
              type="text" 
              value={baseForm.trackingNumber} 
              onChange={e => setBaseForm({...baseForm, trackingNumber: e.target.value})}
              placeholder="Ex: TRK-2026-0842"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-4 rounded bg-gray-50">
              <h3 className="font-semibold text-sm mb-3">Origine (Départ)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ville</label>
                  <input type="text" value={baseForm.originCity} onChange={e => setBaseForm({...baseForm, originCity: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded" placeholder="Ex: Paris" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pays</label>
                  <input type="text" value={baseForm.originCountry} onChange={e => setBaseForm({...baseForm, originCountry: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded" placeholder="Ex: France" />
                </div>
              </div>
            </div>

            <div className="border p-4 rounded bg-gray-50">
              <h3 className="font-semibold text-sm mb-3">Destination (Arrivée)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Adresse / Ville</label>
                  <input type="text" value={baseForm.destinationAddress} onChange={e => setBaseForm({...baseForm, destinationAddress: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded" placeholder="Ex: 12 Rue des Fleurs, Berlin" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pays</label>
                  <input type="text" value={baseForm.destinationCountry} onChange={e => setBaseForm({...baseForm, destinationCountry: e.target.value})} className="w-full px-3 py-1.5 text-sm border rounded" placeholder="Ex: Allemagne" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loadingBase} className="bg-orange-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50">
            {loadingBase ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>

      {/* Historique et Nouvelle Position */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Historique de Livraison</h2>
        
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
                    <button onClick={() => handleDeletePos(pos.id)} className="text-red-500 text-xs hover:underline">Supprimer</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-6">Aucune position enregistrée.</p>
        )}

        <form onSubmit={handleAddPos} className="bg-gray-50 p-4 rounded border">
          <h3 className="font-semibold text-sm mb-3">Ajouter une nouvelle position</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <input type="text" required value={posForm.city} onChange={e => setPosForm({...posForm, city: e.target.value})} placeholder="Ville actuelle" className="w-full px-3 py-1.5 text-sm border rounded" />
            </div>
            <div>
              <input type="text" required value={posForm.country} onChange={e => setPosForm({...posForm, country: e.target.value})} placeholder="Pays" className="w-full px-3 py-1.5 text-sm border rounded" />
            </div>
            <div className="md:col-span-2">
              <input type="text" value={posForm.note} onChange={e => setPosForm({...posForm, note: e.target.value})} placeholder="Note (ex: Arrêt technique, dédouanement...)" className="w-full px-3 py-1.5 text-sm border rounded" />
            </div>
          </div>
          <button type="submit" disabled={loadingPos} className="bg-gray-900 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50">
            {loadingPos ? 'Ajout...' : '+ Ajouter la position'}
          </button>
        </form>
      </div>
    </div>
  );
}
