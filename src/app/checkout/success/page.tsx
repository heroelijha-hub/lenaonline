import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getTranslations, getLocale } from 'next-intl/server';
import { getSettings } from '@/actions/settings';

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const orderId = searchParams.orderId as string;
  const t = await getTranslations('Checkout');
  const tCart = await getTranslations('Cart');
  const locale = await getLocale();
  const settings = await getSettings();

  if (!orderId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('order_not_found')}</h1>
        <Link href="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded transition-colors">
          {tCart('back_to_shop')}
        </Link>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { product: true } } }
  });

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('order_not_found')}</h1>
        <Link href="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded transition-colors">
          {tCart('back_to_shop')}
        </Link>
      </div>
    );
  }

  let metadata: any = null;
  if (order.destinationAddress) {
    try {
      metadata = JSON.parse(order.destinationAddress);
    } catch (e) {}
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  };
  
  const formatPrice = (price: number) => {
    const currency = settings.MAIN_CURRENCY || 'USD';
    const symbolPos = settings.CURRENCY_SYMBOL_POSITION || 'left';
    
    // Simplification for the server side display
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER': return t('bank_transfer');
      case 'STRIPE': return t('credit_card');
      case 'PAYPAL': return t('paypal');
      default: return method;
    }
  };

  const addressToShow = metadata?.shipping || metadata?.billing;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gray-50 text-gray-700 p-4 rounded mb-8">
        {t('order_received_thanks')}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium text-gray-600 mb-8 border-b border-gray-200 pb-4">
        <div className="flex flex-col sm:block">
          <span className="text-gray-500">{t('order_number')}</span> <strong className="text-gray-900">{order.id.split('-')[0].toUpperCase()}</strong>
        </div>
        <div className="flex flex-col sm:block">
          <span className="text-gray-500">{t('date')}</span> <strong className="text-gray-900">{formatDate(order.createdAt)}</strong>
        </div>
        <div className="flex flex-col sm:block">
          <span className="text-gray-500">{t('total')}</span> <strong className="text-gray-900">{formatPrice(order.total)}</strong>
        </div>
        <div className="flex flex-col sm:block">
          <span className="text-gray-500">{t('payment_method')}</span> <strong className="text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</strong>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('order_details')}</h2>
      
      <div className="mb-10">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-white">
                <th className="p-4 border border-gray-200 font-bold text-gray-900">{t('product')}</th>
                <th className="p-4 border border-gray-200 font-bold text-gray-900 w-1/3">{t('total')}</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item.id} className="bg-white">
                  <td className="p-4 border border-gray-200 text-gray-700">
                    <span className="text-orange-600 font-medium">{item.product.title}</span> <strong className="text-gray-900 ml-1">× {item.quantity}</strong>
                  </td>
                  <td className="p-4 border border-gray-200 text-gray-900 font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
              <tr className="bg-white">
                <td className="p-4 border border-gray-200 font-bold text-gray-900 text-right">{t('subtotal_colon')}</td>
                <td className="p-4 border border-gray-200 font-bold text-gray-900">{formatPrice(metadata?.subTotal || order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0))}</td>
              </tr>
              <tr className="bg-white">
                <td className="p-4 border border-gray-200 font-bold text-gray-900 text-right">{t('shipping_colon')}</td>
                <td className="p-4 border border-gray-200 text-gray-900">
                  <span className="font-bold">{formatPrice(metadata?.shippingCost || 0)}</span> <span className="text-sm text-gray-500 block sm:inline">{t('via')} {metadata?.shippingMethodName || t('standard_delivery')}</span>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="p-4 border border-gray-200 font-bold text-gray-900 text-right">{t('total_colon')}</td>
                <td className="p-4 border border-gray-200 font-bold text-orange-600 text-lg">{formatPrice(order.total)}</td>
              </tr>
              <tr className="bg-white">
                <td className="p-4 border border-gray-200 font-bold text-gray-900 text-right">{t('payment_method_colon')}</td>
                <td className="p-4 border border-gray-200 text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <div className="bg-gray-50 p-4 font-bold text-gray-900 border-b border-gray-200">
              {t('products')}
            </div>
            {order.orderItems.map((item) => (
              <div key={item.id} className="p-4 border-b border-gray-200 flex justify-between gap-4">
                <div className="flex-1">
                  <span className="text-orange-600 font-medium line-clamp-2">{item.product.title}</span> 
                  <strong className="text-gray-900 block mt-1">× {item.quantity}</strong>
                </div>
                <div className="font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
            
            <div className="p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-900">{t('subtotal_colon')}</span>
                <span className="font-bold text-gray-900">{formatPrice(metadata?.subTotal || order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0))}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-900">{t('shipping_colon')}</span>
                <div className="text-right">
                  <span className="font-bold">{formatPrice(metadata?.shippingCost || 0)}</span> 
                  <span className="text-xs text-gray-500 block">{t('via')} {metadata?.shippingMethodName || t('standard_delivery')}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-900">{t('total_colon')}</span>
                <span className="font-bold text-orange-600 text-lg">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded">
        <h2 className="text-xl font-bold text-gray-900 p-6 border-b border-gray-200">
          {metadata?.shipping ? t('shipping_address') : t('billing_address')}
        </h2>
        <div className="p-6 text-gray-700 space-y-1 text-sm leading-relaxed">
          {addressToShow ? (
            <>
              {addressToShow.company && <p className="font-medium">{addressToShow.company}</p>}
              <p>{addressToShow.firstName} {addressToShow.lastName}</p>
              <p>{addressToShow.address1}</p>
              {addressToShow.address2 && <p>{addressToShow.address2}</p>}
              <p>{addressToShow.postalCode} {addressToShow.city}, {addressToShow.country}</p>
              
              <div className="pt-4 mt-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {addressToShow.phone || metadata?.billing?.phone}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {metadata?.billing?.email}
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">{t('address_details_unavailable')}</p>
          )}
        </div>
      </div>

      {order.paymentMethod === 'BANK_TRANSFER' && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-2">{t('bank_transfer_instructions_title')}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('bank_transfer_instructions_desc')}
          </p>
          <div className="bg-white p-4 rounded border border-gray-200 font-mono text-sm space-y-2">
            <p><strong>{t('account_holder')}</strong> Shopelios SARL</p>
            <p><strong>{t('iban')}</strong> FR76 1234 5678 9101 1121 3141 516</p>
            <p><strong>{t('bic')}</strong> EXAMPLFR123</p>
            <p><strong>{t('bank')}</strong> Banque Exemple</p>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link href="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded transition-colors">
          {tCart('back_to_shop')}
        </Link>
      </div>
    </div>
  );
}
