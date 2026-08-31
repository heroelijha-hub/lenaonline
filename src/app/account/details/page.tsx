import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AccountDetailsForm from './AccountDetailsForm';

export const dynamic = 'force-dynamic';

export default async function AccountDetailsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user metadata from Supabase
  const metadata = user.user_metadata || {};
  
  const initialData = {
    firstName: metadata.firstName || '',
    lastName: metadata.lastName || '',
    displayName: metadata.displayName || metadata.username || user.email?.split('@')[0] || '',
    email: user.email || '',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <AccountDetailsForm initialData={initialData} />
      </div>
    </div>
  );
}
