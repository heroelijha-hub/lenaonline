'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupervisionData } from '@/actions/supervision';
import { useTranslations } from 'next-intl';

interface SupervisionClientProps {
  initialData: any;
}

export default function SupervisionClient({ initialData }: SupervisionClientProps) {
  const t = useTranslations('AdminSupervision');
  const [data, setData] = useState(initialData);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getSupervisionData();
      setData(fresh);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Supervision refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refreshData, 15000); // live polling every 15s
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600">
            <span>{t('last_sync')}</span>
            <span className="font-mono text-gray-900">{lastRefreshed.toLocaleTimeString()}</span>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <span>{t('auto_refresh')}</span>
          </label>

          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing ? t('refreshing') : t('refresh_btn')}</span>
          </button>
        </div>
      </div>

      {/* État des Services & Alerting Pro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Email Pro Alerting Card */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-5 rounded-xl shadow-sm border border-stone-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">
              <span>📧 {t('pro_email_card_title')}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">{t('active_badge')}</span>
            </div>
            <p className="text-sm font-semibold text-white break-all">{data.services.proEmail}</p>
            <p className="text-[11px] text-stone-300 mt-2 leading-relaxed">
              {t('pro_email_card_desc')}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-700/60 flex items-center justify-between text-[11px] text-stone-400">
            <span>{t('smtp_status')}</span>
            <span className={data.services.smtp.status === 'active' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {data.services.smtp.status === 'active' ? 'Connecté ✅' : 'À configurer ⚠️'}
            </span>
          </div>
        </div>

        {/* Passerelle Stripe */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <span>💳 {t('stripe_card_title')}</span>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${data.services.stripe.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {data.services.stripe.status === 'active' ? t('ready_msg').toUpperCase() : t('not_configured')}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {data.services.stripe.status === 'active' ? 'Cartes Bancaires Prêtes' : t('fallback_active_msg')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              En cas de bug ou d'absence de clé, le client est basculé automatiquement sur le mode actif sans bloquer sa commande.
            </p>
          </div>
          <Link href="/admin/settings" className="text-xs text-orange-700 font-semibold hover:underline mt-3 inline-block">
            {t('manage_stripe_keys')}
          </Link>
        </div>

        {/* Passerelle PayPal */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <span>🅿️ {t('paypal_card_title')}</span>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${data.services.paypal.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {data.services.paypal.status === 'active' ? t('ready_msg').toUpperCase() : t('not_configured')}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {data.services.paypal.status === 'active' ? 'Compte PayPal Prêt' : t('fallback_active_msg')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Si non configuré, le système affiche un message clair au client et lui propose le moyen de paiement disponible.
            </p>
          </div>
          <Link href="/admin/settings" className="text-xs text-orange-700 font-semibold hover:underline mt-3 inline-block">
            Gérer les identifiants PayPal →
          </Link>
        </div>

        {/* Virement Bancaire */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <span>🏦 Virement Bancaire</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px]">
                {data.services.bankTransfer.status === 'active' ? 'DISPONIBLE' : 'DÉSACTIVÉ'}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900">Mode de repli garanti</p>
            <p className="text-xs text-gray-500 mt-1">
              Permet au client de finaliser sa commande même si une passerelle externe est indisponible.
            </p>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-3">
            Fonctionne sans clé tierce
          </div>
        </div>
      </div>

      {/* KPI 24H */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Commandes (24h)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.metrics.totalOrders24h}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">En attente (Pending)</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{data.metrics.pendingOrdersCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Paniers abandonnés (24h)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.metrics.abandonedCount24h}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Alertes Stock Bas</p>
          <p className={`text-2xl font-bold mt-1 ${data.metrics.lowStockCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {data.metrics.lowStockCount}
          </p>
        </div>
      </div>

      {/* Flux d'activité en temps réel : 2 Colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Colonne Gauche (8 col) : Dernières Commandes & Notifications Système */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Notifications / Alertes Système récentes */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔔</span> Dernières Alertes &amp; Notifications Système
            </h2>
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {data.criticalNotifications.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">Aucune alerte système récente.</p>
              ) : (
                data.criticalNotifications.map((notif: any) => (
                  <div key={notif.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">⚠️</span>
                      <div>
                        <p className="font-medium text-gray-900">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(notif.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {notif.link && (
                      <Link href={notif.link} className="shrink-0 text-orange-700 hover:underline font-semibold text-[11px]">
                        Voir →
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Flux des Dernières Commandes */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span>📦</span> Flux des Commandes en Direct
              </h2>
              <Link href="/admin/orders" className="text-xs font-semibold text-orange-700 hover:underline">
                Toutes les commandes →
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5">ID Commande</th>
                    <th className="p-2.5">Client</th>
                    <th className="p-2.5">Moyen</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5">Statut</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">Aucune commande enregistrée.</td>
                    </tr>
                  ) : (
                    data.recentOrders.map((ord: any) => (
                      <tr key={ord.id} className="hover:bg-gray-50/50">
                        <td className="p-2.5 font-mono font-bold text-gray-900">#{ord.id.slice(0, 8)}</td>
                        <td className="p-2.5">
                          <p className="font-semibold text-gray-900">{ord.name}</p>
                          <p className="text-[10px] text-gray-400">{ord.email}</p>
                        </td>
                        <td className="p-2.5 font-mono text-[11px]">{ord.paymentMethod}</td>
                        <td className="p-2.5 font-bold text-gray-900">{ord.total.toFixed(2)} €</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <Link href={`/admin/orders/${ord.id}`} className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold text-[11px]">
                            Gérer
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Colonne Droite (4 col) : Paniers en direct & Produits à surveiller */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Paniers Récents */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span>🛒</span> Paniers en Direct
              </h2>
              <Link href="/admin/abandoned-carts" className="text-xs font-semibold text-orange-700 hover:underline">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-3">
              {data.recentAbandonedCarts.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center">Aucun panier récent.</p>
              ) : (
                data.recentAbandonedCarts.map((cart: any) => (
                  <div key={cart.id} className="p-2.5 bg-gray-50 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{cart.name}</p>
                      <p className="text-[10px] text-gray-500">{cart.email}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(cart.lastActive).toLocaleTimeString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{cart.totalAmount.toFixed(2)} €</span>
                      <span className={`block text-[10px] font-semibold mt-0.5 ${cart.status === 'RECOVERED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {cart.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Produits en Stock Faible */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <span>⚠️</span> Alerte Stocks Critiques
            </h2>
            <div className="space-y-2.5">
              {data.lowStockProducts.length === 0 ? (
                <p className="text-xs text-emerald-600 font-medium py-3 text-center">Tous les stocks sont au-dessus du seuil d'alerte.</p>
              ) : (
                data.lowStockProducts.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-red-50/50 border border-red-100 rounded-md">
                    <span className="font-medium text-gray-800 truncate max-w-[170px]">{p.title}</span>
                    <span className="px-2 py-0.5 bg-red-600 text-white rounded font-bold text-[10px]">
                      {p.stock ?? 0} restant(s)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Support Récent */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span>💬</span> Chat Direct
              </h2>
              <Link href="/admin/chat" className="text-xs font-semibold text-orange-700 hover:underline">
                Ouvrir le chat →
              </Link>
            </div>
            <div className="space-y-2">
              {data.recentChats.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center">Aucune conversation récente.</p>
              ) : (
                data.recentChats.map((c: any) => (
                  <div key={c.id} className="p-2 border border-gray-100 rounded text-xs">
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-gray-500 text-[11px] truncate mt-0.5 italic">"{c.lastMessage || '...'}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
