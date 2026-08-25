'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, getBrands, createBrandAction, createProduct, uploadImage } from '@/actions/admin';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function ProductForm({ initialData }: { initialData?: any }) {
  const t = useTranslations('AdminProducts');

  const router = useRouter();
  const parseJSON = (data: any, fallback: any = []) => {
    if (!data) return fallback;
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch { return fallback; }
    }
    if (Array.isArray(data)) return data;
    return fallback;
  };

  const initialAttributes = parseJSON(initialData?.attributes);
  const initialVariations = parseJSON(initialData?.variations);
  const rawTags = parseJSON(initialData?.tags);
  const initialTags = rawTags.map((t: any) => typeof t === 'string' ? t : t.name).filter(Boolean);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categories?.map((c: any) => c.id) || []);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialData?.brandId || '');
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(parseJSON(initialData?.images));
  const [draggedImageIdx, setDraggedImageIdx] = useState<number | null>(null);
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  // Helper to slugify
  const generateSlug = (text: string) => 
    text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditing) {
      setSlug(generateSlug(newTitle));
    }
  };

  useEffect(() => {
    getCategories().then(setCategories);
    getBrands().then(setBrands);
  }, []);

  const [productType, setProductType] = useState<'SIMPLE' | 'VARIABLE'>(initialData?.type || 'SIMPLE');
  const [attributes, setAttributes] = useState<Array<{ name: string, options: string }>>(
    initialAttributes.map((a: any) => ({ 
      name: a?.name || '', 
      options: Array.isArray(a?.options) ? a.options.join(' | ') : (a?.options || '') 
    }))
  );
  const [variations, setVariations] = useState<Array<any>>(initialVariations);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');

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
      
      let finalBrandId = selectedBrand;

      if (showNewBrand && newBrandName) {
        const brandFormData = new FormData();
        brandFormData.append('name', newBrandName);
        let logoUrl = '';
        if (newBrandLogo) {
          const fd = new FormData();
          fd.append('file', newBrandLogo);
          const secureUrl = await uploadImage(fd);
          if (secureUrl) logoUrl = secureUrl;
        }
        const brandRes = await createBrandAction(brandFormData, logoUrl);
        if (brandRes.success && brandRes.brand) {
          finalBrandId = brandRes.brand.id;
        }
      }

      if (finalBrandId) {
        formData.append('brandId', finalBrandId);
      }

      formData.append('attributes', JSON.stringify(formattedAttributes));
      formData.append('variations', JSON.stringify(variations));
      formData.append('tags', JSON.stringify(tags));
      
      // Prevent original submit if textareas were still present
      formData.delete('shortDescription');
      formData.delete('description');
      
      formData.append('shortDescription', shortDescription);
      formData.append('description', description);
      
      const imageUrls: string[] = [...existingImages];
      if (imageFiles.length > 0) {
        // Upload each file
        for (const file of imageFiles) {
          const imageFormData = new FormData();
          imageFormData.append('file', file);
          const url = await uploadImage(imageFormData);
          if (url) imageUrls.push(url);
        }
      }

      formData.append('slug', slug);
      formData.append('categoryIds', JSON.stringify(selectedCategories));

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
        {isEditing ? `${t('update_product_btn')} : ${initialData.title}` : t('add_product')}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Product type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("product_type")}</label>
          <select 
            name="type" 
            value={productType} 
            onChange={(e) => setProductType(e.target.value as any)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-gray-50 font-semibold"
          >
            <option value="SIMPLE">{t("simple_product")}</option>
            <option value="VARIABLE">{t("variable_product")}</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('product_title_label')}</label>
            <input 
              type="text" 
              name="title" 
              value={title} 
              onChange={handleTitleChange} 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('slug_label')}</label>
            <input 
              type="text" 
              name="slug" 
              value={slug} 
              onChange={(e) => setSlug(e.target.value)} 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-gray-50" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories_label')}</label>
            <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto bg-gray-50 flex flex-col gap-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, cat.id]);
                      } else {
                        setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                      }
                    }}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Marque */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Marque</label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setShowNewBrand(true);
                  setSelectedBrand('');
                } else {
                  setShowNewBrand(false);
                  setSelectedBrand(e.target.value);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 bg-white"
            >
              <option value="">-- Aucune marque --</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
              <option value="new" className="font-bold text-orange-600">+ Ajouter une nouvelle marque</option>
            </select>
            
            {showNewBrand && (
              <div className="mt-4 p-4 border border-orange-200 bg-orange-50 rounded-md space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la marque *</label>
                  <input 
                    type="text" 
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ex: Nike, Apple..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo (Optionnel)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setNewBrandLogo(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowNewBrand(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Price & Stock (for simple product or base price) */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('regular_price_label')}</label>
            <input type="number" step="0.01" name="price" defaultValue={initialData?.price} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("sale_price")}</label>
            <input type="number" step="0.01" name="compareAtPrice" defaultValue={initialData?.compareAtPrice} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          {productType === 'SIMPLE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('stock_label')}</label>
              <input type="number" name="stock" defaultValue={initialData?.stock ?? ''} placeholder={t('stock_placeholder')} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
            </div>
          )}
        </div>

        {/* Attributes & Variations */}
        {productType === 'VARIABLE' && (
          <div className="border border-blue-200 bg-blue-50/30 p-6 rounded-lg space-y-8">
            {/* Attributes section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t("attributes")}</h3>
                <button type="button" onClick={addAttribute} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                  {t('add_attribute_btn')}
                </button>
              </div>
              <div className="space-y-3">
                {attributes.map((attr, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-white p-3 border border-gray-200 rounded">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">{t('attr_name_label')}</label>
                      <input 
                        type="text" 
                        value={attr.name} 
                        onChange={e => { const newAttr = [...attributes]; newAttr[idx].name = e.target.value; setAttributes(newAttr); }}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                        placeholder={t('attr_name_placeholder')}
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs text-gray-500 mb-1">{t('attr_val_label')}</label>
                      <input 
                        type="text" 
                        value={attr.options} 
                        onChange={e => { const newAttr = [...attributes]; newAttr[idx].options = e.target.value; setAttributes(newAttr); }}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                        placeholder={t('attr_val_placeholder')}
                      />
                    </div>
                    <button type="button" onClick={() => removeAttribute(idx)} className="mt-6 text-red-500 hover:text-red-700 p-1">
                      &times;
                    </button>
                  </div>
                ))}
                {attributes.length === 0 && <p className="text-sm text-gray-500 italic">{t("no_attributes")}</p>}
              </div>
            </div>

            {/* Variations section */}
            <div className="border-t border-blue-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t("variations")}</h3>
                <button type="button" onClick={addVariation} disabled={attributes.length === 0} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50">
                  {t('add_variation_btn')}
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
                          <label className="block text-xs text-gray-500 mb-1">{attr.name || 'Attribute'}</label>
                          <select 
                            value={v.attributes[attr.name] || ''}
                            onChange={e => {
                              const newV = [...variations];
                              newV[idx].attributes[attr.name] = e.target.value;
                              setVariations(newV);
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="">Select...</option>
                            {attr.options.split('|').map(o => o.trim()).filter(Boolean).map(o => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('variation_price_label')}</label>
                        <input 
                          type="number" step="0.01" 
                          value={v.price} 
                          onChange={e => { const newV = [...variations]; newV[idx].price = e.target.value; setVariations(newV); }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder={t('variation_price_placeholder')}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('variation_stock_label')}</label>
                        <input 
                          type="number" 
                          value={v.stock} 
                          onChange={e => { const newV = [...variations]; newV[idx].stock = e.target.value; setVariations(newV); }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder={t('variation_stock_placeholder')}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {variations.length === 0 && <p className="text-sm text-gray-500 italic">{t("add_variation_desc")}</p>}
              </div>
            </div>

          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('image_gallery_label')}</label>
          <p className="text-xs text-gray-500 mb-2">{t("image_gallery_desc")}</p>
          {existingImages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {existingImages.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  className="relative group cursor-move"
                  draggable
                  onDragStart={() => setDraggedImageIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedImageIdx === null || draggedImageIdx === idx) return;
                    const newImages = [...existingImages];
                    const draggedImg = newImages[draggedImageIdx];
                    newImages.splice(draggedImageIdx, 1);
                    newImages.splice(idx, 0, draggedImg);
                    setExistingImages(newImages);
                    setDraggedImageIdx(null);
                  }}
                >
                  <img src={img} alt={`img-${idx}`} className="h-20 w-20 object-cover rounded border" />
                  <button 
                    type="button" 
                    onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    &times;
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] text-center opacity-0 group-hover:opacity-100 transition">
                    Order: {idx + 1}
                  </div>
                </div>
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
            <p className="mt-2 text-sm text-gray-500">{imageFiles.length} {t('new_files_selected')}</p>
          )}
        </div>

        {/* Short & Long Description */}
        <div className="space-y-8 pb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("short_desc")}</label>
            <div className="bg-white">
              <ReactQuill theme="snow" value={shortDescription} onChange={setShortDescription} className="h-32 mb-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("long_desc")}</label>
            <div className="bg-white">
              <ReactQuill theme="snow" value={description} onChange={setDescription} className="h-64 mb-12" />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("tags_label")}</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                      setTags([...tags, tagInput.trim()]);
                      setTagInput('');
                    }
                  }
                }}
                placeholder={t("tags_placeholder")} 
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" 
              />
            <button 
              type="button" 
              onClick={() => {
                if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                  setTags([...tags, tagInput.trim()]);
                  setTagInput('');
                }
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition"
            >
              {t('add_tag_btn')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span key={idx} className="bg-white border border-gray-300 px-3 py-1 rounded-full text-sm flex items-center shadow-sm">
                {tag}
                <button 
                  type="button" 
                  onClick={() => setTags(tags.filter((_, i) => i !== idx))} 
                  className="ml-2 text-red-500 hover:text-red-700 font-bold"
                >
                  &times;
                </button>
              </span>
            ))}
            {tags.length === 0 && <p className="text-xs text-gray-500 italic">{t('no_tags_yet')}</p>}
          </div>
        </div>

        {/* Flags / Labels */}
        <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="flex items-center">
            <input type="checkbox" name="isBestSeller" id="isBestSeller" defaultChecked={initialData?.isBestSeller} className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
            <label htmlFor="isBestSeller" className="ml-2 block text-sm text-gray-900">{t('mark_best_seller')}</label>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isDealOfTheDay" id="isDealOfTheDay" defaultChecked={initialData?.isDealOfTheDay} className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
            <label htmlFor="isDealOfTheDay" className="ml-2 block text-sm text-gray-900">{t('mark_deal_day')}</label>
          </div>
          <div>
            <input type="text" name="discountLabel" defaultValue={initialData?.discountLabel} placeholder={t('discount_label_placeholder')} className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-end">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium mr-4 hover:bg-gray-50 transition"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition disabled:opacity-50"
          >
            {isLoading ? t('saving') : (isEditing ? t('update_product_btn') : t('add_product_btn'))}
          </button>
        </div>

      </form>
    </div>
  );
}
