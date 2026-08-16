'use client';

import { useState } from 'react';
import { addComment } from '@/actions/blog';

export default function CommentForm({ articleId }: { articleId: string }) {
  const [formData, setFormData] = useState({ author: '', email: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const res = await addComment(articleId, formData);
    if (res.success) {
      setMessage('Votre commentaire a été envoyé avec succès !');
      setFormData({ author: '', email: '', content: '' });
    } else {
      setMessage(res.error || 'Erreur lors de l\'envoi du commentaire.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 p-8 rounded-lg mt-12 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Écrire un avis</h3>
      <p className="text-sm text-gray-600 mb-6">Votre adresse e-mail ne sera pas publiée. Les champs obligatoires sont indiqués avec *</p>
      
      {message && (
        <div className={`p-4 rounded-md mb-6 ${message.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="sr-only">Comment *</label>
          <textarea 
            required
            rows={5}
            placeholder="Comment *"
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-orange-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="sr-only">Nom *</label>
            <input 
              type="text" 
              required
              placeholder="Nom *"
              value={formData.author}
              onChange={e => setFormData({ ...formData, author: e.target.value })}
              className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="sr-only">Email *</label>
            <input 
              type="email" 
              required
              placeholder="Email *"
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
          {loading ? 'Envoi...' : 'Laisser un commentaire'}
        </button>
      </form>
    </div>
  );
}
