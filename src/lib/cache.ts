import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

// Helper to get raw settings
async function fetchSettings() {
  const settingsDb = await prisma.setting.findMany();
  return settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
}

// Cached version of settings
export const getCachedSettings = unstable_cache(
  async () => fetchSettings(),
  ['global-settings'],
  { tags: ['settings'], revalidate: 3600 }
);

// We need a helper for dynamic tags per slug since unstable_cache tags must be statically defined in the wrapper
// A common pattern is a factory function:
export const getCachedProductBySlug = async (slug: string) => {
  const safeTag = slug.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'item';
  return unstable_cache(
    async () => {
      const encodedSlugLower = encodeURIComponent(slug).toLowerCase();
      const encodedSlugUpper = encodeURIComponent(slug);
      let decodedSlug = slug;
      try { decodedSlug = decodeURIComponent(slug); } catch (e) {}
      // Fallback for slugs that previously contained ≈ (%e2%89%88) or other symbols
      const normalizedSlug = decodedSlug.replace(/[≈~]/g, '').replace(/(%e2%89%88)/gi, '').replace(/-+/g, '-').replace(/^-|-$/g, '');

      return prisma.product.findFirst({
        where: { 
          OR: [
            { slug: slug },
            { slug: encodedSlugLower },
            { slug: encodedSlugUpper },
            { slug: decodedSlug },
            { slug: normalizedSlug }
          ]
        },
        include: {
          categories: true,
          Product_ForceSales_A: true,
          Product_SaleTogether_A: true,
          brand: true,
          tags: true,
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { email: true } } }
          }
        }
      });
    },
    ['product-details', safeTag],
    { tags: ['products', `product-${safeTag}`], revalidate: 3600 }
  )();
};

export const getCachedRelatedProducts = async (categoryIds: string[], excludeProductId: string) => {
  // Sort IDs so the cache key is consistent
  const sortedIds = [...categoryIds].sort();
  return unstable_cache(
    async () => prisma.product.findMany({
      where: { 
        categories: { some: { id: { in: categoryIds } } }, 
        id: { not: excludeProductId } 
      },
      include: { categories: true },
      take: 4,
    }),
    ['related-products', sortedIds.join(','), excludeProductId],
    { tags: ['products'], revalidate: 3600 }
  )();
};

// Caching for Homepage best sellers
export const getCachedBestSellers = unstable_cache(
  async () => prisma.product.findMany({
    where: { isBestSeller: true, isDeleted: false },
    take: 8,
    include: { categories: true }
  }),
  ['home-best-sellers'],
  { tags: ['products'], revalidate: 3600 }
);

// Caching for Homepage latest products
export const getCachedLatestProducts = unstable_cache(
  async () => prisma.product.findMany({
    where: { isDeleted: false },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { categories: true }
  }),
  ['home-latest-products'],
  { tags: ['products'], revalidate: 3600 }
);

// Caching categories tree
export const getCachedCategoriesTree = unstable_cache(
  async () => prisma.category.findMany({
    where: { parentId: null },
    include: { children: true }
  }),
  ['categories-tree'],
  { tags: ['categories'], revalidate: 3600 }
);

export const getCachedProductCounts = unstable_cache(
  async () => {
    const newCount = await prisma.product.count();
    const hotCount = await prisma.product.count({ where: { orderItems: { some: {} } } });
    const saleCount = await prisma.product.count({ where: { compareAtPrice: { not: null } } });
    
    return { newCount, hotCount, saleCount };
  },
  ['layout-product-counts'],
  { tags: ['products'], revalidate: 3600 }
);
