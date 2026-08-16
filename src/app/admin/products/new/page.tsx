'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, createProduct, uploadImage } from '@/actions/admin';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      let uploadedUrl = '';
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        const url = await uploadImage(imageFormData);
        if (url) uploadedUrl = url;
      }

      const imageUrls = uploadedUrl ? [uploadedUrl] : [];
      
      const res = await createProduct(formData, imageUrls);
      
      if (res.error) {
        alert(res.error);
      } else {
        router.push('/admin/products');
      }
    } catch (err) {
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Ajouter un Nouveau Produit</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Titre & Catégorie */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du produit *</label>
            <input type="text" name="title" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select name="categoryId" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">
              <option value="">Sélectionnez une catégorie...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Prix & Stock */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix ($) *</label>
            <input type="number" step="0.01" name="price" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix barré ($)</label>
            <input type="number" step="0.01" name="compareAtPrice" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
            <input type="number" name="stock" defaultValue={10} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
        </div>

        {/* Image Upload (Cloudinary) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image du Produit (Cloudinary)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" 
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"></textarea>
        </div>

        {/* Flags / Labels */}
        <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="flex items-center">
            <input type="checkbox" name="isBestSeller" id="isBestSeller" className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
            <label htmlFor="isBestSeller" className="ml-2 block text-sm text-gray-900">Mettre en "Best Seller"</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isDealOfTheDay" id="isDealOfTheDay" className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
            <label htmlFor="isDealOfTheDay" className="ml-2 block text-sm text-gray-900">Mettre en "Deal of the Day"</label>
          </div>
          <div>
            <input type="text" name="discountLabel" placeholder="Label (ex: -14%)" className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-end">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium mr-4 hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition disabled:opacity-50"
          >
            {isLoading ? 'Création...' : 'Enregistrer le Produit'}
          </button>
        </div>

      </form>
    </div>
  );
}
