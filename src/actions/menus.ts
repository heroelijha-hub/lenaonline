'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

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

function isValidMenuUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  if (/^(https?|mailto|tel):/i.test(trimmed)) return true;
  return false;
}

export async function createMenu(name: string) {
  await requireAdmin();
  try {
    const trimmedName = name?.trim();
    if (!trimmedName || trimmedName.length > 100) {
      return { success: false, error: 'Nom de menu invalide' };
    }
    const slug = generateSlug(trimmedName);
    
    // Check if slug exists
    const existing = await prisma.menu.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const menu = await prisma.menu.create({
      data: {
        name: trimmedName,
        slug: finalSlug,
      },
    });
    
    revalidateTag('menus');
    revalidatePath('/admin/settings/menus');
    return { success: true, menu };
  } catch (error: any) {
    console.error('Error creating menu:', error);
    return { success: false, error: error.message };
  }
}

export async function updateMenu(id: string, nameOrData: string | { name: string }) {
  await requireAdmin();
  try {
    const rawName = typeof nameOrData === 'string' ? nameOrData : nameOrData?.name;
    const trimmedName = rawName?.trim();
    if (!trimmedName || trimmedName.length > 100) {
      return { success: false, error: 'Nom de menu invalide' };
    }
    const menu = await prisma.menu.update({
      where: { id },
      data: { name: trimmedName },
    });
    
    revalidateTag('menus');
    revalidatePath('/admin/settings/menus');
    return { success: true, menu };
  } catch (error: any) {
    console.error('Error updating menu:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMenu(id: string) {
  await requireAdmin();
  try {
    await prisma.menu.delete({
      where: { id },
    });
    
    revalidateTag('menus');
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
  await requireAdmin();
  try {
    if (!Array.isArray(items)) {
      return { success: false, error: 'Invalid items array' };
    }

    const sanitizedItems = items.map((item, index) => {
      const cleanUrl = isValidMenuUrl(item.url) ? item.url.trim() : '#';
      return {
        menuId,
        label: (item.label || '').trim().slice(0, 100),
        url: cleanUrl,
        icon: item.icon ? item.icon.slice(0, 50) : undefined,
        order: typeof item.order === 'number' ? item.order : index,
      };
    });
    
    await prisma.$transaction(async (tx) => {
      await tx.menuItem.deleteMany({
        where: { menuId },
      });
      
      if (sanitizedItems.length > 0) {
        await tx.menuItem.createMany({
          data: sanitizedItems,
        });
      }
    });

    revalidateTag('menus');
    revalidatePath('/admin/settings/menus');
    revalidatePath('/'); // Revalidate front-end to reflect menu changes
    return { success: true };
  } catch (error: any) {
    console.error('Error updating menu items:', error);
    return { success: false, error: error.message };
  }
}
