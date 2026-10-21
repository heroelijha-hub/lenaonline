import { getMenus } from '@/actions/menus';
import MenuManager from '@/components/admin/settings/MenuManager';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Menu manager | Admin',
};

export default async function MenusSettingsPage() {
  const menus = await getMenus();

  // Fetch custom pages from DB
  const dbPages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { title: true, slug: true },
    orderBy: { title: 'asc' }
  });

  const customPages = dbPages.map(p => ({ label: p.title, url: `/pages/${p.slug}` }));

  return (
    <div className="max-w-6xl">
      <MenuManager initialMenus={menus} customPages={customPages} />
    </div>
  );
}
