import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountReviewsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex gap-8">
        
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Mon Espace</h2>
            <nav className="space-y-3">
              <Link href="/account" className="block text-gray-600 hover:text-orange-500">Tableau de bord</Link>
              <Link href="/account/orders" className="block text-gray-600 hover:text-orange-500">Mes Commandes</Link>
              <Link href="/account/reviews" className="block font-bold text-orange-500">Mes Reviews</Link>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Mes Reviews</h1>

          {reviews.length === 0 ? (
            <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-500">Vous n'avez pas encore laissé d'avis.</p>
              <Link href="/" className="inline-block mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700">Continuer mes achats</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        <Link href={`/product/${review.product.slug}`} className="hover:text-orange-500">
                          {review.product.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-orange-500">
                          {[1,2,3,4,5].map(i => (
                            <span key={i} className={i <= review.rating ? '' : 'text-gray-300'}>★</span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          - {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.isApproved ? 'Approuvé' : 'En attente de modération'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
