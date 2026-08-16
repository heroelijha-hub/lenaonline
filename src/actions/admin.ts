'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
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

export async function updateCategory(id: string, name: string) {
  try {
    await prisma.category.update({
      where: { id },
      data: { name }
    });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { error: "Erreur: Cette catégorie contient peut-être des produits." };
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
  
  const stockRaw = formData.get('stock') as string;
  const stock = stockRaw ? parseInt(stockRaw, 10) : null; // Si vide -> null (En stock)

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

// --- ORDERS ---
export async function getOrders() {
  return await prisma.order.findMany({
    include: {
      user: true,
      orderItems: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateOrderStatus(orderId: string, status: any) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour du statut." };
  }
}

// --- COUPONS ---
export async function getCoupons() {
  return await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createCoupon(formData: FormData) {
  const code = formData.get('code') as string;
  const discountPercentage = parseInt(formData.get('discountPercentage') as string, 10);
  const isActive = formData.get('isActive') === 'on';

  if (!code || isNaN(discountPercentage)) {
    return { error: "Le code et le pourcentage sont obligatoires." };
  }

  try {
    await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountPercentage,
        isActive
      }
    });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la création (le code existe peut-être déjà)." };
  }
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  try {
    await prisma.coupon.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression." };
  }
}
