import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import NotificationBell from '@/components/layout/NotificationBell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
      {/* Sidebar Admin */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <Link href="/admin" className="text-xl font-bold text-orange-600">
              Shopelios Admin
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link href="/admin/products" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition">
              Produits
            </Link>
            <Link href="/admin/categories" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition">
              Catégories
            </Link>
            <Link href="/admin/orders" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition">
              Commandes
            </Link>
            <Link href="/admin/coupons" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition">
              Coupons
            </Link>
            <Link href="/admin/landing" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition">
              Landing Page
            </Link>
            <Link href="/admin/chat" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition">
              Chat Client
            </Link>
            <Link href="/admin/blogs" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition">
              Blog
            </Link>
            <Link href="/admin/pages" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 transition">
              Pages
            </Link>
            <Link href="/admin/settings" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              Paramètres
            </Link>
            <Link href="/admin/shipping" className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              Expéditions
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">Tableau de bord</h1>
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
                Se déconnecter
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
