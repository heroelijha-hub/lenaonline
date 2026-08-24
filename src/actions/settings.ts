'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach(s => {
    settingsMap[s.key] = s.value;
  });
  return settingsMap;
}

export async function updateSetting(key: string, value: string) {
  await requireAdmin();
  try {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateSettingsBatch(settingsMap: Record<string, string>) {
  await requireAdmin();
  try {
    const transactions = Object.entries(settingsMap).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    });
    
    await prisma.$transaction(transactions);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
