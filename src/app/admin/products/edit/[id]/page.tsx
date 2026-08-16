import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    return notFound();
  }

  return <ProductForm initialData={product} />;
}
