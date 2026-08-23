import Link from 'next/link';
import { getPages, deletePage } from '@/actions/pages';

export const dynamic = 'force-dynamic';

export default async function AdminPagesList() {
  const { data: pages, success, error } = await getPages();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Custom Pages</h1>
        <Link 
          href="/admin/pages/new" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition"
        >
          Create a page
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
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Title</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">URL / Slug</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Actions</th>
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
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link href={`/${page.slug}`} target="_blank" className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                      Voir
                    </Link>
                    <Link href={`/admin/pages/${page.id}`} className="text-orange-600 hover:text-orange-900 font-medium text-sm">
                      Edit
                    </Link>
                    <form action={async () => {
                      'use server';
                      await deletePage(page.id);
                    }} className="inline-block">
                      <button type="submit" className="text-red-600 hover:text-red-900 font-medium text-sm">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No page found. Click "Create a page" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
