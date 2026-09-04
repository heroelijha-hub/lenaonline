import ShopPage from '@/app/shop/page';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "My Store";
  const category = await prisma.category.findUnique({
    where: { slug: resolvedParams.slug }
  });
  
  return {
    title: `${category?.name || 'Category'} | ${storeName}`,
    description: `Shop products in ${category?.name}`,
  };
}

export default async function ProductCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Pass the slug as category to the shop page logic
  const newSearchParams = Promise.resolve({
    ...resolvedSearchParams,
    category: resolvedParams.slug
  });
  
  return <ShopPage searchParams={newSearchParams} />;
}
