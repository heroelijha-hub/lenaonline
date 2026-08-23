import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductActions from '@/components/product/ProductActions';
import Price from '@/components/Price';
import ProductReviews from '@/components/product/ProductReviews';
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';

import { Metadata } from 'next';

// Internal star component
const Star = ({ filled = true }: { filled?: boolean }) => (
  <svg 
    className={`w-4 h-4 ${filled ? 'text-orange-500' : 'text-gray-300'}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug }
  });
  
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "My Store";

  if (!product) {
    return {
      title: `Product not found - ${storeName}`,
    };
  }

  return {
    title: `${product.title} | ${storeName}`,
    description: product.shortDescription || product.description?.substring(0, 160),
    alternates: {
      canonical: `/product/${slug}`,
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { 
      categories: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
      }
    }
  });

  const t = await getTranslations('Product');

  const setting = await prisma.setting.findUnique({
    where: { key: 'ENABLE_BUY_NOW_BUTTON' }
  });
  const enableBuyNow = setting?.value === 'true';

  if (!product) {
    return notFound();
  }

  // Related products (same category)
  const relatedProducts = await prisma.product.findMany({
    where: { 
      categories: { some: { id: { in: product.categories.map((c: any) => c.id) } } }, 
      id: { not: product.id } 
    },
    include: { categories: true },
    take: 4,
  });

  // Check if logged in
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  const hasImages = product.images && product.images.length > 0;
  const mainImage = hasImages ? product.images[0] : null;

  // Calculate Average Rating
  const avgRating = product.reviews.length > 0 
    ? product.reviews.reduce((acc, curr) => acc + curr.rating, 0) / product.reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      
      <main className="flex-grow pb-20">
        {/* Breadcrumb */}
        <div className="bg-gray-50 py-4 px-4 sm:px-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500">{t('home')}</Link>
            <span className="mx-2">/</span>
            <span className="hover:text-orange-500 cursor-pointer">{product.categories && product.categories.length > 0 ? product.categories[0].name : t('category')}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div id="cart-notification-portal"></div>
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column: Gallery */}
            <div className="w-full lg:w-1/2 flex gap-4">
              {/* Thumbnails (Vertical) */}
              <div className="flex flex-col gap-3 w-20">
                <button className="w-full py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-100 flex justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                
                {hasImages ? (
                  product.images.slice(0, 5).map((img, idx) => (
                    <div key={idx} className={`border-2 rounded overflow-hidden cursor-pointer h-20 w-20 flex-shrink-0 ${idx === 0 ? 'border-orange-500' : 'border-transparent hover:border-gray-300'}`}>
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="border-2 border-orange-500 rounded h-20 w-20 bg-gray-100 flex items-center justify-center text-2xl">🛍️</div>
                )}
                
                <button className="w-full py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-100 flex justify-center mt-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              {/* Main Image */}
              <div className="flex-1 border border-gray-200 rounded-lg relative overflow-hidden flex items-center justify-center bg-white min-h-[400px]">
                {product.discountLabel && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    {product.discountLabel}
                  </span>
                )}
                {mainImage ? (
                  <img src={mainImage} alt={product.title} className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-9xl text-gray-300">🛍️</div>
                )}
              </div>
            </div>

            {/* Right Column: Product Info */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <h1 className="text-3xl font-bold mb-4 leading-tight">{product.title}</h1>
              
              {/* Reviews & Sold */}
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                {product.reviews.length > 0 && (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(i => <Star key={i} filled={i <= Math.round(avgRating)} />)}
                      </div>
                      <span className="ml-1 text-gray-600">{t('customer_reviews', { count: product.reviews.length })}</span>
                    </div>
                    <span className="border-l border-gray-300 h-4"></span>
                  </>
                )}
                <span>{t('sold')} <span className="font-semibold text-gray-900">24</span></span>
              </div>

              {/* Product Actions (Price, Variations, Add to Cart, Wishlist) */}
              <ProductActions product={product as any} enableBuyNow={enableBuyNow} />

              {/* Meta tags */}
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold text-gray-900">{t('sku')}</span> {product.id.split('-')[0].toUpperCase()}</p>
                <p><span className="font-semibold text-gray-900">{t('categories')}</span> {product.categories && product.categories.length > 0 ? product.categories.map(c => c.name).join(', ') : t('uncategorized')}</p>
                <p><span className="font-semibold text-gray-900">{t('tags')}</span> {storeName}, Featured</p>
              </div>

            </div>
          </div>

          {/* Tabs Section (Description & Reviews) */}
          <ProductReviews 
            productId={product.id}
            reviews={product.reviews as any}
            description={product.description}
            isLoggedIn={isLoggedIn}
          />

          {/* Related Products Section */}
          <div className="mt-20">
            <div className="border-b border-gray-200 pb-4 mb-8">
              <h2 className="text-xl font-bold text-gray-900">{t('related_products')}</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.length > 0 ? (
                relatedProducts.map(rp => (
                  <Link href={`/product/${rp.slug}`} key={rp.id} className="group border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition flex flex-col">
                    <div className="relative h-48 w-full flex items-center justify-center mb-4">
                      {rp.images && rp.images[0] ? (
                        <img src={rp.images[0]} alt={rp.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="text-6xl text-gray-300">🛍️</div>
                      )}
                    </div>
                    <div className="mt-auto">
                      <p className="text-xs text-blue-500 font-semibold mb-1">{rp.categories && rp.categories.length > 0 ? rp.categories[0].name : t('general')}</p>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-500 transition">{rp.title}</h3>
                      <Price amount={rp.price} className="font-bold text-red-600" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm">{t('no_related_products')}</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
