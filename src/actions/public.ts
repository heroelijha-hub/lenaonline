'use server';

import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getBestDeals = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      where: { isDealOfTheDay: true },
      include: { categories: true, reviews: { where: { isApproved: true } } },
      take: 4,
      orderBy: { createdAt: 'desc' }
    });
  },
  ['public-best-deals'],
  { tags: ['products'], revalidate: 3600 }
);

export const getBestSellers = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      where: { isBestSeller: true },
      include: { categories: true, reviews: { where: { isApproved: true } } },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
  },
  ['public-best-sellers'],
  { tags: ['products'], revalidate: 3600 }
);

export const getFilteredProducts = async (filterType: string, categoryId?: string, limit: number = 8, productIds?: string[]) => {
  return unstable_cache(
    async () => {
      if (filterType === 'MANUAL' && productIds && productIds.length > 0) {
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          include: { categories: true, reviews: { where: { isApproved: true } } },
          take: limit,
        });
        return products.sort((a, b) => productIds.indexOf(a.id) - productIds.indexOf(b.id));
      }

      let where: any = {};
      let orderBy: any = { createdAt: 'desc' };

      if (filterType === 'ON_SALE') {
        where.isDealOfTheDay = true;
      } else if (filterType === 'POPULAR') {
        where.isBestSeller = true;
      }

      // Always apply category filter when categoryId is provided
      if (categoryId) {
        where.categories = { some: { id: categoryId } };
      }

      return await prisma.product.findMany({
        where,
        include: { categories: true, reviews: { where: { isApproved: true } } },
        take: limit,
        orderBy
      });
    },
    ['filtered-products', filterType, categoryId || 'all', limit.toString(), (productIds || []).join(',')],
    { tags: ['products'], revalidate: 3600 }
  )();
};

export async function searchProducts(query: string, categoryId?: string, limit: number = 5) {
  if (!query || query.trim().length === 0) return [];

  let where: any = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ]
  };

  if (categoryId && categoryId !== 'all') {
    where.categories = { some: { id: categoryId } };
  }

  return await prisma.product.findMany({
    where,
    select: {
      id: true,
      title: true,
      price: true,
      compareAtPrice: true,
      images: true,
      slug: true,
    },
    take: limit,
  });
}

export async function getProductsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  
  return await prisma.product.findMany({
    where: {
      id: {
        in: ids
      }
    },
    include: { categories: true, reviews: { where: { isApproved: true } } }
  });
}
