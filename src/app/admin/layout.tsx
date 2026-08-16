import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Admin</span>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
