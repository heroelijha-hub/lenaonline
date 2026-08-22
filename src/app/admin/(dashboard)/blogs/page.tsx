import Link from 'next/link';
import { getArticles } from '@/actions/blog';
import BlogTable from '@/components/admin/BlogTable';

export const dynamic = 'force-dynamic';

export default async function BlogsPage() {
  const articles = await getArticles();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du Blog</h1>
        <Link 
          href="/admin/blogs/create" 
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-md transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create un Article
        </Link>
      </div>

      <BlogTable initialArticles={articles} />
    </div>
  );
}
