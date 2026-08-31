import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductPageClient from '@/components/product/ProductPageClient';
import Price from '@/components/Price';
import ProductReviews from '@/components/product/ProductReviews';
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';

import { Metadata } from 'next';

import { getCachedProductBySlug, getCachedSettings, getCachedRelatedProducts } from '@/lib/cache';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const product = await getCachedProductBySlug(slug);
  
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
  
  const product = await getCachedProductBySlug(slug);

  const t = await getTranslations('Product');

  const settingsMap = await getCachedSettings();
  const enableBuyNow = settingsMap.ENABLE_BUY_NOW_BUTTON === 'true';
  const shippingInfo = [
    settingsMap.SHIPPING_INFO_1 || '3-5 business days in Germany',
    settingsMap.SHIPPING_INFO_2 || '5-10 business days in the Eurozone',
    settingsMap.SHIPPING_INFO_3 || 'Free shipping: Orders over €200.00',
    settingsMap.SHIPPING_INFO_4 || 'Free returns: within 30 days',
  ];

  if (!product) {
    return notFound();
  }

  // Related products (same category)
  const categoryIds = product.categories.map((c: any) => c.id);
  const relatedProducts = await getCachedRelatedProducts(categoryIds, product.id);

  // Check if logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'My Store';

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
            <ProductPageClient
              product={product as any}
              enableBuyNow={enableBuyNow}
              storeName={storeName}
              shippingInfo={shippingInfo}
              translations={{
                sku: t('sku'),
                categories: t('categories'),
                tags: t('tags'),
                sold: t('sold'),
                customer_reviews: t('customer_reviews', { count: product.reviews.length }),
                uncategorized: t('uncategorized'),
                brand: t('brand')
              }}
            />
          </div>

          {/* Tabs Section (Description & Reviews) */}
          <ProductReviews 
            productId={product.id}
            productTitle={product.title}
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
