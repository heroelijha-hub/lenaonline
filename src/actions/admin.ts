'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- CLOUDINARY UPLOAD ---
export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return null;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'shopelios' },
      (error, result) => {
        if (error || !result) {
          console.error("Erreur d'upload Cloudinary:", error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(buffer);
  });
}

// --- CATEGORIES ---
export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  if (!name) return { error: "Nom requis" };

  try {
    await prisma.category.create({ data: { name } });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la création de la catégorie" };
  }
}

// --- PRODUCTS ---
export async function getProducts() {
  return await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createProduct(formData: FormData, imageUrls: string[]) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const compareAtPrice = formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : undefined;
  const stock = parseInt(formData.get('stock') as string, 10);
  const categoryId = formData.get('categoryId') as string;
  const isBestSeller = formData.get('isBestSeller') === 'on';
  const isDealOfTheDay = formData.get('isDealOfTheDay') === 'on';
  const discountLabel = formData.get('discountLabel') as string || undefined;

  if (!title || !price || !categoryId) {
    return { error: "Le titre, le prix et la catégorie sont obligatoires." };
  }

  try {
    await prisma.product.create({
      data: {
        title,
        description,
        price,
        compareAtPrice,
        stock,
        categoryId,
        isBestSeller,
        isDealOfTheDay,
        discountLabel,
        images: imageUrls,
      }
    });

    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erreur lors de la création du produit." };
  }
}
