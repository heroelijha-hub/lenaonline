'use server';

import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { requireAdmin, requireAuth } from '@/lib/auth';
import { createNotification as internalCreateNotification } from '@/lib/notifications';

/**
 * Public action - requires admin privileges if creating admin notifications.
 */
export async function createNotification(params: {
  userId?: string;
  guestId?: string;
  isAdmin: boolean;
  type: NotificationType;
  message: string;
  link?: string;
}) {
  if (params.isAdmin) {
    await requireAdmin();
  }
  return await internalCreateNotification(params);
}

export async function getAdminNotifications() {
  await requireAdmin();
  return await prisma.notification.findMany({
    where: {
      isAdmin: true,
      isRead: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });
}

export async function getUserNotifications(userId?: string, guestId?: string) {
  if (!userId && !guestId) return [];
  
  if (userId) {
    try {
      const user = await requireAuth();
      if (user.id !== userId) return [];
    } catch {
      return [];
    }
  }

  return await prisma.notification.findMany({
    where: {
      isAdmin: false,
      isRead: false,
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
  if (!notificationId || typeof notificationId !== 'string') return;

  const notif = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notif) return;

  if (notif.isAdmin) {
    await requireAdmin();
  } else if (notif.userId) {
    try {
      const user = await requireAuth();
      if (user.id !== notif.userId) return;
    } catch {
      return;
    }
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(isAdmin: boolean, userId?: string, guestId?: string) {
  if (isAdmin) {
    await requireAdmin();
  }

  if (!isAdmin && userId) {
    try {
      const user = await requireAuth();
      if (user.id !== userId) return;
    } catch {
      return;
    }
  }

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
