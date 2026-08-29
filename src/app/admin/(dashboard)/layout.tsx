import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import NotificationBell from '@/components/layout/NotificationBell';
import AdminSidebarNav from '@/components/admin/AdminSidebarNav';
import { getTranslations } from 'next-intl/server';
import AutoLogout from '@/components/AutoLogout';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('AdminLayout');

  // 1. Check if an admin exists in the database
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount === 0) {
    redirect('/admin/setup');
  }

  // 2. Check current session
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/admin/login');
  }

  // 3. Verify user role
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== 'ADMIN') {
    // Optionally sign out the non-admin user
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AutoLogout redirectUrl="/admin/login" timeoutMs={15 * 60 * 1000} />
      {/* Sidebar Admin */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Link href="/admin" className="text-xl font-bold text-orange-600">
              {t('title')}
            </Link>
          </div>
          <AdminSidebarNav links={[
            { href: '/admin', label: t('dashboard') },
            { href: '/admin/products', label: t('products') },
            { href: '/admin/categories', label: t('categories') },
            { href: '/admin/brands', label: t('brands') },
            { href: '/admin/tags', label: t('tags') },
            { href: '/admin/orders', label: t('orders') },
            { href: '/admin/reviews', label: t('reviews') },
            { href: '/admin/abandoned-carts', label: t('abandoned_carts') },
            { href: '/admin/coupons', label: t('coupons') },
            { href: '/admin/landing', label: t('landing_page') },
            { href: '/admin/chat', label: t('customer_chat') },
            { href: '/admin/blogs', label: t('blog') },
            { href: '/admin/pages', label: t('pages') },
            { href: '/admin/media', label: 'Médias' },
            { href: '/admin/settings', label: t('settings') },
            { href: '/admin/shipping', label: t('shipping') },
          ]} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">{t('dashboard')}</h1>
          <div className="flex items-center space-x-6">
            <NotificationBell isAdmin={true} />
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 font-medium">{user.email}</span>
              <form action={async () => {
              'use server';
              const sb = await createClient();
              await sb.auth.signOut({ scope: 'global' });
              redirect('/');
            }}>
              <button type="submit" className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors font-medium">
                {t('sign_out')}
              </button>
            </form>
            </div>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
