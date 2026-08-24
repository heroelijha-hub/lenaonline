import Link from 'next/link';
import { deletePage } from '@/actions/pages';
import AdminPagination from '@/components/admin/AdminPagination';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPagesList({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const t = await getTranslations('AdminPages');
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  let pages: any[] = [];
  let total = 0;
  let error = null;
  let success = false;
  try {
    const [fetchedPages, pagesCount] = await Promise.all([
      prisma.page.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.page.count()
    ]);
    pages = fetchedPages;
    total = pagesCount;
    success = true;
  } catch (err: any) {
    error = err.message || "Failed to load pages";
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('manage_pages')}</h1>
        <Link 
          href="/admin/pages/new" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition"
        >
          {t('create_page')}
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          Error: {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">{t('col_title')}</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">{t('col_slug')}</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">{t('col_status')}</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">{t('col_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {success && pages && pages.length > 0 ? (
              pages.map((page: any) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{page.title}</td>
                  <td className="px-6 py-4 text-gray-500">/{page.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      page.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.isPublished ? t('published') : t('draft')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link href={`/${page.slug}`} target="_blank" className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                      {t('view')}
                    </Link>
                    <Link href={`/admin/pages/${page.id}`} className="text-orange-600 hover:text-orange-900 font-medium text-sm">
                      {t('edit')}
                    </Link>
                    <form action={async () => {
                      'use server';
                      await deletePage(page.id);
                    }} className="inline-block">
                      <button type="submit" className="text-red-600 hover:text-red-900 font-medium text-sm">
                        {t('delete')}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  {t('no_pages')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {success && totalPages > 1 && (
        <AdminPagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}
