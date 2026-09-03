'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createArticle, updateArticle } from '@/actions/blog';
import { uploadImage } from '@/actions/admin';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useTranslations } from 'next-intl';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type BlogFormProps = {
  article?: any;
  existingCategories?: string[];
  existingAuthors?: string[];
};

export default function BlogForm({ article, existingCategories = [], existingAuthors = [] }: BlogFormProps) {
  const t = useTranslations('AdminBlogs');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    content: article?.content || '',
    excerpt: article?.excerpt || '',
    category: article?.category || '',
    authorName: article?.authorName || '',
    image: article?.image || '',
    tags: article?.tags?.join(', ') || '',
    isPublished: article ? article.isPublished : true,
  });

  const generateSlug = (text: string) => 
    text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      ...(!article ? { slug: generateSlug(newTitle) } : {})
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      setLoading(true);
      const data = new FormData();
      data.append('file', e.target.files[0]);
      const url = await uploadImage(data);
      if (url) setFormData({ ...formData, image: url });
    } catch (err) {
      console.error(err);
      setError(t('upload_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    };

    const res = article 
      ? await updateArticle(article.id, payload)
      : await createArticle(payload);
      
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/admin/blogs');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('title_label')}</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={handleTitleChange}
                required
                className="w-full border px-4 py-2 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('slug_label')}</label>
              <input 
                type="text" 
                value={formData.slug} 
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                required
                className="w-full border px-4 py-2 rounded text-sm"
                placeholder={t('slug_placeholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('excerpt_label')}</label>
              <textarea 
                value={formData.excerpt} 
                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full border px-4 py-2 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('content_label')}</label>
              <div className="bg-white">
                <ReactQuill 
                  theme="snow" 
                  value={formData.content} 
                  onChange={(content: string) => setFormData({ ...formData, content })} 
                  className="h-96 mb-12"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-800">{t('organization_title')}</h3>
            
            <div className="flex items-center gap-2 mb-4">
              <input 
                type="checkbox" 
                id="isPublished"
                checked={formData.isPublished}
                onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                {t('published_checkbox')}
              </label>
            </div>

            {/* Category with suggestions */}
            <div>
              <label className="block text-sm font-medium mb-1">{t('category_label')}</label>
              <input 
                type="text" 
                value={formData.category} 
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full border px-3 py-2 rounded text-sm"
                placeholder={t('category_placeholder')}
              />
              {existingCategories.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1.5">Catégories existantes :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {existingCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                          formData.category === cat
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('keywords_label')}</label>
              <input 
                type="text" 
                value={formData.tags} 
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                className="w-full border px-3 py-2 rounded text-sm"
                placeholder={t('keywords_placeholder')}
              />
            </div>

            {/* Author with suggestions */}
            <div>
              <label className="block text-sm font-medium mb-1">{t('author_label')}</label>
              <input 
                type="text" 
                value={formData.authorName} 
                onChange={e => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full border px-3 py-2 rounded text-sm"
              />
              {existingAuthors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1.5">Auteurs existants :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {existingAuthors.map((author) => (
                      <button
                        key={author}
                        type="button"
                        onClick={() => setFormData({ ...formData, authorName: author })}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer flex items-center gap-1.5 ${
                          formData.authorName === author
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-current opacity-20 inline-block" />
                        {author}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">{t('cover_image')}</h3>
            {formData.image && (
              <img src={formData.image} alt="Cover" className="w-full h-auto rounded mb-3 border" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              disabled={loading}
              className="text-sm w-full" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? t('saving') : (article ? t('update') : t('publish'))}
          </button>
        </div>
      </div>
    </form>
  );
}


