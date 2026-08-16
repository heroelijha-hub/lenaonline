'use client';

import { useState } from 'react';
import { createShippingZone, updateShippingZone, deleteShippingZone } from '@/actions/shipping';
import { COUNTRIES } from './countries';

type ShippingZone = {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
};

export default function ShippingManager({ initialZones }: { initialZones: ShippingZone[] }) {
  const [zones, setZones] = useState<ShippingZone[]>(initialZones);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [rate, setRate] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setRate('');
    setIsActive(true);
    setError('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (zone: ShippingZone) => {
    setName(zone.name);
    setRate(zone.rate);
    setIsActive(zone.isActive);
    setEditingId(zone.id);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!name || rate === '') {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingId) {
        // Update
        const res = await updateShippingZone(editingId, { name, rate: Number(rate), isActive });
        if (res.success && res.zone) {
          setZones(zones.map(z => (z.id === editingId ? res.zone : z)));
          resetForm();
        } else {
          setError(res.error || 'Erreur lors de la modification.');
        }
      } else {
        // Create
        const res = await createShippingZone({ name, rate: Number(rate), isActive });
        if (res.success && res.zone) {
          setZones([...zones, res.zone]);
          resetForm();
        } else {
          setError(res.error || 'Ce pays/zone existe peut-être déjà.');
        }
      }
    } catch (e: any) {
      setError(e.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) return;
    setLoading(true);
    try {
      const res = await deleteShippingZone(id);
      if (res.success) {
        setZones(zones.filter(z => z.id !== id));
      } else {
        alert(res.error || 'Erreur de suppression');
      }
    } catch (e: any) {
      alert(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Zones Desservies</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 font-medium text-sm"
          >
            + Ajouter une destination
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mb-6">
          <h3 className="font-semibold mb-4 text-gray-800">
            {editingId ? 'Modifier la destination' : 'Nouvelle destination'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination (Pays/Zone)</label>
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
              >
                <option value="">Sélectionnez un pays...</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coût par unité ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full border border-gray-300 px-3 py-2 rounded-md"
                placeholder="Ex: 5.00"
              />
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 cursor-pointer">
                Actif
              </label>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 font-medium text-sm disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              onClick={resetForm}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50 font-medium text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {zones.length === 0 ? (
        <p className="text-gray-500 text-sm italic">Aucune zone d'expédition définie. Aucune commande ne pourra être passée sans adresse valide.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Coût par unité</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{zone.name}</td>
                  <td className="px-4 py-3">${zone.rate.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${zone.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {zone.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(zone)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 mr-3 font-medium"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
