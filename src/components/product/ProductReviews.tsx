'use client';

import { useState } from 'react';
import { submitReview } from '@/actions/reviews';

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: {
    email: string;
  };
};

type ProductReviewsProps = {
  productId: string;
  reviews: Review[];
  description?: string | null;
  isLoggedIn: boolean;
};

const Star = ({ filled = true }: { filled?: boolean }) => (
  <svg 
    className={`w-4 h-4 ${filled ? 'text-orange-500' : 'text-gray-300'}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function ProductReviews({ productId, reviews, description, isLoggedIn }: ProductReviewsProps) {
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    const res = await submitReview(productId, rating, comment);
    
    if (res.error) {
      setMsg({ type: 'error', text: res.error });
    } else {
      setMsg({ type: 'success', text: 'Votre avis a été soumis et est en attente de modération.' });
      setComment('');
      setRating(5);
    }
    setLoading(false);
  };

  return (
    <div className="mt-20">
      <div className="flex justify-center border-b border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab('desc')}
          className={`px-8 py-4 text-sm font-bold ${activeTab === 'desc' ? 'text-gray-900 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Description
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`px-8 py-4 text-sm font-bold ${activeTab === 'reviews' ? 'text-gray-900 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Avis ({reviews.length})
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {activeTab === 'desc' ? (
          <div className="text-sm text-gray-700 leading-relaxed space-y-6">
            {description ? (
              <div 
                className="prose prose-sm max-w-none" 
                dangerouslySetInnerHTML={{ __html: description }} 
              />
            ) : (
              <div className="whitespace-pre-wrap">Aucune description détaillée.</div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Liste des avis */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-gray-900">Avis Clients</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">Il n'y a pas encore d'avis pour ce produit.</p>
              ) : (
                <div className="space-y-8">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1,2,3,4,5].map(i => <Star key={i} filled={i <= review.rating} />)}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{review.user.email.split('@')[0]}</span>
                        <span className="text-xs text-gray-500">- {new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulaire d'avis */}
            <div className="bg-gray-50 p-6 md:p-8 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Ajouter un avis</h3>
              
              {!isLoggedIn ? (
                <p className="text-sm text-gray-600">Vous devez être connecté pour laisser un avis. <a href="/login" className="text-orange-500 hover:underline">Se connecter</a></p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {msg.text && (
                    <div className={`p-3 rounded text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {msg.text}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Votre note *</label>
                    <select 
                      value={rating} 
                      onChange={e => setRating(Number(e.target.value))}
                      className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm"
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Très bien</option>
                      <option value="3">3 - Moyen</option>
                      <option value="2">2 - Pas terrible</option>
                      <option value="1">1 - Mauvais</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Votre avis *</label>
                    <textarea 
                      required
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500 text-sm"
                      placeholder="Qu'avez-vous pensé de ce produit ?"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-orange-600 text-white font-bold py-2 px-6 rounded hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    {loading ? 'Envoi...' : 'Soumettre'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
