import prisma from '@/lib/prisma';
import ProductCard from '@/components/shop/ProductCard';
import ShopFilters from '@/components/shop/ShopFilters';
import ShopSort from '@/components/shop/ShopSort';
import ShopPagination from '@/components/shop/ShopPagination';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCachedSettings, getCachedShopFilters, PRODUCT_CARD_SELECT } from '@/lib/cache';

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "LEÑA ONLINE SL";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "LEÑA ONLINE SL";
  
  // Extract category
  const categoryParams = params.category;
  const categories = Array.isArray(categoryParams) ? categoryParams : categoryParams ? [categoryParams] : [];
  
  if (categories.length === 1) {
    const category = await prisma.category.findFirst({
      where: { OR: [{ slug: categories[0] }, { id: categories[0] }] },
      select: { name: true, metaTitle: true, metaDescription: true }
    });
    
    if (category) {
      return {
        title: category.metaTitle ? category.metaTitle : `${category.name} | ${storeName}`,
        description: category.metaDescription || `Kaufen Sie ${category.name} gÃ¼nstig online bei ${storeName}.`,
        alternates: {
          canonical: `/shop?category=${categories[0]}`,
        },
      };
    }
  }

  return {
    title: `Tienda | ${storeName}`,
    description: 'Descubre nuestro amplio catálogo de estufas de pellets, leña y briquetas. Calidad garantizada y envío a toda España en Leña Online.',
    alternates: {
      canonical: '/shop',
    },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const t = await getTranslations('Shop');
  
  // Extract query params
  const categoryParams = params.category;
  const categories = Array.isArray(categoryParams) ? categoryParams : categoryParams ? [categoryParams] : [];
  
  const brandParams = params.brand;
  const brandsFilter = Array.isArray(brandParams) ? brandParams : brandParams ? [brandParams] : [];
  
  const minPrice = params.minPrice ? parseFloat(params.minPrice as string) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice as string) : undefined;
  
  const ratingParams = params.rating;
  const ratings = Array.isArray(ratingParams) ? ratingParams.map(Number) : ratingParams ? [Number(ratingParams)] : [];
  
  const sort = params.sort as string;
  const page = params.page ? parseInt(params.page as string) : 1;
  const limit = 12;

  // Build Prisma where clause
  const where: any = { isDeleted: false };
  
  if (categories.length > 0) {
    where.categories = { some: { slug: { in: categories } } };
  }
  
  if (brandsFilter.length > 0) {
    where.brand = { slug: { in: brandsFilter } };
  }
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  // Fetch cached metadata & settings in parallel (0 redundant DB queries)
  const [{ categories: validCategories, brands: validBrands, globalMinPrice, globalMaxPrice }, settingsMap] = await Promise.all([
    getCachedShopFilters(),
    getCachedSettings()
  ]);
  const cardStyle = (settingsMap.SHOP_CARD_STYLE as 'design1' | 'design2') || 'design2';
  const borderColor = settingsMap.SHOP_CARD_BORDER_COLOR || '';

  // Since filtering by average rating requires relation aggregation not directly supported 
  // in a simple where clause, we fetch products and filter in memory if ratings filter is active.
  // For sorting, we can do it in Prisma.
  let orderBy: any = { createdAt: 'desc' }; // default 'newest'
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };

  // SQL pagination & minimal projection
  let paginatedProducts: any[] = [];
  let totalResults = 0;

  if (ratings.length > 0) {
    const matchingProducts = await prisma.product.findMany({
      where,
      select: PRODUCT_CARD_SELECT,
      orderBy
    });

    const filtered = matchingProducts.filter(p => {
      const avg = p.reviews.length > 0 
        ? p.reviews.reduce((acc, curr) => acc + curr.rating, 0) / p.reviews.length 
        : 0;
      const roundedAvg = Math.round(avg);
      return ratings.includes(roundedAvg) || (ratings.includes(0) && p.reviews.length === 0);
    });

    totalResults = filtered.length;
    paginatedProducts = filtered.slice((page - 1) * limit, page * limit);
  } else {
    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        select: PRODUCT_CARD_SELECT,
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      })
    ]);
    totalResults = total;
    paginatedProducts = items;
  }

  const totalPages = Math.ceil(totalResults / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalResults);

  const currentRange = `${totalResults > 0 ? startIndex + 1 : 0}-${endIndex}`;



  const view = (params.view as 'grid' | 'list') || 'grid';

  let pageTitle = t('title');
  if (categories.length === 1) {
    const selectedCategory = validCategories.find(c => c.slug === categories[0] || c.id === categories[0]);
    if (selectedCategory) {
      pageTitle = selectedCategory.name;
    }
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 px-4 sm:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto text-sm text-gray-500">
          <Link href="/" className="hover:text-orange-600">{t('home')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{pageTitle}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar (Filters) */}
          <aside className="w-full lg:w-1/4 flex-shrink-0">
            <ShopFilters categories={validCategories} brands={validBrands} globalMinPrice={globalMinPrice} globalMaxPrice={globalMaxPrice} />
          </aside>

          {/* Main Content (Products) */}
          <section className="w-full lg:w-3/4">
            
            <ShopSort totalResults={totalResults} currentRange={currentRange} />

            {paginatedProducts.length > 0 ? (
              <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-6"}>
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} view={view} cardStyle={cardStyle} borderColor={borderColor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-6xl mb-4">ðŸ”</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('no_products_found')}</h3>
                <p className="text-gray-500">{t('try_modifying_filters')}</p>
              </div>
            )}

            <ShopPagination totalPages={totalPages} currentPage={page} />

          </section>
        </div>
      </div>
    </div>
  );
}
