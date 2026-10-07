import { getMenus } from '@/actions/menus';
import MenuManager from '@/components/admin/settings/MenuManager';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Menu Manager | Admin',
};

export default async function MenusSettingsPage() {
  const menus = await getMenus();

  // Fetch custom pages from DB
  const dbPages = await prisma.page.findMany({
    where: { isDeleted: false, isPublished: true },
    select: { title: true, slug: true },
    orderBy: { title: 'asc' }
  });

  const customPages = dbPages.map(p => ({ label: p.title, url: `/pages/${p.slug}` }));

  // System pages
  const systemPages = [
    { label: 'Accueil', url: '/' },
    { label: 'Boutique', url: '/shop' },
    { label: 'Panier', url: '/cart' },
    { label: 'Favoris', url: '/wishlist' },
    { label: 'Validation (Checkout)', url: '/checkout' },
    { label: 'Mon Compte', url: '/account' },
    { label: 'Contact', url: '/admin/pages/contact' },
    { label: 'Blog', url: '/blog' },
    { label: 'Nos Marques', url: '/marques' }
  ];

  return (
    <div className="max-w-6xl">
      <MenuManager initialMenus={menus} systemPages={systemPages} customPages={customPages} />
    </div>
  );
}
