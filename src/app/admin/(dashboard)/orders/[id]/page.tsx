import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DeliveryTracker from '@/components/admin/DeliveryTracker';
import Price from '@/components/Price';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('AdminOrders');
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      orderItems: {
        include: {
          product: true
        }
      },
      deliveryPositions: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!order) {
    notFound();
  }

  // Parse customer metadata stored in destinationAddress field
  let orderMeta: any = null;
  try {
    if (order.destinationAddress) {
      const parsed = JSON.parse(order.destinationAddress);
      // Check if it's the metadata object (has billing key) vs a plain address string
      if (parsed && parsed.billing) {
        orderMeta = parsed;
      }
    }
  } catch {
    // Plain address string, not JSON metadata
  }

  const billing = orderMeta?.billing || null;
  const shipping = orderMeta?.shipping || null;
  const couponCode = orderMeta?.couponCode || null;
  const discount = orderMeta?.discount || 0;
  const subTotal = orderMeta?.subTotal || null;
  const shippingCost = orderMeta?.shippingCost ?? null;
  const shippingMethodName = orderMeta?.shippingMethodName || null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('order_number')}{order.id.split('-')[0]}</h1>
        <a href="/admin/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t('back_to_orders')}</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Articles + Customer Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('items')}</h2>
            <div className="space-y-4">
              {order.orderItems.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex items-center space-x-4">
                    {item.product.images[0] && (
                      <img src={item.product.images[0]} alt={item.product.title} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.product.title}</p>
                      {item.attributes && (
                        <p className="text-xs text-orange-600 font-medium">
                          {(() => {
                            try {
                              const attrs = typeof item.attributes === 'string' ? JSON.parse(item.attributes) : item.attributes;
                              return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ');
                            } catch (e) {
                              return '';
                            }
                          })()}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">{t('qty')}: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-sm"><Price amount={item.price * item.quantity} showTax={false} /></p>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="mt-4 pt-4 border-t space-y-2">
              {subTotal !== null && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('subtotal')}</span>
                  <span><Price amount={subTotal} showTax={false} /></span>
                </div>
              )}
              {couponCode && discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>
                    🏷️ {t('coupon_applied_label')}{' '}
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold text-xs">{couponCode}</span>
                  </span>
                  <span>- <Price amount={discount} showTax={false} /></span>
                </div>
              )}
              {shippingCost !== null && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('shipping_cost')}{shippingMethodName ? ` (${shippingMethodName})` : ''}</span>
                  <span><Price amount={shippingCost} showTax={false} /></span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-gray-900 pt-2 border-t">
                <span>{t('total')}</span>
                <span><Price amount={order.total} showTax={false} /></span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {billing && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">👤 {t('customer_info')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Address */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('billing_address')}</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 w-4 shrink-0">👤</span>
                      <span className="font-medium">{[billing.firstName, billing.lastName].filter(Boolean).join(' ') || '—'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 w-4 shrink-0">✉️</span>
                      <a href={`mailto:${billing.email || order.user?.email}`} className="text-orange-600 hover:underline break-all">
                        {billing.email || order.user?.email || '—'}
                      </a>
                    </div>
                    {billing.phone && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 w-4 shrink-0">📞</span>
                        <a href={`tel:${billing.phone}`} className="hover:underline">{billing.phone}</a>
                      </div>
                    )}
                    <div className="flex items-start gap-2 pt-1">
                      <span className="text-gray-400 w-4 shrink-0">📍</span>
                      <div>
                        {billing.address1 && <p>{billing.address1}</p>}
                        {billing.address2 && <p>{billing.address2}</p>}
                        <p>{[billing.postalCode, billing.city].filter(Boolean).join(' ')}</p>
                        {billing.country && <p className="font-medium">{billing.country}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address (if different) */}
                {shipping ? (
                  <div>
                    <h3 className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-3">
                      🚚 {t('shipping_address_different')}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700 bg-orange-50 border border-orange-100 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-400 w-4 shrink-0">👤</span>
                        <span className="font-medium">{[shipping.firstName, shipping.lastName].filter(Boolean).join(' ') || '—'}</span>
                      </div>
                      {shipping.company && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 w-4 shrink-0">🏢</span>
                          <span>{shipping.company}</span>
                        </div>
                      )}
                      {shipping.phone && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400 w-4 shrink-0">📞</span>
                          <a href={`tel:${shipping.phone}`} className="hover:underline">{shipping.phone}</a>
                        </div>
                      )}
                      <div className="flex items-start gap-2 pt-1">
                        <span className="text-gray-400 w-4 shrink-0">📍</span>
                        <div>
                          {shipping.address1 && <p>{shipping.address1}</p>}
                          {shipping.address2 && <p>{shipping.address2}</p>}
                          <p>{[shipping.postalCode, shipping.city].filter(Boolean).join(' ')}</p>
                          {shipping.country && <p className="font-medium">{shipping.country}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">🚚 {t('shipping_address')}</h3>
                    <p className="text-sm text-gray-500 italic">{t('same_as_billing')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallback: show user email + plain address if no JSON metadata */}
          {!billing && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">👤 {t('customer_info')}</h2>
              <div className="space-y-3 text-sm text-gray-700">
                {order.user?.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">✉️</span>
                    <a href={`mailto:${order.user.email}`} className="text-orange-600 hover:underline break-all">
                      {order.user.email}
                    </a>
                  </div>
                )}
                {order.destinationAddress && (
                  <div className="flex items-start gap-2 pt-1">
                    <span className="text-gray-400">📍</span>
                    <p className="whitespace-pre-wrap leading-relaxed">{order.destinationAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Delivery Tracker */}
        <div className="lg:col-span-1">
          <DeliveryTracker 
            orderId={order.id}
            trackingNumber={order.trackingNumber}
            originCity={order.originCity}
            originCountry={order.originCountry}
            destinationAddress={orderMeta ? null : order.destinationAddress}
            destinationCountry={order.destinationCountry}
            deliveryPositions={order.deliveryPositions}
            preparationStartedAt={order.preparationStartedAt ?? null}
            deliveryDays={order.deliveryDays ?? null}
            delayNote={order.delayNote ?? null}
            orderStatus={order.status}
          />
        </div>
      </div>
    </div>
  );
}
