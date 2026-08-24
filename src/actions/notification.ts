'use server';

import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function createNotification({
  userId,
  guestId,
  isAdmin,
  type,
  message,
  link
}: {
  userId?: string;
  guestId?: string;
  isAdmin: boolean;
  type: NotificationType;
  message: string;
  link?: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      guestId,
      isAdmin,
      type,
      message,
      link,
    }
  });
  
  if (isAdmin) {
    revalidatePath('/admin');
  } else {
    revalidatePath('/');
  }

  return notification;
}

export async function getAdminNotifications() {
  await requireAdmin();
  return await prisma.notification.findMany({
    where: {
      isAdmin: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });
}

export async function getUserNotifications(userId?: string, guestId?: string) {
  if (!userId && !guestId) return [];
  
  return await prisma.notification.findMany({
    where: {
      isAdmin: false,
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(guestId ? [{ guestId }] : []),
      ]
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });
}

export async function markAsRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(isAdmin: boolean, userId?: string, guestId?: string) {
  const whereClause: any = { isAdmin };
  
  if (!isAdmin) {
    if (!userId && !guestId) return;
    whereClause.OR = [
      ...(userId ? [{ userId }] : []),
      ...(guestId ? [{ guestId }] : []),
    ];
  }

  await prisma.notification.updateMany({
    where: whereClause,
    data: { isRead: true },
  });
}
