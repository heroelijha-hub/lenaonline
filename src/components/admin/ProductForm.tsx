'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, createProduct, uploadImage } from '@/actions/admin';
// import { updateProduct } from '@/actions/admin'; // We will create this action

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const isEditing = !!initialData;

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const imageUrls: string[] = isEditing && initialData.images ? [...initialData.images] : [];
      if (imageFiles.length > 0) {
        // Upload each file
        for (const file of imageFiles) {
          const imageFormData = new FormData();
          imageFormData.append('file', file);
          const url = await uploadImage(imageFormData);
          if (url) imageUrls.push(url);
        }
      }

      // If editing, we will call updateProduct (to be created), otherwise createProduct
      if (isEditing) {
        // We will pass the id to the update action
        formData.append('id', initialData.id);
        // const res = await updateProduct(formData, imageUrls);
        // temporary fallback until we create updateProduct:
        alert("Mode édition à implémenter dans les actions.");
        router.push('/admin/products');
      } else {
        const res = await createProduct(formData, imageUrls);
        if (res.error) {
          alert(res.error);
        } else {
          router.push('/admin/products');
        }
      }
    } catch (err) {
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {isEditing ? `Modifier : ${initialData.title}` : 'Ajouter un Nouveau Produit'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Titre & Catégorie */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre du produit *</label>
            <input type="text" name="title" defaultValue={initialData?.title} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select name="categoryId" defaultValue={initialData?.categoryId} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500">
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
            <input type="number" step="0.01" name="price" defaultValue={initialData?.price} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix barré ($)</label>
            <input type="number" step="0.01" name="compareAtPrice" defaultValue={initialData?.compareAtPrice} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock (Laisser vide = illimité)</label>
            <input type="number" name="stock" defaultValue={initialData?.stock ?? ''} placeholder="En stock" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
        </div>

        {/* Image Upload (Cloudinary) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Galerie d'images (Cloudinary - max 20)</label>
          {isEditing && initialData?.images && initialData.images.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {initialData.images.map((img: string, idx: number) => (
                <img key={idx} src={img} alt={`img-${idx}`} className="h-16 w-16 object-cover rounded border" />
              ))}
            </div>
          )}
          <input 
            type="file" 
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, 20);
              setImageFiles(files);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" 
          />
          {imageFiles.length > 0 && (
            <p className="mt-2 text-sm text-gray-500">{imageFiles.length} nouveau(x) fichier(s) sélectionné(s)</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" defaultValue={initialData?.description} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"></textarea>
        </div>

        {/* Flags / Labels */}
        <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="flex items-center">
            <input type="checkbox" name="isBestSeller" id="isBestSeller" defaultChecked={initialData?.isBestSeller} className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
            <label htmlFor="isBestSeller" className="ml-2 block text-sm text-gray-900">Mettre en "Best Seller"</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isDealOfTheDay" id="isDealOfTheDay" defaultChecked={initialData?.isDealOfTheDay} className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
            <label htmlFor="isDealOfTheDay" className="ml-2 block text-sm text-gray-900">Mettre en "Deal of the Day"</label>
          </div>
          <div>
            <input type="text" name="discountLabel" defaultValue={initialData?.discountLabel} placeholder="Label (ex: -14%)" className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
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
            {isLoading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour le Produit' : 'Enregistrer le Produit')}
          </button>
        </div>

      </form>
    </div>
  );
}
