import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AddressesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Pour l'instant, les adresses ne sont pas gérées dans la base de données.
  // Nous affichons l'interface par défaut (vide).
  const billingAddress = null;
  const shippingAddress = null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <p className="text-gray-600 mb-8 text-sm md:text-base">
          Les adresses suivantes seront utilisées par défaut sur la page de paiement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Billing address */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h3 className="text-xl font-bold text-gray-900">Billing address</h3>
              <Link href="#" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                Add
              </Link>
            </div>
            {billingAddress ? (
              <address className="text-gray-600 not-italic text-sm">
                {/* Structure pour quand l'adresse existera */}
                {billingAddress}
              </address>
            ) : (
              <p className="text-gray-500 text-sm italic">
                You have not set up this type of address yet.
              </p>
            )}
          </div>

          {/* Shipping address */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <h3 className="text-xl font-bold text-gray-900">Shipping address</h3>
              <Link href="#" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                Add
              </Link>
            </div>
            {shippingAddress ? (
              <address className="text-gray-600 not-italic text-sm">
                {/* Structure pour quand l'adresse existera */}
                {shippingAddress}
              </address>
            ) : (
              <p className="text-gray-500 text-sm italic">
                You have not set up this type of address yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
