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
