'use client';

import { useState } from 'react';
import { addComment } from '@/actions/blog';
import { useTranslations } from 'next-intl';

export default function CommentForm({ articleId }: { articleId: string }) {
  const [formData, setFormData] = useState({ author: '', email: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const t = useTranslations('Blog');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await addComment(articleId, formData);
    if (res.success) {
      setMessage(t('comment_success'));
      setFormData({ author: '', email: '', content: '' });
    } else {
      setMessage(res.error || t('comment_error'));
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 p-8 rounded-lg mt-12 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('write_review')}</h3>
      <p className="text-sm text-gray-600 mb-6">{t('review_desc')}</p>
      
      {message && (
        <div className={`p-4 rounded-md mb-6 ${message.includes(t('comment_success').slice(0, 10)) || message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="sr-only">{t('comment_placeholder')}</label>
          <textarea 
            required
            rows={5}
            placeholder={t('comment_placeholder')}
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-orange-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="sr-only">{t('name_placeholder')}</label>
            <input 
              type="text" 
              required
              placeholder={t('name_placeholder')}
              value={formData.author}
              onChange={e => setFormData({ ...formData, author: e.target.value })}
              className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="sr-only">{t('email_placeholder')}</label>
            <input 
              type="email" 
              required
              placeholder={t('email_placeholder')}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded transition disabled:opacity-50 mt-4"
        >
          {loading ? t('submitting') : t('submit_comment')}
        </button>
      </form>
    </div>
  );
}
