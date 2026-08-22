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

  // Get username from user metadata if it exists, otherwise use email
  const username = user.user_metadata?.username || user.email?.split('@')[0] || "Customer";

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100 h-full">
      <p className="text-gray-700 mb-6">
        Hello <strong>{username}</strong> (not <strong>{username}</strong>?{' '}
        <LogoutLink />
        )
      </p>

      <p className="text-gray-700 leading-relaxed">
        From your account dashboard you can view your{' '}
        <Link href="/account/orders" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
          recent orders
        </Link>
        , manage your{' '}
        <Link href="/account/addresses" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
          shipping and billing addresses
        </Link>{' '}
        and{' '}
        <Link href="/account/details" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
          edit your password and account details
        </Link>
        .
      </p>
    </div>
  );
}
