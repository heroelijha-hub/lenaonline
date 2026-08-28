import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import Price from '@/components/Price';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const t = await getTranslations('AccountOrders');
  const locale = await getLocale();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  });

  if (!user) {
    redirect('/login');
  }

  // Fetch the order and verify ownership
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: {
        include: { product: true }
      }
    }
  });

  if (!order) {
    notFound();
  }

  if (order.userId !== user.id) {
    redirect('/account/orders'); // unauthorized
  }

  const statusLabels: Record<string, string> = {
    PENDING: t('status_pending'),
    PAID: t('status_paid'),
    PROCESSING: t('status_processing'),
    SHIPPED: t('status_shipped'),
    IN_TRANSIT: t('status_in_transit'),
    DELIVERED: t('status_delivered'),
    AT_PICKUP_POINT: t('status_at_pickup_point'),
    CANCELLED: t('status_cancelled')
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-800',
    PAID: 'bg-green-100 text-green-800',
    PROCESSING: 'bg-orange-100 text-orange-800',
    SHIPPED: 'bg-blue-100 text-blue-800',
    IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-teal-100 text-teal-800',
    AT_PICKUP_POINT: 'bg-purple-100 text-purple-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  const totalItems = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Link href="/account/orders" className="text-gray-400 hover:text-orange-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            {t('order_details')} #{order.id.split('-')[0].toUpperCase()}
          </h2>
          <p className="text-sm text-gray-500 mt-1 ml-7">
            {new Date(order.createdAt).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Order Items */}
          <div className="w-full md:w-2/3">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('items_ordered')} ({totalItems})</h3>
            <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex p-4 gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden relative flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image 
                        src={item.product.images[0]} 
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${item.product.slug}`} className="text-sm font-bold text-gray-900 hover:text-orange-500 transition-colors line-clamp-2">
                      {item.product.title}
                    </Link>
                    {item.attributes && (
                      <div className="mt-1 text-xs text-gray-500">
                        {Object.entries(item.attributes as Record<string, string>).map(([key, value]) => (
                          <span key={key} className="mr-3">{key}: {value}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-600">{t('quantity')}: {item.quantity}</span>
                      <span className="text-sm font-bold text-gray-900"><Price amount={item.price * item.quantity} /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary & Shipping */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
              <h3 className="text-md font-bold text-gray-900 mb-4">{t('order_summary')}</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('subtotal')}</span>
                  <span className="font-medium text-gray-900"><Price amount={order.total} /></span>
                </div>
                {/* Note: In a real app, you'd calculate subtotal, tax, shipping separately. Here we just show total. */}
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex justify-between">
                <span className="font-bold text-gray-900">{t('total')}</span>
                <span className="font-bold text-orange-500 text-lg"><Price amount={order.total} /></span>
              </div>
            </div>

            {order.destinationAddress && (
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <h3 className="text-md font-bold text-gray-900 mb-3">{t('shipping_address')}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {order.destinationAddress}
                </p>
                {order.destinationCountry && (
                  <p className="text-sm text-gray-600 mt-1">{order.destinationCountry}</p>
                )}
              </div>
            )}
            
            {order.trackingNumber && (
              <div className="bg-orange-50 p-5 rounded-lg border border-orange-100">
                <h3 className="text-md font-bold text-orange-800 mb-2">{t('tracking_number')}</h3>
                <p className="text-sm font-mono font-medium text-orange-900">
                  {order.trackingNumber}
                </p>
              </div>
            )}
            
          </div>

        </div>
      </div>
    </div>
  );
}
