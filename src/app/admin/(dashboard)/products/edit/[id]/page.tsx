import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, categories: true, tags: true, Product_ForceSales_A: true, Product_SaleTogether_A: true }
  });

  if (!product) {
    return notFound();
  }

  // Serialize to prevent Date object hydration issues in Customer Component
  const serializedProduct = JSON.parse(JSON.stringify(product));

  return <ProductForm initialData={serializedProduct} />;
}
