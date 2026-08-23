'use client';
import { useState } from 'react';
import Price from '@/components/Price';
import { sendRecoveryEmail } from '@/actions/admin';

export default function AbandonedCartTable({ carts }: { carts: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSendEmail = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir envoyer un email de relance pour ce panier ?')) return;
    setLoading(id);
    const res = await sendRecoveryEmail(id);
    if (res.error) {
      alert(res.error);
    } else {
      alert('Email envoyé avec succès !');
    }
    setLoading(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernière activité</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {carts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Aucun panier abandonné.</td>
            </tr>
          ) : (
            carts.map((cart) => (
              <tr key={cart.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cart.firstName || cart.lastName ? \`\${cart.firstName || ''} \${cart.lastName || ''}\` : 'Visiteur'}
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
                  <div className="text-xs text-gray-500 font-normal">{cart.cartData?.length || 0} article(s)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {cart.status === 'RECOVERED' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Récupéré
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                      Abandonné
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
                      {loading === cart.id ? 'Envoi...' : 'Relancer'}
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
