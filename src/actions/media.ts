'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getMediaList(page = 1, limit = 20, search = '') {
  await requireAdmin();
  const skip = (page - 1) * limit;

  const where: any = search
    ? {
        isDeleted: false,
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { altText: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : { isDeleted: false };

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  return { items, total, totalPages: Math.ceil(total / limit) };
}

export async function getMediaByUrl(url: string) {
  return await prisma.media.findUnique({
    where: { url },
  });
}

export async function updateMediaAction(id: string, data: { title?: string; altText?: string; description?: string; legend?: string; link?: string }) {
  await requireAdmin();
  
  try {
    const updated = await prisma.media.update({
      where: { id },
      data,
    });
    revalidatePath('/admin/media');
    return { success: true, media: updated };
  } catch (error: any) {
    console.error('Error updating media:', error);
    return { success: false, error: 'Erreur lors de la mise à jour du média' };
  }
}

export async function deleteMediaAction(id: string) {
  await requireAdmin();
  
  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return { success: false, error: 'Média introuvable' };

    await prisma.media.update({ 
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
    revalidatePath('/admin/media');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return { success: false, error: 'Erreur lors de la suppression du média' };
  }
}

export async function deleteMultipleMediaAction(ids: string[]) {
  await requireAdmin();
  
  try {
    await prisma.media.updateMany({ 
      where: { id: { in: ids } },
      data: { isDeleted: true, deletedAt: new Date() }
    });
    revalidatePath('/admin/media');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting multiple media:', error);
    return { success: false, error: 'Erreur lors de la suppression des médias' };
  }
}

export async function uploadMediaAction(formData: FormData) {
  await requireAdmin();
  
  try {
    const file = formData.get('file') as File;
    if (!file) return { error: 'Aucun fichier fourni' };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const secureUrl = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'shopelios/media' },
        (error, result) => {
          if (error || !result) reject(error);
          else resolve(result.secure_url);
        }
      ).end(buffer);
    });

    // Create media entry
    const media = await prisma.media.create({
      data: {
        url: secureUrl,
        title: file.name,
      }
    });

    revalidatePath('/admin/media');
    return { success: true, url: secureUrl, media };
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return { error: 'Erreur lors de l\'upload' };
  }
}
