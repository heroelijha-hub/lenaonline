'use server';

import prisma from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

export async function getDashboardStats() {
  try {
    await requireAdmin();
  } catch (err) {
    redirect('/admin/login');
  }
  const locale = await getLocale();
  try {
    // 1. Global KPIs
    const totalProducts = await prisma.product.count();
    
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' }
    });

    // Orders that are considered 'successful' (not cancelled, not pending if we want strict revenue)
    // For now, let's consider everything that is not CANCELLED as revenue.
    const successfulOrders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' }
      },
      select: {
        total: true,
        createdAt: true
      }
    });

    const totalOrdersCount = successfulOrders.length;
    const totalRevenue = successfulOrders.reduce((acc, order) => acc + order.total, 0);
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    // 2. Sales over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by day format "DD MMM"
    const salesByDayMap = new Map<string, number>();
    
    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
      salesByDayMap.set(dateString, 0);
    }

    recentOrders.forEach(order => {
      const dateString = new Date(order.createdAt).toLocaleDateString(locale, { day: '2-digit', month: 'short' });
      if (salesByDayMap.has(dateString)) {
        salesByDayMap.set(dateString, salesByDayMap.get(dateString)! + order.total);
      }
    });

    const salesData = Array.from(salesByDayMap.entries()).map(([date, amount]) => ({
      date,
      amount
    }));

    // 3. Latest 5 Orders
    const latestOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        _count: { select: { orderItems: true } }
      }
    });

    return {
      totalRevenue,
      totalOrdersCount,
      totalCustomers,
      totalProducts,
      averageOrderValue,
      salesData,
      latestOrders
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalRevenue: 0,
      totalOrdersCount: 0,
      totalCustomers: 0,
      totalProducts: 0,
      averageOrderValue: 0,
      salesData: [],
      latestOrders: []
    };
  }
}
