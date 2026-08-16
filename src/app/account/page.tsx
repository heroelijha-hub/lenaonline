import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LogoutLink from '@/components/auth/LogoutLink';

export default async function AccountDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get username from metadata if it exists, otherwise use email
  const username = user.user_metadata?.username || user.email?.split('@')[0] || "Client";

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100 h-full">
      <p className="text-gray-700 mb-6">
        Salut <strong>{username}</strong> (vous n&apos;êtes pas <strong>{username}</strong>?{' '}
        <LogoutLink />
        )
      </p>

      <p className="text-gray-700 leading-relaxed">
        Depuis le tableau de bord de votre compte, vous pouvez consulter vos{' '}
        <Link href="/account/orders" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
          commandes récentes
        </Link>
        , gérer vos{' '}
        <Link href="/account/addresses" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
          adresses de livraison et de facturation
        </Link>{' '}
        et{' '}
        <Link href="/account/details" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
          modifier votre mot de passe et les détails de votre compte
        </Link>
        .
      </p>
    </div>
  );
}
