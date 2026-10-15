'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

const SENSITIVE_KEYS = new Set([
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'PAYPAL_SECRET',
  'CRON_SECRET',
  'SMTP_PASS',
  'SMTP_PASSWORD',
  'CLOUDINARY_API_SECRET',
]);

function isSensitiveSettingKey(key: string): boolean {
  if (SENSITIVE_KEYS.has(key)) return true;
  const upper = key.toUpperCase();
  return upper.endsWith('_SECRET') || upper.endsWith('_PASS') || upper.endsWith('_PASSWORD');
}

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, string> = {};
  
  let isAdmin = false;
  try {
    await requireAdmin();
    isAdmin = true;
  } catch {
    isAdmin = false;
  }

  settings.forEach(s => {
    if (isAdmin || !isSensitiveSettingKey(s.key)) {
      settingsMap[s.key] = s.value;
    }
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
