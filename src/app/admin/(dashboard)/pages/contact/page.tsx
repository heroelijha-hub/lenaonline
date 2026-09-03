'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getContactSettings, updateContactSettings } from '@/actions/contactSettings';
import { useTranslations } from 'next-intl';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function AdminContactPageForm() {
  const t = useTranslations('AdminPages');
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    text: '',
    address: '',
    phone: '',
    emailDisplay: '',
    formRecipient: '',
    bottomText: ''
  });

  useEffect(() => {
    getContactSettings().then((data) => {
      setFormData(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    const res = await updateContactSettings(formData);
    
    setSaving(false);
    if (res.success) {
      router.push('/admin/pages');
      router.refresh();
    } else {
      setError(res.error || t('save_error'));
    }
  };

  if (loading) return <div className="p-8 text-gray-500">{t('loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Modifier la page Contact
        </h1>
        <button
          onClick={() => router.push('/admin/pages')}
          className="text-gray-600 hover:text-gray-900 font-medium text-sm border border-gray-300 px-4 py-2 rounded-md bg-white hover:bg-gray-50 transition"
        >
          {t('back')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Textes de présentation</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre de la page</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 transition"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug de la page (URL)</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 transition"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
            />
            <p className="text-xs text-gray-500 mt-1">L'adresse de la page (ex: <i>contact</i> ou <i>kontakt</i>). Utilisez uniquement des minuscules et des tirets.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Texte principal (Paragraphes)</label>
            <textarea
              required
              rows={8}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 transition"
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">Vous pouvez faire des retours à la ligne pour séparer les paragraphes.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Informations de contact affichées</h2>
          <p className="text-xs text-gray-500 mb-4">Laissez un champ vide si vous ne souhaitez pas l'afficher sur la page de contact.</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse</label>
            <textarea
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 transition"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 transition"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail (Affiché au public)</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 transition"
              value={formData.emailDisplay}
              onChange={(e) => setFormData({...formData, emailDisplay: e.target.value})}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Réception des messages</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse E-mail de réception</label>
            <p className="text-xs text-gray-500 mb-2">C'est à cette adresse e-mail que les messages soumis via le formulaire de contact seront envoyés.</p>
            <input
              type="email"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500 transition"
              value={formData.formRecipient}
              onChange={(e) => setFormData({...formData, formRecipient: e.target.value})}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Texte Additionnel (Bas de page)</h2>
          <p className="text-xs text-gray-500 mb-2">Ce texte sera affiché en dessous du formulaire de contact et des informations de contact. Laissez vide pour ne rien afficher.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Texte du bas de page</label>
            <RichTextEditor 
              value={formData.bottomText}
              onChange={(val) => setFormData({...formData, bottomText: val})}
            />
            <p className="text-xs text-gray-500 mt-1">Éditeur de texte enrichi pour formater le contenu.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-8 rounded-md transition shadow-sm disabled:opacity-50"
          >
            {saving ? t('saving') : t('save_page')}
          </button>
        </div>
      </form>
    </div>
  );
}
