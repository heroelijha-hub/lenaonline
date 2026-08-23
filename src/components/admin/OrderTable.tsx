'use client';
import { useTranslations } from 'next-intl';
import { updateOrderStatus, deleteOrder } from '@/actions/admin';
import { useState } from 'react';
import Price from '@/components/Price';

export default function OrderTable({ orders }: { orders: any[] }) {
  const t = useTranslations('Admin');

  const [loading, setLoading] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoading(orderId);
    await updateOrderStatus(orderId, newStatus);
    setLoading(null);
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    setLoading(orderId);
    await deleteOrder(orderId);
    setLoading(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("order_col")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("date_col")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("customer_col")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("total_col")}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("status_col")}</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t("actions_col")}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No orders.</td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.split('-')[0]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user?.email || 'Guest'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900"><Price amount={order.total} showTax={false} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={loading === order.id}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">{t("status_paid")}</option>
                    <option value="PROCESSING">{t("status_processing")}</option>
                    <option value="SHIPPED">{t("status_shipped")}</option>
                    <option value="IN_TRANSIT">{t("status_in_transit")}</option>
                    <option value="DELIVERED">{t("status_delivered")}</option>
                    <option value="AT_PICKUP_POINT">{t("status_pickup")}</option>
                    <option value="CANCELLED">{t("status_cancelled")}</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <a href={`/admin/orders/${order.id}`} className="text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1.5 rounded text-xs font-semibold">Details</a>
                  <button onClick={() => handleDelete(order.id)} disabled={loading === order.id} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
