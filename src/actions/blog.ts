'use server';

import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

// ARTICLES
export async function getArticles(publishedOnly = false) {
  return await prisma.article.findMany({
    where: publishedOnly ? { isPublished: true } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { comments: true }
      }
    }
  });
}

export async function getDistinctBlogCategories(): Promise<string[]> {
  const articles = await prisma.article.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' }
  });
  return articles.map(a => a.category).filter(Boolean) as string[];
}

export async function getDistinctBlogAuthors(): Promise<string[]> {
  const articles = await prisma.article.findMany({
    where: { authorName: { not: null } },
    select: { authorName: true },
    distinct: ['authorName'],
    orderBy: { authorName: 'asc' }
  });
  return articles.map(a => a.authorName).filter(Boolean) as string[];
}

export async function getArticleBySlug(slug: string) {
  return await prisma.article.findUnique({
    where: { slug },
    include: {
      comments: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function getArticleById(id: string) {
  await requireAdmin();
  return await prisma.article.findUnique({
    where: { id }
  });
}

export async function createArticle(data: any) {
  await requireAdmin();
  try {
    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        image: data.image,
        category: data.category,
        authorName: data.authorName,
        isPublished: data.isPublished,
        tags: data.tags || [],
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null
      }
    });
    revalidateTag('articles');
    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    return { success: true, article };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateArticle(id: string, data: any) {
  await requireAdmin();
  try {
    const article = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        image: data.image,
        category: data.category,
        authorName: data.authorName,
        isPublished: data.isPublished,
        tags: data.tags || [],
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null
      }
    });
    revalidateTag('articles');
    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    revalidatePath(`/blog/${article.slug}`);
    return { success: true, article };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  try {
    await prisma.article.delete({
      where: { id }
    });
    revalidateTag('articles');
    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function quickEditArticle(id: string, data: { title: string, slug: string, category: string, isPublished: boolean, createdAt: string }) {
  await requireAdmin();
  try {
    const article = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        isPublished: data.isPublished,
        createdAt: new Date(data.createdAt),
      }
    });
    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    revalidatePath(`/blog/${article.slug}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: "Erreur lors de la modification rapide. Vérifiez que le slug est unique." };
  }
}

// COMMENTS
export async function addComment(articleId: string, data: any) {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!articleId || !uuidRegex.test(articleId)) {
      return { error: 'Invalid article identifier.' };
    }

    const author = (data?.author || '').trim();
    const content = (data?.content || '').trim();
    const email = (data?.email || '').trim();

    if (!author || author.length > 100) {
      return { error: 'Author name must be between 1 and 100 characters.' };
    }
    if (!content || content.length > 3000) {
      return { error: 'Comment content must be between 1 and 3000 characters.' };
    }
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 254) {
        return { error: 'Invalid email address.' };
      }
    }

    // Verify article exists and is published
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, slug: true, isPublished: true },
    });
    if (!article || !article.isPublished) {
      return { error: 'Article not found.' };
    }

    await prisma.articleComment.create({
      data: {
        articleId,
        author,
        email: email || null,
        content,
        isApproved: false // Requires admin moderation
      }
    });

    revalidatePath(`/blog/${article.slug}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getRecentComments(take = 5) {
  const limit = Math.min(Math.max(1, take), 20);
  return await prisma.articleComment.findMany({
    where: { isApproved: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      author: true,
      content: true,
      createdAt: true,
      article: {
        select: { slug: true, title: true }
      }
    }
  });
}
