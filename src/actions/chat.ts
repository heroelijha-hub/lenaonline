'use server';

import prisma from '@/lib/prisma';
import { ChatSender, ChatSessionStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

// Client actions
export async function getOrCreateSession(guestId: string, guestName?: string, guestEmail?: string) {
  let session = await prisma.chatSession.findFirst({
    where: { guestId, status: 'OPEN' },
  });

  if (!session) {
    session = await prisma.chatSession.create({
      data: {
        guestId,
        guestName,
        guestEmail,
        status: 'OPEN',
      },
    });
  }

  return session;
}

export async function sendMessage(sessionId: string, sender: ChatSender, content: string) {
  const message = await prisma.chatMessage.create({
    data: {
      sessionId,
      sender,
      content,
    },
  });
  
  // Update session updatedAt to bring it to top
  const updatedSession = await prisma.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });

  // Create notification
  const { createNotification } = await import('./notification');
  if (sender === ChatSender.CUSTOMER) {
    // Notify Admin
    await createNotification({
      isAdmin: true,
      type: 'CHAT',
      message: JSON.stringify({ key: 'new_chat_from', name: updatedSession.guestName || 'Visiteur' }),
      link: '/admin/chat',
    });
  } else {
    // Notify Customer
    await createNotification({
      isAdmin: false,
      guestId: updatedSession.guestId,
      type: 'CHAT',
      message: JSON.stringify({ key: 'new_support_message' }),
    });
  }

  revalidatePath('/admin/chat');
  return message;
}

export async function getSessionMessages(sessionId: string) {
  return await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
}

// Admin actions
export async function getAdminSessions() {
  await requireAdmin();
  return await prisma.chatSession.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Get last message for preview
      },
    },
  });
}

export async function closeSession(sessionId: string) {
  await requireAdmin();
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { status: 'CLOSED' },
  });
  revalidatePath('/admin/chat');
}
