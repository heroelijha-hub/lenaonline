'use client';

import { logoutUser } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function LogoutLink() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      router.push('/login');
    });
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isPending}
      className="text-orange-500 hover:text-orange-600 font-medium transition-colors disabled:opacity-50 inline"
    >
      {isPending ? 'Logging out...' : 'Log out'}
    </button>
  );
}
