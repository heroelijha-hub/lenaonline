'use client';

import { useState } from 'react';
import { toggleReviewApproval, deleteReview, updateReview } from '@/actions/reviews';
import { useTranslations, useLocale } from 'next-intl';

type Review = {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
  product: { title: string; slug: string };
  user: { email: string };
};

export default function ReviewTable({ reviews }: { reviews: Review[] }) {
  const t = useTranslations('AdminReviews');
  const locale = useLocale();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '', createdAtStr: '' });

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleReviewApproval(id, !currentStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm_delete'))) {
      await deleteReview(id);
    }
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment,
      // Format datetime-local requires YYYY-MM-DDThh:mm
      createdAtStr: new Date(review.createdAt).toISOString().slice(0, 16)
    });
  };

  const handleSave = async (id: string) => {
    await updateReview(id, editForm.rating, editForm.comment, editForm.createdAtStr);
    setEditingId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">{t('col_product')}</th>
            <th className="px-6 py-3">{t('col_customer')}</th>
            <th className="px-6 py-3">{t('col_rating_comment')}</th>
            <th className="px-6 py-3">{t('col_date')}</th>
            <th className="px-6 py-3">{t('col_status')}</th>
            <th className="px-6 py-3 text-right">{t('col_actions')}</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                {review.product.title}
              </td>
              <td className="px-6 py-4">
                {review.user.email}
              </td>
              <td className="px-6 py-4 min-w-[300px]">
                {editingId === review.id ? (
                  <div className="space-y-2">
                    <select 
                      value={editForm.rating} 
                      onChange={e => setEditForm({...editForm, rating: Number(e.target.value)})}
                      className="border rounded p-1 w-20 text-sm"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}★</option>)}
                    </select>
                    <textarea 
                      value={editForm.comment}
                      onChange={e => setEditForm({...editForm, comment: e.target.value})}
                      className="w-full border rounded p-2 text-sm"
                      rows={3}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="font-bold text-orange-500">{review.rating} ★</div>
                    <div className="text-gray-700 line-clamp-2">{review.comment}</div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                {editingId === review.id ? (
                  <input 
                    type="datetime-local" 
                    value={editForm.createdAtStr}
                    onChange={e => setEditForm({...editForm, createdAtStr: e.target.value})}
                    className="border rounded p-1 text-sm"
                  />
                ) : (
                  new Date(review.createdAt).toLocaleDateString(locale)
                )}
              </td>
              <td className="px-6 py-4">
                <button 
                  onClick={() => handleToggle(review.id, review.isApproved)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {review.isApproved ? t('approved') : t('pending')}
                </button>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {editingId === review.id ? (
                  <>
                    <button onClick={() => handleSave(review.id)} className="text-green-600 font-bold hover:underline">{t('save')}</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">{t('cancel')}</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(review)} className="text-blue-600 font-bold hover:underline">{t('edit')}</button>
                    <button onClick={() => handleDelete(review.id)} className="text-red-600 font-bold hover:underline">{t('delete')}</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {reviews.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-gray-500">{t('no_reviews')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
