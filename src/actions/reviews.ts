'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth, requireAdmin } from '@/lib/auth';

// --- Client Actions ---

export async function submitReview(productId: string, rating: number, comment: string) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return { error: "You must be logged in to leave a review." };
  }

  if (rating < 1 || rating > 5) {
    return { error: "Rating must be between 1 and 5." };
  }

  try {
    await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating,
        comment,
        isApproved: false // Requires admin moderation by default
      }
    });

    revalidatePath(`/product/[slug]`, 'page');
    revalidatePath(`/account/reviews`);
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'avis:", error);
    return { error: "Une erreur s'est produite lors de l'enregistrement de votre avis." };
  }
}

// --- Admin Actions ---

export async function toggleReviewApproval(reviewId: string, isApproved: boolean) {
  await requireAdmin();

  await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved }
  });

  revalidatePath('/admin/reviews');
  revalidatePath(`/product/[slug]`, 'page');
}

export async function updateReview(reviewId: string, rating: number, comment: string, createdAtStr: string) {
  await requireAdmin();

  await prisma.review.update({
    where: { id: reviewId },
    data: { 
      rating, 
      comment,
      createdAt: new Date(createdAtStr)
    }
  });

  revalidatePath('/admin/reviews');
  revalidatePath(`/product/[slug]`, 'page');
}

export async function deleteReview(reviewId: string) {
  await requireAdmin();

  await prisma.review.delete({
    where: { id: reviewId }
  });

  revalidatePath('/admin/reviews');
  revalidatePath(`/product/[slug]`, 'page');
}
