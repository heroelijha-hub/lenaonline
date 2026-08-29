'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getTrashedProducts() {
  await requireAdmin();
  return await prisma.product.findMany({
    where: { isDeleted: true },
    select: { id: true, title: true, images: true, deletedAt: true },
    orderBy: { deletedAt: 'desc' }
  });
}

export async function getTrashedMedia() {
  await requireAdmin();
  return await prisma.media.findMany({
    where: { isDeleted: true },
    orderBy: { deletedAt: 'desc' }
  });
}

export async function restoreProduct(id: string) {
  await requireAdmin();
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null }
    });

    // Also restore its images in the media library if they were deleted
    for (const url of product.images) {
      await prisma.media.updateMany({
        where: { url },
        data: { isDeleted: false, deletedAt: null }
      });
    }

    revalidatePath('/admin/products');
    revalidatePath('/admin/media');
    revalidatePath('/admin/trash');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error restoring product:', error);
    return { success: false, error: 'Erreur lors de la restauration du produit.' };
  }
}

export async function restoreMedia(id: string) {
  await requireAdmin();
  try {
    await prisma.media.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null }
    });
    revalidatePath('/admin/media');
    revalidatePath('/admin/trash');
    return { success: true };
  } catch (error: any) {
    console.error('Error restoring media:', error);
    return { success: false, error: 'Erreur lors de la restauration du média.' };
  }
}

export async function permanentlyDeleteProduct(id: string) {
  await requireAdmin();
  try {
    // We already removed relations (orderItems, reviews) when soft deleting.
    // If not, we should do it here just in case.
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.review.deleteMany({ where: { productId: id } });
    
    // We do NOT physically delete the image from Cloudinary here unless we know it's not used by ANY product
    // including trashed products. To be safe, we just delete the product from DB.
    await prisma.product.delete({ where: { id } });
    
    revalidatePath('/admin/trash');
    return { success: true };
  } catch (error: any) {
    console.error('Error permanently deleting product:', error);
    return { success: false, error: 'Erreur lors de la suppression définitive du produit.' };
  }
}

export async function permanentlyDeleteMedia(id: string) {
  await requireAdmin();
  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return { success: false, error: 'Média introuvable' };

    // Try to extract public_id from Cloudinary URL to delete it from Cloudinary
    // Format is usually: https://res.cloudinary.com/.../upload/v.../folder/filename.ext
    const urlParts = media.url.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    const folder = urlParts[urlParts.length - 2]; 
    
    // Assuming standard upload config without complex nested folders, just shopelios/media
    let publicId = filename;
    if (folder && folder !== 'upload' && !folder.startsWith('v')) {
       // if we have a folder structure
       const indexOfUpload = urlParts.indexOf('upload');
       if (indexOfUpload !== -1) {
         // skip upload and version
         const pathParts = urlParts.slice(indexOfUpload + 2);
         publicId = pathParts.join('/').split('.')[0];
       }
    }

    try {
      await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    } catch (e) {
      console.error('Cloudinary delete error:', e);
      // We proceed to delete from DB anyway
    }

    await prisma.media.delete({ where: { id } });
    revalidatePath('/admin/trash');
    return { success: true };
  } catch (error: any) {
    console.error('Error permanently deleting media:', error);
    return { success: false, error: 'Erreur lors de la suppression définitive du média.' };
  }
}

export async function emptyTrash() {
  await requireAdmin();
  try {
    // Empty products
    const products = await prisma.product.findMany({ where: { isDeleted: true } });
    for (const p of products) {
      await permanentlyDeleteProduct(p.id);
    }

    // Empty media
    const media = await prisma.media.findMany({ where: { isDeleted: true } });
    for (const m of media) {
      await permanentlyDeleteMedia(m.id);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error emptying trash:', error);
    return { success: false, error: 'Erreur lors du vidage de la corbeille.' };
  }
}
