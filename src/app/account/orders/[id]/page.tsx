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

  let formattedShippingAddress = "";
  let formattedBillingAddress = "";
  let customerNameShipping = "";
  let customerNameBilling = "";
  let customerPhone = "";
  let customerEmail = user.email;
  let shippingMethodName = "";
  let subTotalAmount = order.total;
  let shippingCostAmount = 0;

  if (order.destinationAddress && order.destinationAddress.startsWith('{')) {
    try {
      const parsed = JSON.parse(order.destinationAddress);
      
      const shipObj = parsed.shipping || parsed;
      const billObj = parsed.billing || parsed;

      // Shipping Name
      if (shipObj.firstName || shipObj.lastName) {
        customerNameShipping = `${shipObj.firstName || ''} ${shipObj.lastName || ''}`.trim();
      }
      
      // Billing Name
      if (billObj.firstName || billObj.lastName) {
        customerNameBilling = `${billObj.firstName || ''} ${billObj.lastName || ''}`.trim();
      }

      // Phone
      if (billObj.phone) {
         customerPhone = billObj.phone;
      } else if (shipObj.phone) {
         customerPhone = shipObj.phone;
      } else if (parsed.phone) {
         customerPhone = parsed.phone;
      }
      
      // Email
      if (billObj.email) {
        customerEmail = billObj.email;
      }
      
      // Totals
      if (parsed.subTotal) subTotalAmount = Number(parsed.subTotal);
      if (parsed.shippingCost !== undefined) shippingCostAmount = Number(parsed.shippingCost);
      else shippingCostAmount = order.total - subTotalAmount;
      
      if (parsed.shippingMethod) shippingMethodName = parsed.shippingMethod;

      // Format Shipping
      const sParts = [];
      if (shipObj.address1) sParts.push(shipObj.address1);
      if (shipObj.address2) sParts.push(shipObj.address2);
      if (shipObj.postalCode || shipObj.city) {
        sParts.push(`${shipObj.postalCode || ''} ${shipObj.city || ''}`.trim());
      }
      if (shipObj.country) sParts.push(shipObj.country);
      if (sParts.length > 0) formattedShippingAddress = sParts.filter(Boolean).join('\n');
      
      // Format Billing
      const bParts = [];
      if (billObj.address1) bParts.push(billObj.address1);
      if (billObj.address2) bParts.push(billObj.address2);
      if (billObj.postalCode || billObj.city) {
        bParts.push(`${billObj.postalCode || ''} ${billObj.city || ''}`.trim());
      }
      if (billObj.country) bParts.push(billObj.country);
      if (bParts.length > 0) formattedBillingAddress = bParts.filter(Boolean).join('\n');
      
    } catch (e) {
      formattedShippingAddress = order.destinationAddress;
      formattedBillingAddress = order.destinationAddress;
    }
  } else {
    formattedShippingAddress = order.destinationAddress || "";
    formattedBillingAddress = order.destinationAddress || "";
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentStatus = statusLabels[order.status] || order.status;
  const orderId = order.id.split('-')[0].toUpperCase();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      
      {/* Order Intro */}
      <p className="text-gray-600 mb-8 text-sm md:text-base">
        {t.rich('order_intro', {
          id: orderId,
          date: orderDate,
          status: currentStatus,
          mark: (chunks) => <mark className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-medium">{chunks}</mark>
        })}
      </p>

      {/* Order Details Table */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">{t('order_details')}</h2>
      
      <div className="overflow-x-auto mb-10">
        <table className="w-full text-left border-collapse border border-gray-200 min-w-full">
          <thead>
            <tr>
              <th className="border border-gray-200 p-4 font-bold bg-white text-gray-900">{t('product')}</th>
              <th className="border border-gray-200 p-4 font-bold bg-white text-gray-900 w-1/3 md:w-1/4">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-200 p-4 text-gray-700">
                  <Link href={`/product/${item.product.slug}`} className="hover:text-orange-500 transition-colors">
                    {item.product.title}
                  </Link>
                  {' '}<span className="text-gray-500 font-medium">× {item.quantity}</span>
                  {item.attributes && (
                    <div className="mt-1 text-xs text-gray-500">
                      {Object.entries(item.attributes as Record<string, string>).map(([key, value]) => (
                        <span key={key} className="mr-2">{key}: {value}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="border border-gray-200 p-4 text-gray-700">
                  <Price amount={item.price * item.quantity} />
                </td>
              </tr>
            ))}
            
            <tr>
              <td className="border border-gray-200 p-4 font-bold text-gray-900">{t('subtotal')} :</td>
              <td className="border border-gray-200 p-4 font-bold text-gray-900">
                <Price amount={subTotalAmount} />
              </td>
            </tr>
            
            <tr>
              <td className="border border-gray-200 p-4 font-bold text-gray-900">Expédition :</td>
              <td className="border border-gray-200 p-4 font-bold text-gray-900">
                <Price amount={shippingCostAmount} /> 
                {shippingMethodName && <span className="text-sm font-normal text-gray-500 ml-1">via {shippingMethodName}</span>}
              </td>
            </tr>
            
            <tr>
              <td className="border border-gray-200 p-4 font-bold text-gray-900">{t('total')} :</td>
              <td className="border border-gray-200 p-4 font-bold text-gray-900">
                <Price amount={order.total} />
              </td>
            </tr>
            
            <tr>
              <td className="border border-gray-200 p-4 font-bold text-gray-900">{t('payment')} :</td>
              <td className="border border-gray-200 p-4 font-bold text-gray-900">
                {order.paymentMethod}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Addresses Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Billing Address */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Adresse de facturation</h3>
          <div className="border border-gray-200 p-5 rounded-md text-gray-600 text-sm space-y-2">
            <p className="font-medium text-gray-800">{customerNameBilling || (user.email ? user.email.split('@')[0] : '')}</p>
            <p className="whitespace-pre-wrap leading-relaxed">{formattedBillingAddress}</p>
            
            {customerPhone && (
              <p className="flex items-center gap-2 mt-4 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {customerPhone}
              </p>
            )}
            {customerEmail && (
              <p className="flex items-center gap-2 mt-2 text-gray-500 break-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {customerEmail}
              </p>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('shipping_address')}</h3>
          <div className="border border-gray-200 p-5 rounded-md text-gray-600 text-sm space-y-2">
            <p className="font-medium text-gray-800">{customerNameShipping || (user.email ? user.email.split('@')[0] : '')}</p>
            <p className="whitespace-pre-wrap leading-relaxed">{formattedShippingAddress}</p>
          </div>
        </div>
      </div>
      
      {order.trackingNumber && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-gray-700">
            <span className="font-bold mr-2">{t('tracking_number')} :</span> 
            <span className="bg-gray-100 px-3 py-1 rounded-md font-mono">{order.trackingNumber}</span>
          </p>
        </div>
      )}

    </div>
  );
}
