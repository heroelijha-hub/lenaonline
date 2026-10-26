'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function getSupervisionData() {
  await requireAdmin();

  const now = new Date();
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 1. Fetch settings for integrations
  const settingsDb = await prisma.setting.findMany();
  const sMap = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

  const stripeConfigured = Boolean(sMap.STRIPE_SECRET_KEY && sMap.ENABLE_STRIPE !== 'false');
  const paypalConfigured = Boolean(sMap.PAYPAL_CLIENT_ID && sMap.PAYPAL_SECRET && sMap.ENABLE_PAYPAL !== 'false');
  const bankTransferConfigured = sMap.ENABLE_BANK_TRANSFER !== 'false';
  const smtpConfigured = Boolean(sMap.SMTP_HOST && sMap.SMTP_USER && sMap.SMTP_PASS);
  const proReceiverEmail = sMap.CONTACT_RECEIVER_EMAIL || sMap.FOOTER_SUPPORT_EMAIL || 'Non configuré';

  // 2. Fetch order metrics
  const [
    totalOrders24h,
    pendingOrdersCount,
    paidOrders24h,
    recentOrders,
    recentAbandonedCarts,
    criticalNotifications,
    lowStockProducts,
    recentChats
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: last24h } } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { createdAt: { gte: last24h }, status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    }),
    prisma.abandonedCart.findMany({
      take: 8,
      orderBy: { lastActive: 'desc' }
    }),
    prisma.notification.findMany({
      where: { isAdmin: true },
      take: 20,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.findMany({
      where: { isDeleted: false, stock: { lte: 5 } },
      select: { id: true, title: true, stock: true, price: true },
      take: 8
    }),
    prisma.chatSession.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  ]);

  return {
    timestamp: now.toISOString(),
    services: {
      database: { status: 'healthy', label: 'PostgreSQL (Prisma)' },
      stripe: { status: stripeConfigured ? 'active' : 'inactive', label: 'Stripe Gateway' },
      paypal: { status: paypalConfigured ? 'active' : 'inactive', label: 'PayPal Gateway' },
      bankTransfer: { status: bankTransferConfigured ? 'active' : 'inactive', label: 'Virement Bancaire' },
      smtp: { status: smtpConfigured ? 'active' : 'unconfigured', label: 'Serveur SMTP Mailer' },
      proEmail: proReceiverEmail,
    },
    metrics: {
      totalOrders24h,
      pendingOrdersCount,
      paidOrders24h,
      abandonedCount24h: recentAbandonedCarts.length,
      lowStockCount: lowStockProducts.length,
    },
    recentOrders: recentOrders.map(o => {
      let parsedMeta: any = null;
      try {
        if (o.destinationAddress) {
          parsedMeta = typeof o.destinationAddress === 'string' ? JSON.parse(o.destinationAddress) : o.destinationAddress;
        }
      } catch {}
      return {
        id: o.id,
        status: o.status,
        paymentMethod: o.paymentMethod,
        total: o.total,
        email: parsedMeta?.billing?.email || o.user?.email,
        name: [parsedMeta?.billing?.firstName, parsedMeta?.billing?.lastName].filter(Boolean).join(' ') || 'Cliente',
        createdAt: o.createdAt.toISOString()
      };
    }),
    recentAbandonedCarts: recentAbandonedCarts.map(c => ({
      id: c.id,
      email: c.email,
      name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Inconnu',
      totalAmount: c.totalAmount,
      status: c.status,
      lastActive: c.lastActive.toISOString()
    })),
    criticalNotifications: criticalNotifications.map(n => ({
      id: n.id,
      type: n.type,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString()
    })),
    lowStockProducts,
    recentChats: recentChats.map(c => ({
      id: c.id,
      name: c.guestName || 'Visiteur',
      email: c.guestEmail,
      status: c.status,
      lastMessage: c.messages[0]?.content || '',
      updatedAt: c.updatedAt.toISOString()
    }))
  };
}
