'use client';
import { useState } from 'react';
import Price from '@/components/Price';
import { sendRecoveryEmail } from '@/actions/admin';

export default function AbandonedCartTable({ carts }: { carts: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSendEmail = async (id: string) => {
    if (!confirm('Are you sure you want to send a recovery email for this cart?')) return;
    setLoading(id);
    const res = await sendRecoveryEmail(id);
    if (res.error) {
      alert(res.error);
    } else {
      alert('Email sent successfully!');
    }
    setLoading(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {carts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No abandoned carts found.</td>
            </tr>
          ) : (
            carts.map((cart) => (
              <tr key={cart.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cart.firstName || cart.lastName ? `${cart.firstName || ''} ${cart.lastName || ''}` : 'Guest'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cart.email}<br/>
                  <span className="text-xs text-gray-400">{cart.phone}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(cart.lastActive).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  <Price amount={cart.totalAmount} showTax={false} />
                  <div className="text-xs text-gray-500 font-normal">{cart.cartData?.length || 0} item(s)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {cart.status === 'RECOVERED' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Recovered
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                      Abandoned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {cart.status === 'ABANDONED' && (
                    <button 
                      onClick={() => handleSendEmail(cart.id)} 
                      disabled={loading === cart.id} 
                      className="text-white hover:bg-orange-700 bg-orange-600 px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50"
                    >
                      {loading === cart.id ? 'Sending...' : 'Send Email'}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
