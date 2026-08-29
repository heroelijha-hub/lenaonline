'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- CLOUDINARY UPLOAD ---
export async function uploadImage(formData: FormData) {
  await requireAdmin();
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

// --- BRANDS ---
export async function getBrands() {
  await requireAdmin();
  return await prisma.brand.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createBrandAction(formData: FormData, logoUrl?: string) {
  await requireAdmin();
  const name = formData.get('name') as string;
  if (!name) return { error: "Nom requis" };
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  try {
    const brand = await prisma.brand.create({ data: { name, slug, logo: logoUrl || null } });
    revalidatePath('/admin/products');
    return { success: true, brand };
  } catch (error) {
    return { error: "Erreur de création de marque" };
  }
}

export async function updateBrand(id: string, formData: FormData, logoUrl?: string | null) {
  await requireAdmin();
  const name = formData.get('name') as string;
  let slug = formData.get('slug') as string;
  if (!name) return { error: "Nom requis" };
  slug = slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  try {
    const data: any = { name, slug };
    if (logoUrl !== undefined) data.logo = logoUrl;
    await prisma.brand.update({ where: { id }, data });
    revalidatePath('/admin/brands');
    return { success: true };
  } catch (error) {
    return { error: "Erreur de modification" };
  }
}

export async function deleteBrand(id: string) {
  await requireAdmin();
  try {
    await prisma.brand.delete({ where: { id } });
    revalidatePath('/admin/brands');
    return { success: true };
  } catch (error) {
    return { error: "Impossible de supprimer cette marque." };
  }
}

export async function bulkDeleteBrands(ids: string[]) {
  await requireAdmin();
  try {
    await prisma.brand.deleteMany({ where: { id: { in: ids } } });
    revalidatePath('/admin/brands');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression." };
  }
}

// --- TAGS ---
export async function getTags() {
  await requireAdmin();
  return await prisma.tag.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createTag(formData: FormData) {
  await requireAdmin();
  const name = formData.get('name') as string;
  let slug = formData.get('slug') as string;
  if (!name) return { error: "Nom requis" };
  slug = slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  try {
    await prisma.tag.create({ data: { name, slug } });
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    return { error: "Erreur de création" };
  }
}

export async function updateTag(id: string, name: string, slug: string) {
  await requireAdmin();
  if (!name) return { error: "Nom requis" };
  const finalSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  try {
    await prisma.tag.update({ where: { id }, data: { name, slug: finalSlug } });
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    return { error: "Erreur de modification" };
  }
}

export async function deleteTag(id: string) {
  await requireAdmin();
  try {
    await prisma.tag.delete({ where: { id } });
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    return { error: "Impossible de supprimer ce tag." };
  }
}

export async function bulkDeleteTags(ids: string[]) {
  await requireAdmin();
  try {
    await prisma.tag.deleteMany({ where: { id: { in: ids } } });
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    return { error: "Erreur de suppression." };
  }
}

// --- CATEGORIES ---
export async function getCategories() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    include: { parent: true, children: true },
    orderBy: { name: 'asc' }
  });

  const formatHierarchical = (cats: any[], parentId: string | null = null, depth = 0): any[] => {
    let result: any[] = [];
    const children = cats.filter(c => (c.parentId || null) === parentId);
    
    for (const child of children) {
      result.push({
        ...child,
        depth,
        displayName: '— '.repeat(depth) + child.name
      });
      result = result.concat(formatHierarchical(cats, child.id, depth + 1));
    }
    return result;
  };

  return formatHierarchical(categories);
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    return { error: "Error: This category may contain products." };
  }
}

export async function bulkDeleteCategories(ids: string[]) {
  await requireAdmin();
  try {
    await prisma.category.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
    revalidatePath('/admin/categories');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    const t = await getTranslations('AdminCategories');
    return { error: t('bulk_delete_error') };
  }
}

// --- PRODUCTS ---
export async function getProducts() {
  await requireAdmin();
  return await prisma.product.findMany({
    where: { isDeleted: false },
    include: { categories: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getMinimalProducts() {
  await requireAdmin();
  return await prisma.product.findMany({
    where: { isDeleted: false },
    select: { id: true, title: true, images: true },
    orderBy: { title: 'asc' }
  });
}

export async function createProduct(formData: FormData, imageUrls: string[]) {
  await requireAdmin();
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

  const brandId = formData.get('brandId') as string || null;

  const categoryIdsRaw = formData.get('categoryIds') as string;
  const categoryIds = categoryIdsRaw ? JSON.parse(categoryIdsRaw) : [];
  const isBestSeller = formData.get('isBestSeller') === 'on';
  const isDealOfTheDay = formData.get('isDealOfTheDay') === 'on';
  const discountLabel = formData.get('discountLabel') as string || undefined;
  
  const forceSalesRaw = formData.get('forceSalesIds') as string;
  const forceSalesIds = forceSalesRaw ? JSON.parse(forceSalesRaw) : [];
  
  const saleTogetherRaw = formData.get('saleTogetherIds') as string;
  const saleTogetherIds = saleTogetherRaw ? JSON.parse(saleTogetherRaw) : [];
  
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
        brandId,
        attributes: attributes.length > 0 ? attributes : undefined,
        variations: variations.length > 0 ? variations : undefined,
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
        tags: {
          connectOrCreate: tags.map((t: string) => ({
            where: { name: t },
            create: { name: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
          }))
        },
        images: imageUrls,
        forceSales: {
          connect: forceSalesIds.map((id: string) => ({ id }))
        },
        saleTogether: {
          connect: saleTogetherIds.map((id: string) => ({ id }))
        },
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

export async function updateProduct(id: string, formData: FormData, imageUrls: string[]) {
  await requireAdmin();
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

  const brandId = formData.get('brandId') as string || null;

  const categoryIdsRaw = formData.get('categoryIds') as string;
  const categoryIds = categoryIdsRaw ? JSON.parse(categoryIdsRaw) : [];
  const isBestSeller = formData.get('isBestSeller') === 'on';
  const isDealOfTheDay = formData.get('isDealOfTheDay') === 'on';
  const discountLabel = formData.get('discountLabel') as string || undefined;

  const forceSalesRaw = formData.get('forceSalesIds') as string;
  const forceSalesIds = forceSalesRaw ? JSON.parse(forceSalesRaw) : [];
  
  const saleTogetherRaw = formData.get('saleTogetherIds') as string;
  const saleTogetherIds = saleTogetherRaw ? JSON.parse(saleTogetherRaw) : [];

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
        brandId,
        attributes: attributes.length > 0 ? attributes : undefined,
        variations: variations.length > 0 ? variations : undefined,
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
        tags: {
          set: [],
          connectOrCreate: tags.map((t: string) => ({
            where: { name: t },
            create: { name: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
          }))
        },
        images: imageUrls,
        forceSales: {
          set: forceSalesIds.map((id: string) => ({ id }))
        },
        saleTogether: {
          set: saleTogetherIds.map((id: string) => ({ id }))
        },
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
  await requireAdmin();
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return { error: "Product not found" };

    // Soft delete the product
    await prisma.product.update({ 
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    // Handle exclusive media
    for (const imageUrl of product.images) {
       const isUsedElsewhere = await prisma.product.findFirst({
         where: {
           isDeleted: false,
           id: { not: id },
           images: { has: imageUrl }
         }
       });
       if (!isUsedElsewhere) {
         await prisma.media.updateMany({
           where: { url: imageUrl, isDeleted: false },
           data: { isDeleted: true, deletedAt: new Date() }
         });
       }
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    const { getTranslations } = await import('next-intl/server');
    const t = await getTranslations('AdminProducts');
    return { error: t('delete_error') };
  }
}

export async function bulkDeleteProducts(ids: string[]) {
  await requireAdmin();
  try {
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });
    
    // Soft delete the products
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    // Handle exclusive media
    for (const product of products) {
      for (const imageUrl of product.images) {
        const isUsedElsewhere = await prisma.product.findFirst({
          where: {
            isDeleted: false,
            id: { notIn: ids },
            images: { has: imageUrl }
          }
        });
        if (!isUsedElsewhere) {
          await prisma.media.updateMany({
            where: { url: imageUrl, isDeleted: false },
            data: { isDeleted: true, deletedAt: new Date() }
          });
        }
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    const { getTranslations } = await import('next-intl/server');
    const t = await getTranslations('AdminProducts');
    return { error: t('bulk_delete_error') };
  }
}

export async function duplicateProduct(id: string) {
  await requireAdmin();
  try {
    const existing = await prisma.product.findUnique({ where: { id }, include: { categories: true, tags: true } });
    if (!existing) return { error: "Produit introuvable." };

    const newTitle = existing.title + " (Copie)";
    let baseSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    await prisma.product.create({
      data: {
        title: newTitle,
        slug: uniqueSlug,
        brandId: existing.brandId,
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
        tags: {
          connect: existing.tags.map((t: any) => ({ id: t.id }))
        },
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
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  return await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createCoupon(formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression." };
  }
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    return { error: "Erreur lors de la suppression de la commande." };
  }
}

// --- ABANDONED CARTS ---
export async function getAbandonedCarts() {
  await requireAdmin();
  return await prisma.abandonedCart.findMany({
    orderBy: { lastActive: 'desc' }
  });
}

export async function sendRecoveryEmail(id: string) {
  await requireAdmin();
  try {
    const cart = await prisma.abandonedCart.findUnique({ where: { id } });
    if (!cart) return { error: "Panier introuvable." };
    if (!cart.email) return { error: "Email non fourni pour ce panier." };

    const { sendAbandonedCartRecoveryEmail } = await import('@/lib/mailer');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopelios.com';
    const checkoutUrl = `${baseUrl}/checkout`;

    const name = cart.firstName ? `${cart.firstName} ${cart.lastName || ''}`.trim() : '';
    
    await sendAbandonedCartRecoveryEmail(cart, cart.email, name, checkoutUrl);
    
    // We update the lastActive to prevent spamming too fast
    await prisma.abandonedCart.update({
      where: { id },
      data: { lastActive: new Date() }
    });

    revalidatePath('/admin/abandoned-carts');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erreur lors de l'envoi de l'email de relance." };
  }
}
