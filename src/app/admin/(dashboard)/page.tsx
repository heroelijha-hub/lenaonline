import { getTranslations, getLocale } from 'next-intl/server';
import { getDashboardStats } from '@/actions/dashboard';
import DashboardChart from '@/components/admin/DashboardChart';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatPriceNumber, defaultCurrencyOptions } from '@/lib/formatPrice';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const t = await getTranslations('AdminDashboard');
  const tOrders = await getTranslations('AdminOrders');
  const locale = await getLocale();
  const stats = await getDashboardStats();

  const settingsDb = await prisma.setting.findMany();
  const settingsMap = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  
  const currencyOptions = {
    currencySymbol: settingsMap.currencySymbol || defaultCurrencyOptions.currencySymbol,
    currencyPosition: (settingsMap.currencyPosition as any) || defaultCurrencyOptions.currencyPosition,
    thousandSeparator: settingsMap.thousandSeparator !== undefined ? settingsMap.thousandSeparator : defaultCurrencyOptions.thousandSeparator,
    decimalSeparator: settingsMap.decimalSeparator || defaultCurrencyOptions.decimalSeparator,
    taxIncludedInPrice: settingsMap.TAX_INCLUDED_IN_PRICE === 'true',
    defaultVatRate: Number(settingsMap.DEFAULT_VAT_RATE) || 20,
  };

  const formatPrice = (amount: number) => {
    return formatPriceNumber(amount, currencyOptions);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('revenue')}</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-2">{t("total_revenue")}</p>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('orders')}</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrdersCount}</p>
          <p className="text-xs text-gray-500 mt-2">{t("validated_orders")}</p>
        </div>

        {/* Customers */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('customers')}</h3>
            <div className="p-2 bg-orange-50 rounded-lg">
              <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-2">{t('registered_customers')}</p>
        </div>

        {/* AOV */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('aov')}</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.averageOrderValue)}</p>
          <p className="text-xs text-gray-500 mt-2">{t('avg_spend')}</p>
        </div>
      </div>

      {/* Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">{t("sales_last_30_days")}</h2>
          </div>
          <div className="h-[300px] w-full">
            <DashboardChart data={stats.salesData} />
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">{t('latest_orders')}</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-orange-700 hover:text-orange-700">{t('view_all')}</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {stats.latestOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                {t('no_recent_orders')}
              </div>
            ) : (
              <ul className="space-y-4">
                {stats.latestOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
                      <span className="text-xs text-gray-500">{order.user.email}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString(locale)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-sm text-gray-900">{formatPrice(order.total)}</span>
                      <span className="text-xs text-gray-500">{order._count.orderItems} {t('articles')}</span>
                      <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tOrders(`status_${order.status.toLowerCase()}`)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
