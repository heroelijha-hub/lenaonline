'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteArticle } from '@/actions/blog';

export default function BlogTable({ initialArticles }: { initialArticles: any[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
    setLoadingId(id);
    const res = await deleteArticle(id);
    setLoadingId(null);
    
    if (res.success) {
      setArticles(articles.filter(a => a.id !== id));
    } else {
      alert(res.error || "Erreur lors de la suppression.");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-800 font-semibold">
          <tr>
            <th className="px-6 py-4">Article</th>
            <th className="px-6 py-4">Catégorie</th>
            <th className="px-6 py-4">Statut</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {articles.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                Aucun article trouvé.
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
                    {article.isPublished ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/admin/blogs/edit/${article.id}`}
                    className="text-orange-600 hover:text-orange-800 font-medium mr-4"
                  >
                    Modifier
                  </Link>
                  <button 
                    onClick={() => handleDelete(article.id)}
                    disabled={loadingId === article.id}
                    className="text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    {loadingId === article.id ? '...' : 'Supprimer'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
