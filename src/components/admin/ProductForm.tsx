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

  const [productType, setProductType] = useState<'SIMPLE' | 'VARIABLE'>(initialData?.type || 'SIMPLE');
  const [attributes, setAttributes] = useState<Array<{ name: string, options: string }>>(
    initialData?.attributes 
      ? (initialData.attributes as any[]).map(a => ({ name: a.name, options: a.options.join(' | ') })) 
      : []
  );
  const [variations, setVariations] = useState<Array<any>>(initialData?.variations || []);

  const addAttribute = () => setAttributes([...attributes, { name: '', options: '' }]);
  const removeAttribute = (idx: number) => setAttributes(attributes.filter((_, i) => i !== idx));

  const addVariation = () => setVariations([...variations, { id: crypto.randomUUID(), attributes: {}, price: '', stock: '' }]);
  const removeVariation = (id: string) => setVariations(variations.filter(v => v.id !== id));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Formatting attributes and variations to send as JSON string
      const formattedAttributes = attributes.map(a => ({
        name: a.name,
        options: a.options.split('|').map(o => o.trim()).filter(Boolean)
      })).filter(a => a.name && a.options.length > 0);
      
      formData.append('attributes', JSON.stringify(formattedAttributes));
      formData.append('variations', JSON.stringify(variations));
      
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
        formData.append('id', initialData.id);
        const { updateProduct } = await import('@/actions/admin');
        const res = await updateProduct(formData, imageUrls);
        if (res.error) alert(res.error);
        else router.push('/admin/products');
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
        
        {/* Type de produit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de Produit</label>
          <select 
            name="type" 
            value={productType} 
            onChange={(e) => setProductType(e.target.value as any)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-gray-50 font-semibold"
          >
            <option value="SIMPLE">Produit Simple</option>
            <option value="VARIABLE">Produit Variable</option>
          </select>
        </div>

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

        {/* Prix & Stock (Pour Simple Produit ou prix de base) */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix de base ($) *</label>
            <input type="number" step="0.01" name="price" defaultValue={initialData?.price} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix barré ($)</label>
            <input type="number" step="0.01" name="compareAtPrice" defaultValue={initialData?.compareAtPrice} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          {productType === 'SIMPLE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock (Laisser vide = illimité)</label>
              <input type="number" name="stock" defaultValue={initialData?.stock ?? ''} placeholder="En stock" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
            </div>
          )}
        </div>

        {/* Attributs & Variations */}
        {productType === 'VARIABLE' && (
          <div className="border border-blue-200 bg-blue-50/30 p-6 rounded-lg space-y-8">
            {/* Attributes section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Attributs</h3>
                <button type="button" onClick={addAttribute} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                  + Ajouter un attribut
                </button>
              </div>
              <div className="space-y-3">
                {attributes.map((attr, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-white p-3 border border-gray-200 rounded">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Nom (ex: Couleur)</label>
                      <input 
                        type="text" 
                        value={attr.name} 
                        onChange={e => { const newAttr = [...attributes]; newAttr[idx].name = e.target.value; setAttributes(newAttr); }}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                        placeholder="Couleur"
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs text-gray-500 mb-1">Valeurs (séparées par des |)</label>
                      <input 
                        type="text" 
                        value={attr.options} 
                        onChange={e => { const newAttr = [...attributes]; newAttr[idx].options = e.target.value; setAttributes(newAttr); }}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                        placeholder="Rouge | Bleu | Vert"
                      />
                    </div>
                    <button type="button" onClick={() => removeAttribute(idx)} className="mt-6 text-red-500 hover:text-red-700 p-1">
                      &times;
                    </button>
                  </div>
                ))}
                {attributes.length === 0 && <p className="text-sm text-gray-500 italic">Aucun attribut. Ajoutez-en pour pouvoir créer des variations.</p>}
              </div>
            </div>

            {/* Variations section */}
            <div className="border-t border-blue-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Variations</h3>
                <button type="button" onClick={addVariation} disabled={attributes.length === 0} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50">
                  + Ajouter une variation
                </button>
              </div>
              <div className="space-y-3">
                {variations.map((v, idx) => (
                  <div key={v.id} className="bg-white p-4 border border-gray-200 rounded shadow-sm relative">
                    <button type="button" onClick={() => removeVariation(v.id)} className="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700">
                      &times;
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {attributes.map(attr => (
                        <div key={attr.name}>
                          <label className="block text-xs text-gray-500 mb-1">{attr.name || 'Attribut'}</label>
                          <select 
                            value={v.attributes[attr.name] || ''}
                            onChange={e => {
                              const newV = [...variations];
                              newV[idx].attributes[attr.name] = e.target.value;
                              setVariations(newV);
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="">Sélectionnez...</option>
                            {attr.options.split('|').map(o => o.trim()).filter(Boolean).map(o => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Prix de la variation ($)</label>
                        <input 
                          type="number" step="0.01" 
                          value={v.price} 
                          onChange={e => { const newV = [...variations]; newV[idx].price = e.target.value; setVariations(newV); }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Ex: 15.00"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Stock</label>
                        <input 
                          type="number" 
                          value={v.stock} 
                          onChange={e => { const newV = [...variations]; newV[idx].stock = e.target.value; setVariations(newV); }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Laisser vide = illimité"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {variations.length === 0 && <p className="text-sm text-gray-500 italic">Ajoutez des variations avec leurs propres prix.</p>}
              </div>
            </div>

          </div>
        )}

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

        {/* Description Courte & Longue */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description Courte</label>
            <textarea name="shortDescription" defaultValue={initialData?.shortDescription} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description Longue</label>
            <textarea name="description" defaultValue={initialData?.description} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"></textarea>
          </div>
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
