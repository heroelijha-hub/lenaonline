import Link from 'next/link';
import BlogTable from '@/components/admin/BlogTable';
import AdminPagination from '@/components/admin/AdminPagination';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function BlogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const t = await getTranslations('AdminBlogs');
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { comments: true }
        }
      }
    }),
    prisma.article.count()
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('manage_blogs')}</h1>
        <Link 
          href="/admin/blogs/create" 
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-md transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t('create_article')}
        </Link>
      </div>

      <BlogTable initialArticles={articles as any} />
      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
