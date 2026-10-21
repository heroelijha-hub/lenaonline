import BlogForm from '@/components/admin/BlogForm';
import Link from 'next/link';
import { getArticleById, getDistinctBlogCategories, getDistinctBlogAuthors } from '@/actions/blog';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('AdminBlogs');
  const { id } = await params;
  const [article, categories, authors] = await Promise.all([
    getArticleById(id),
    getDistinctBlogCategories(),
    getDistinctBlogAuthors(),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs" className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('edit_article')}</h1>
      </div>

      <BlogForm article={article} existingCategories={categories} existingAuthors={authors} />
    </div>
  );
}
