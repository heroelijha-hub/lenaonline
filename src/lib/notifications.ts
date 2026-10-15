import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Server-only helper to create notifications internally.
 * Not exposed as a Next.js server action to prevent unauthorized external creation.
 */
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
