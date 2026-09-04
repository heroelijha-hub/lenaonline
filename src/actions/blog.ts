'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
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
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined
      }
    });
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
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined
      }
    });
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
    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// COMMENTS
export async function addComment(articleId: string, data: any) {
  try {
    await prisma.articleComment.create({
      data: {
        articleId,
        author: data.author,
        email: data.email,
        content: data.content,
        isApproved: false // Requires admin moderation
      }
    });
    // Find the article to revalidate its page
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (article) {
      revalidatePath(`/blog/${article.slug}`);
    }
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getRecentComments(take = 5) {
  return await prisma.articleComment.findMany({
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      article: {
        select: { slug: true, title: true }
      }
    }
  });
}
