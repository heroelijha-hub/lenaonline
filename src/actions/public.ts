'use server';

import prisma from '@/lib/prisma';

export async function getBestDeals() {
  return await prisma.product.findMany({
    where: { isDealOfTheDay: true },
    include: { category: true },
    take: 4,
    orderBy: { createdAt: 'desc' }
  });
}

export async function getBestSellers() {
  return await prisma.product.findMany({
    where: { isBestSeller: true },
    include: { category: true },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
}

export async function getFilteredProducts(filterType: string, categoryId?: string, limit: number = 8) {
  let where: any = {};
  let orderBy: any = { createdAt: 'desc' };

  if (filterType === 'ON_SALE') {
    where.isDealOfTheDay = true; // For now, we use this as ON_SALE
  } else if (filterType === 'POPULAR') {
    where.isBestSeller = true;
  } else if (filterType === 'CATEGORY' && categoryId) {
    where.categoryId = categoryId;
  }
  // NEWEST is the default (empty where, order by createdAt desc)

  return await prisma.product.findMany({
    where,
    include: { category: true },
    take: limit,
    orderBy
  });
}
