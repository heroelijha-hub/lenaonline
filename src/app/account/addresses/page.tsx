import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';
export default async function AddressesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const t = await getTranslations();

  // For now, addresses are not managed in the database.
  // We display the default (empty) interface.
  const billingAddress = null;
  const shippingAddress = null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <p className="text-gray-600 mb-8 text-sm md:text-base">
          {t('AccountAddresses.addresses_intro')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Billing address */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h3 className="text-xl font-bold text-gray-900">{t('Checkout.billing_address')}</h3>
              <Link href="/account/addresses/billing" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                {t('AccountAddresses.add_btn')}
              </Link>
            </div>
            {billingAddress ? (
              <address className="text-gray-600 not-italic text-sm">
                {/* Structure pour quand l'adresse existera */}
                {billingAddress}
              </address>
            ) : (
              <p className="text-gray-500 text-sm italic">
                {t('AccountAddresses.no_address_set')}
              </p>
            )}
          </div>

          {/* Shipping address */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h3 className="text-xl font-bold text-gray-900">{t('Checkout.shipping_address')}</h3>
              <Link href="/account/addresses/shipping" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                {t('AccountAddresses.add_btn')}
              </Link>
            </div>
            {shippingAddress ? (
              <address className="text-gray-600 not-italic text-sm">
                {/* Structure pour quand l'adresse existera */}
                {shippingAddress}
              </address>
            ) : (
              <p className="text-gray-500 text-sm italic">
                {t('AccountAddresses.no_address_set')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
