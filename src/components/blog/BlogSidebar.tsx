import Link from 'next/link';

export default function BlogSidebar({ 
  recentArticles, 
  recentComments 
}: { 
  recentArticles: any[], 
  recentComments: any[] 
}) {
  return (
    <div className="space-y-6">
      
      {/* Search */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <form action="/blog" method="GET" className="flex gap-2">
          <input 
            type="text" 
            name="q" 
            placeholder="Rechercher..." 
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
          />
          <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold transition">
            Rechercher
          </button>
        </form>
      </div>

      {/* Recent Articles */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Articles</h3>
        <ul className="space-y-4">
          {recentArticles.length === 0 ? (
            <li className="text-sm text-gray-500">No recent articles.</li>
          ) : (
            recentArticles.map(article => (
              <li key={article.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <Link href={`/blog/${article.slug}`} className="text-sm font-medium text-gray-700 hover:text-orange-600 transition leading-snug block">
                  {article.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Recent Comments */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Comments</h3>
        <ul className="space-y-4">
          {recentComments.length === 0 ? (
            <li className="text-sm text-gray-500 italic">No comments to display.</li>
          ) : (
            recentComments.map(comment => (
              <li key={comment.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{comment.author}</span> sur{' '}
                <Link href={`/blog/${comment.article.slug}`} className="text-orange-600 hover:underline">
                  {comment.article.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

    </div>
  );
}
