'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

export async function getMenus() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        items: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return menus;
  } catch (error) {
    console.error('Error fetching menus:', error);
    return [];
  }
}

export async function getMenuById(id: string) {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    return menu;
  } catch (error) {
    console.error('Error fetching menu by id:', error);
    return null;
  }
}

export async function getMenuBySlug(slug: string) {
  try {
    const menu = await prisma.menu.findUnique({
      where: { slug },
      include: {
        items: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    return menu;
  } catch (error) {
    console.error('Error fetching menu by slug:', error);
    return null;
  }
}

export async function createMenu(name: string) {
  try {
    const slug = generateSlug(name);
    
    // Check if slug exists
    const existing = await prisma.menu.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const menu = await prisma.menu.create({
      data: {
        name,
        slug: finalSlug,
      },
    });
    
    revalidatePath('/admin/settings/menus');
    return { success: true, menu };
  } catch (error: any) {
    console.error('Error creating menu:', error);
    return { success: false, error: error.message };
  }
}

export async function updateMenu(id: string, name: string) {
  try {
    const menu = await prisma.menu.update({
      where: { id },
      data: { name },
    });
    
    revalidatePath('/admin/settings/menus');
    return { success: true, menu };
  } catch (error: any) {
    console.error('Error updating menu:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMenu(id: string) {
  try {
    await prisma.menu.delete({
      where: { id },
    });
    
    revalidatePath('/admin/settings/menus');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting menu:', error);
    return { success: false, error: error.message };
  }
}

export type MenuItemInput = {
  id?: string;
  label: string;
  url: string;
  icon?: string;
  order: number;
};

export async function updateMenuItems(menuId: string, items: MenuItemInput[]) {
  try {
    // We will do a transaction:
    // 1. Delete items that are not in the new list (or simply delete all and recreate, but we want to keep IDs if possible).
    // The easiest way is to delete all existing items for the menu, then create the new ones.
    // However, recreating them changes their IDs, which is fine for menu items unless they are referenced elsewhere (they are not).
    
    await prisma.$transaction(async (tx) => {
      await tx.menuItem.deleteMany({
        where: { menuId },
      });
      
      if (items.length > 0) {
        await tx.menuItem.createMany({
          data: items.map((item) => ({
            menuId,
            label: item.label,
            url: item.url,
            icon: item.icon,
            order: item.order,
          })),
        });
      }
    });

    revalidatePath('/admin/settings/menus');
    revalidatePath('/'); // Revalidate front-end to reflect menu changes
    return { success: true };
  } catch (error: any) {
    console.error('Error updating menu items:', error);
    return { success: false, error: error.message };
  }
}
