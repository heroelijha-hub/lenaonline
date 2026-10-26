import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DeliveryTracker from '@/components/admin/DeliveryTracker';
import OrderCustomerEditor from '@/components/admin/OrderCustomerEditor';
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
  
  let subTotal = orderMeta?.subTotal;
  if (subTotal === undefined || subTotal === null) {
    subTotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }
  
  let shippingCost = orderMeta?.shippingCost;
  if (shippingCost === undefined || shippingCost === null) {
    shippingCost = order.total - subTotal;
    // ensure no floating point weirdness
    shippingCost = Math.max(0, Math.round(shippingCost * 100) / 100);
  }
  
  const shippingMethodName = orderMeta?.shippingMethodName || null;

  // For old orders without JSON metadata, look up name from AbandonedCart by email
  let fallbackCustomerName = '';
  if (!billing && order.user?.email) {
    const abandonedCart = await prisma.abandonedCart.findUnique({
      where: { email: order.user.email },
      select: { firstName: true, lastName: true }
    });
    if (abandonedCart) {
      fallbackCustomerName = [abandonedCart.firstName, abandonedCart.lastName].filter(Boolean).join(' ');
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('order_number')}{order.id.split('-')[0]}</h1>
        <a href="/admin/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t('back_to_orders')}</a>
      </div>

      {/* ── ROW 1 : Articles (gauche) + Infos client (droite) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Articles — 2/3 */}
        <div className="lg:col-span-2">
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
                        <p className="text-xs text-orange-700 font-medium">
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
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('payment_method')}</span>
                <span>{order.paymentMethod === 'BANK_TRANSFER' ? t('payment_bank_transfer') : order.paymentMethod === 'STRIPE' ? t('payment_stripe') : order.paymentMethod === 'PAYPAL' ? 'PayPal' : order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-gray-900 pt-2 border-t">
                <span>{t('total')}</span>
                <span><Price amount={order.total} showTax={false} /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Infos client & édition / renvoi confirmation — 1/3 */}
        <div className="lg:col-span-1">
          <OrderCustomerEditor
            orderId={order.id}
            initialBilling={billing || {
              firstName: fallbackCustomerName ? fallbackCustomerName.split(' ')[0] : '',
              lastName: fallbackCustomerName ? fallbackCustomerName.split(' ').slice(1).join(' ') : '',
              email: order.user?.email || '',
              address1: order.destinationAddress && !orderMeta ? order.destinationAddress : '',
              city: order.destinationCountry || '',
              postalCode: '',
              country: order.destinationCountry || 'Espagne',
            }}
            initialShipping={shipping}
            userEmail={order.user?.email}
          />
        </div>
      </div>

      {/* ── ROW 2 : Tracking (3 colonnes via DeliveryTracker) ── */}
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
  );
}
