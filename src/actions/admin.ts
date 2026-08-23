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
    include: { parent: true, children: true },
    orderBy: { name: 'asc' }
  });
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  let slug = formData.get('slug') as string;
  const parentId = formData.get('parentId') as string || null;
  if (!name) return { error: "Nom requis" };

  if (!slug) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  } else {
    slug = slug.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  try {
    await prisma.category.create({ data: { name, slug, parentId } });
    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: "Error creating category" };
  }
}

export async function updateCategory(id: string, name: string, slug?: string, parentId?: string | null) {
  try {
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    } else {
      finalSlug = finalSlug.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    await prisma.category.update({
      where: { id },
      data: { name, slug: finalSlug, parentId: parentId || null }
    });
    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: "Error updating." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: "Error: This category may contain products." };
  }
}

// --- PRODUCTS ---
export async function getProducts() {
  return await prisma.product.findMany({
    include: { categories: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createProduct(formData: FormData, imageUrls: string[]) {
  const type = formData.get('type') as any || 'SIMPLE';
  const attributesRaw = formData.get('attributes') as string;
  const variationsRaw = formData.get('variations') as string;
  const attributes = attributesRaw ? JSON.parse(attributesRaw) : [];
  const variations = variationsRaw ? JSON.parse(variationsRaw) : [];

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const shortDescription = formData.get('shortDescription') as string;
  const price = parseFloat(formData.get('price') as string);
  const compareAtPrice = formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : undefined;
  
  const stockRaw = formData.get('stock') as string;
  const stock = stockRaw ? parseInt(stockRaw, 10) : null; // Si vide -> null (En stock)

  const categoryIdsRaw = formData.get('categoryIds') as string;
  const categoryIds = categoryIdsRaw ? JSON.parse(categoryIdsRaw) : [];
  const isBestSeller = formData.get('isBestSeller') === 'on';
  const isDealOfTheDay = formData.get('isDealOfTheDay') === 'on';
  const discountLabel = formData.get('discountLabel') as string || undefined;
  
  const tagsRaw = formData.get('tags') as string;
  const tags = tagsRaw ? JSON.parse(tagsRaw) : [];

  const providedSlug = formData.get('slug') as string;

  if (!title || !price || categoryIds.length === 0) {
    return { error: "Title, price and at least one category are required." };
  }

  // Generate slug
  let uniqueSlug = providedSlug;
  if (!uniqueSlug) {
    let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!baseSlug) baseSlug = 'produit';
    uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  } else {
    uniqueSlug = uniqueSlug.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  try {
    await prisma.product.create({
      data: {
        title,
        slug: uniqueSlug,
        type,
        attributes,
        variations,
        shortDescription,
        description,
        price,
        compareAtPrice,
        stock,
        categories: {
          connect: categoryIds.map((id: string) => ({ id }))
        },
        isBestSeller,
        isDealOfTheDay,
        discountLabel,
        tags,
        images: imageUrls,
      }
    });

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Unable to create product." };
  }
}

export async function updateProduct(formData: FormData, imageUrls: string[]) {
  const id = formData.get('id') as string;
  const type = formData.get('type') as any || 'SIMPLE';
  const attributesRaw = formData.get('attributes') as string;
  const variationsRaw = formData.get('variations') as string;
  const attributes = attributesRaw ? JSON.parse(attributesRaw) : [];
  const variations = variationsRaw ? JSON.parse(variationsRaw) : [];

  const title = formData.get('title') as string;
  const shortDescription = formData.get('shortDescription') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const compareAtPrice = formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : undefined;
  
  const stockRaw = formData.get('stock') as string;
  const stock = stockRaw ? parseInt(stockRaw, 10) : null;

  const categoryIdsRaw = formData.get('categoryIds') as string;
  const categoryIds = categoryIdsRaw ? JSON.parse(categoryIdsRaw) : [];
  const isBestSeller = formData.get('isBestSeller') === 'on';
  const isDealOfTheDay = formData.get('isDealOfTheDay') === 'on';
  const discountLabel = formData.get('discountLabel') as string || undefined;

  const tagsRaw = formData.get('tags') as string;
  const tags = tagsRaw ? JSON.parse(tagsRaw) : [];

  const providedSlug = formData.get('slug') as string;

  if (!id || !title || !price || categoryIds.length === 0) {
    return { error: "ID, title, price and at least one category are required." };
  }

  let finalSlug = providedSlug;
  if (finalSlug) {
    finalSlug = finalSlug.toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        title,
        ...(finalSlug ? { slug: finalSlug } : {}),
        type,
        attributes,
        variations,
        shortDescription,
        description,
        price,
        compareAtPrice,
        stock,
        categories: {
          set: categoryIds.map((id: string) => ({ id }))
        },
        isBestSeller,
        isDealOfTheDay,
        discountLabel,
        tags,
        images: imageUrls,
      }
    });
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || "Error updating." };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Impossible de supprimer le produit." };
  }
}

export async function duplicateProduct(id: string) {
  try {
    const existing = await prisma.product.findUnique({ where: { id }, include: { categories: true } });
    if (!existing) return { error: "Produit introuvable." };

    const newTitle = existing.title + " (Copie)";
    let baseSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    await prisma.product.create({
      data: {
        title: newTitle,
        slug: uniqueSlug,
        type: existing.type,
        attributes: existing.attributes || undefined,
        variations: existing.variations || undefined,
        shortDescription: existing.shortDescription,
        description: existing.description,
        price: existing.price,
        compareAtPrice: existing.compareAtPrice,
        stock: existing.stock,
        categories: {
          connect: existing.categories.map((c: any) => ({ id: c.id }))
        },
        isBestSeller: existing.isBestSeller,
        isDealOfTheDay: existing.isDealOfTheDay,
        discountLabel: existing.discountLabel,
        tags: existing.tags,
        images: existing.images,
      }
    });
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Erreur lors de la duplication." };
  }
}

export async function quickEditProduct(id: string, data: { title: string, categoryIds: string[], slug: string, price: number, compareAtPrice: number | '' }) {
  try {
    await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        categories: {
          set: data.categoryIds.map(id => ({ id }))
        },
        slug: data.slug,
        price: data.price,
        compareAtPrice: data.compareAtPrice === '' ? null : data.compareAtPrice,
      }
    });
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Error during quick edit. Make sure the slug is unique." };
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
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { user: true }
    });

    try {
      if (status === 'SHIPPED' || status === 'CANCELLED' || status === 'DELIVERED') {
        const { sendOrderStatusUpdate } = await import('@/lib/mailer');
        if (updatedOrder.user?.email) {
          sendOrderStatusUpdate(updatedOrder, updatedOrder.user.email, status).catch(e => console.error('Status update email failed', e));
        }
      }
    } catch (e) {
      console.error('Failed to setup status update email', e);
    }

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    return { error: "Error updating status." };
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
  const type = formData.get('type') as any || 'PERCENTAGE';
  const value = parseFloat(formData.get('value') as string);
  const isActive = formData.get('isActive') === 'on';

  if (!code || isNaN(value)) {
    return { error: "Le code et la valeur sont obligatoires." };
  }

  try {
    await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        isActive
      }
    });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    return { error: "Error creating coupon (the code may already exist)." };
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
    return { error: "Error updating." };
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

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression de la commande." };
  }
}
