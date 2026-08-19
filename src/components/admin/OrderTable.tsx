'use client';

import { updateOrderStatus, deleteOrder } from '@/actions/admin';
import { useState } from 'react';

export default function OrderTable({ orders }: { orders: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoading(orderId);
    await updateOrderStatus(orderId, newStatus);
    setLoading(null);
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;
    setLoading(orderId);
    await deleteOrder(orderId);
    setLoading(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Aucune commande.</td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.split('-')[0]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user?.email || 'Guest'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${order.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={loading === order.id}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  >
                    <option value="PENDING">En attente</option>
                    <option value="PAID">Paiement reçu</option>
                    <option value="PROCESSING">En cours de préparation</option>
                    <option value="SHIPPED">Expédié</option>
                    <option value="IN_TRANSIT">En transit</option>
                    <option value="DELIVERED">Livré</option>
                    <option value="AT_PICKUP_POINT">Déposé en point relais</option>
                    <option value="CANCELLED">Annulé</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <a href={`/admin/orders/${order.id}`} className="text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1.5 rounded text-xs font-semibold">Détails</a>
                  <button onClick={() => handleDelete(order.id)} disabled={loading === order.id} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50">Supprimer</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
