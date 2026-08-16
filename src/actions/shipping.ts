'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getShippingZones() {
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: { name: 'asc' },
    });
    return zones;
  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    return [];
  }
}

export async function createShippingZone(data: { name: string; rate: number; isActive?: boolean }) {
  try {
    const zone = await prisma.shippingZone.create({
      data,
    });
    revalidatePath('/admin/shipping');
    return { success: true, zone };
  } catch (error: any) {
    console.error('Error creating shipping zone:', error);
    return { success: false, error: error.message };
  }
}

export async function updateShippingZone(id: string, data: { name?: string; rate?: number; isActive?: boolean }) {
  try {
    const zone = await prisma.shippingZone.update({
      where: { id },
      data,
    });
    revalidatePath('/admin/shipping');
    return { success: true, zone };
  } catch (error: any) {
    console.error('Error updating shipping zone:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteShippingZone(id: string) {
  try {
    await prisma.shippingZone.delete({
      where: { id },
    });
    revalidatePath('/admin/shipping');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting shipping zone:', error);
    return { success: false, error: error.message };
  }
}
