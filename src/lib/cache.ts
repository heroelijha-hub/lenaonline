import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

// Projection minimale anti-egress pour toutes les listes, cartes et grids
export const PRODUCT_CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  price: true,
  compareAtPrice: true,
  images: true,
  discountLabel: true,
  type: true,
  isBestSeller: true,
  isDealOfTheDay: true,
  categories: {
    select: {
      id: true,
      name: true,
      slug: true,
    }
  },
  reviews: {
    where: { isApproved: true },
    select: {
      rating: true,
    }
  }
} as const;

// Helper to get raw settings with minimal columns
async function fetchSettings() {
  const settingsDb = await prisma.setting.findMany({
    select: { key: true, value: true }
  });
  return settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
}

// Cached version of settings
export const getCachedSettings = unstable_cache(
  async () => fetchSettings(),
  ['global-settings'],
  { tags: ['settings'], revalidate: 3600 }
);

// Cached Shop filter metadata (categories count, brands count, price ranges)
export const getCachedShopFilters = unstable_cache(
  async () => {
    const [categories, brands, priceAgg] = await Promise.all([
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { products: true }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.brand.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: { products: true }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.product.aggregate({
        _min: { price: true },
        _max: { price: true }
      })
    ]);

    return {
      categories: categories.filter(c => c.slug !== null).map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug as string,
        _count: c._count
      })),
      brands: brands.map(b => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        _count: b._count
      })),
      globalMinPrice: Math.floor(priceAgg._min?.price || 0),
      globalMaxPrice: Math.ceil(priceAgg._max?.price || 1000)
    };
  },
  ['shop-filters-metadata'],
  { tags: ['categories', 'brands', 'products'], revalidate: 3600 }
);

// We need a helper for dynamic tags per slug since unstable_cache tags must be statically defined in the wrapper
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
      const normalizedSlugNoNumberHyphen = normalizedSlug.replace(/(\d+)-(\d+)/g, '$1$2');
      const normalizedSlugWithNumberHyphen = normalizedSlug.replace(/(\b\d{1,2})(\d{3}\b)/g, '$1-$2');

      return prisma.product.findFirst({
        where: { 
          OR: [
            { slug: slug },
            { slug: encodedSlugLower },
            { slug: encodedSlugUpper },
            { slug: decodedSlug },
            { slug: normalizedSlug },
            { slug: normalizedSlugNoNumberHyphen },
            { slug: normalizedSlugWithNumberHyphen }
          ]
        },
        include: {
          categories: { select: { id: true, name: true, slug: true } },
          Product_ForceSales_A: { select: PRODUCT_CARD_SELECT },
          Product_SaleTogether_A: { select: PRODUCT_CARD_SELECT },
          brand: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              rating: true,
              comment: true,
              reviewerName: true,
              createdAt: true,
              user: { select: { email: true } }
            }
          }
        }
      });
    },
    ['product-details', safeTag],
    { tags: ['products', `product-${safeTag}`], revalidate: 3600 }
  )();
};

export const getCachedRelatedProducts = async (categoryIds: string[], excludeProductId: string) => {
  const sortedIds = [...categoryIds].sort();
  return unstable_cache(
    async () => prisma.product.findMany({
      where: { 
        categories: { some: { id: { in: categoryIds } } }, 
        id: { not: excludeProductId },
        isDeleted: false
      },
      select: PRODUCT_CARD_SELECT,
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
    select: PRODUCT_CARD_SELECT
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
    select: PRODUCT_CARD_SELECT
  }),
  ['home-latest-products'],
  { tags: ['products'], revalidate: 3600 }
);

// Caching categories tree
export const getCachedCategoriesTree = unstable_cache(
  async () => prisma.category.findMany({
    where: { parentId: null },
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      }
    }
  }),
  ['categories-tree'],
  { tags: ['categories'], revalidate: 3600 }
);

export const getCachedProductCounts = unstable_cache(
  async () => {
    const [newCount, hotCount, saleCount] = await Promise.all([
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.product.count({ where: { isDeleted: false, orderItems: { some: {} } } }),
      prisma.product.count({ where: { isDeleted: false, compareAtPrice: { not: null } } })
    ]);
    
    return { newCount, hotCount, saleCount };
  },
  ['layout-product-counts'],
  { tags: ['products'], revalidate: 3600 }
);

// Caching menus for layout
export const getCachedMenus = unstable_cache(
  async () => {
    try {
      return await prisma.menu.findMany({
        select: {
          id: true,
          name: true,
          items: {
            select: {
              id: true,
              label: true,
              url: true,
              icon: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Error fetching cached menus:', error);
      return [];
    }
  },
  ['layout-menus'],
  { tags: ['menus'], revalidate: 3600 }
);

// Caching latest articles for homepage
export const getCachedLatestArticles = unstable_cache(
  async (limit: number = 4) => {
    try {
      return await prisma.article.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
          category: true,
          createdAt: true,
          _count: { select: { comments: { where: { isApproved: true } } } }
        }
      });
    } catch (error) {
      console.error('Error fetching cached articles:', error);
      return [];
    }
  },
  ['home-latest-articles'],
  { tags: ['articles'], revalidate: 3600 }
);
