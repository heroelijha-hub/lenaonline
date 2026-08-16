import BlogForm from '@/components/admin/BlogForm';
import Link from 'next/link';
import { getArticleById } from '@/actions/blog';
import { notFound } from 'next/navigation';

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const article = await getArticleById(params.id);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs" className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier l'Article</h1>
      </div>

      <BlogForm article={article} />
    </div>
  );
}
