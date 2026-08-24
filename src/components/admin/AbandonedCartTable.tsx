'use client';
import { useState } from 'react';
import Price from '@/components/Price';
import { sendRecoveryEmail } from '@/actions/admin';
import { useTranslations } from 'next-intl';

export default function AbandonedCartTable({ carts }: { carts: any[] }) {
  const t = useTranslations('AdminAbandonedCarts');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSendEmail = async (id: string) => {
    if (!confirm(t('confirm_send_email'))) return;
    setLoading(id);
    const res = await sendRecoveryEmail(id);
    if (res.error) {
      alert(res.error);
    } else {
      alert(t('email_sent_success'));
    }
    setLoading(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('customer_col')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('contact_col')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('last_activity_col')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('total_col')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status_col')}</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions_col')}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {carts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">{t('no_carts')}</td>
            </tr>
          ) : (
            carts.map((cart) => (
              <tr key={cart.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cart.firstName || cart.lastName ? `${cart.firstName || ''} ${cart.lastName || ''}` : t('guest')}
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
                  <div className="text-xs text-gray-500 font-normal">{cart.cartData?.length || 0} {t('items')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {cart.status === 'RECOVERED' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {t('recovered')}
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                      {t('abandoned')}
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
                      {loading === cart.id ? t('sending') : t('send_email')}
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
