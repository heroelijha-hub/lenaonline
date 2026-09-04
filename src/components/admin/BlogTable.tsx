'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteArticle } from '@/actions/blog';
import { useTranslations, useLocale } from 'next-intl';

export default function BlogTable({ initialArticles }: { initialArticles: any[] }) {
  const t = useTranslations('AdminBlogs');
  const locale = useLocale();
  const [articles, setArticles] = useState(initialArticles);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    
    setLoadingId(id);
    const res = await deleteArticle(id);
    setLoadingId(null);
    
    if (res.success) {
      setArticles(articles.filter(a => a.id !== id));
    } else {
      alert(res.error || t('delete_error'));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-800 font-semibold">
          <tr>
            <th className="px-6 py-4">{t('col_article')}</th>
            <th className="px-6 py-4">{t('col_category')}</th>
            <th className="px-6 py-4">{t('col_status')}</th>
            <th className="px-6 py-4">{t('col_date')}</th>
            <th className="px-6 py-4 text-right">{t('col_actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {articles.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                {t('no_articles')}
              </td>
            </tr>
          ) : (
            articles.map(article => (
              <tr key={article.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {article.image ? (
                      <img src={article.image} alt={article.title} className="w-10 h-10 object-cover rounded border" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{article.title}</div>
                      <div className="text-xs text-gray-500">/{article.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{article.category || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${article.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {article.isPublished ? t('published') : t('draft')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(article.createdAt).toLocaleDateString(locale)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link 
                      href={`/admin/blogs/edit/${article.id}`}
                      className="text-orange-600 hover:text-orange-800 font-medium transition"
                      title={t('edit')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Link>
                    <button 
                      onClick={() => handleDelete(article.id)}
                      disabled={loadingId === article.id}
                      className="text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition"
                      title={t('delete')}
                    >
                      {loadingId === article.id ? '...' : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
