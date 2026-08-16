'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  return await prisma.user.findUnique({
    where: { id: authUser.id }
  });
}

// --- Client Actions ---

export async function submitReview(productId: string, rating: number, comment: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Vous devez être connecté pour laisser un avis." };
  }

  if (rating < 1 || rating > 5) {
    return { error: "La note doit être comprise entre 1 et 5." };
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
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error("Non autorisé.");
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved }
  });

  revalidatePath('/admin/reviews');
  revalidatePath(`/product/[slug]`, 'page');
}

export async function updateReview(reviewId: string, rating: number, comment: string, createdAtStr: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error("Non autorisé.");
  }

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
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error("Non autorisé.");
  }

  await prisma.review.delete({
    where: { id: reviewId }
  });

  revalidatePath('/admin/reviews');
  revalidatePath(`/product/[slug]`, 'page');
}
