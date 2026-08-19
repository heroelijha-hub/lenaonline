'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCurrency } from '@/components/CurrencyProvider';

interface ProductActionsProps {
  product: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    type: string;
    stock: number | null;
    images: string[];
    attributes?: { name: string; options: string[] }[];
    variations?: { id: string; price: string; stock?: string; attributes: Record<string, string> }[];
  };
  enableBuyNow?: boolean;
}

export default function ProductActions({ product, enableBuyNow = false }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const { formatPrice } = useCurrency();
  
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  
  const isWishlisted = wishlistStore.hasItem(product.id);

  // Pour les produits variables, on vérifie si une variation correspond aux attributs sélectionnés
  const isVariable = product.type === 'VARIABLE';
  const attributes = product.attributes || [];
  const variations = product.variations || [];

  let currentVariation: { id: string; price: string; stock?: string; attributes: Record<string, string> } | null = null;
  if (isVariable && Object.keys(selectedAttributes).length === attributes.length) {
    currentVariation = variations.find(v => {
      // Check if this variation matches all selected attributes
      return Object.entries(selectedAttributes).every(([key, value]) => v.attributes[key] === value);
    });
  }

  // Prix et stock dynamiques
  const currentPrice = currentVariation ? parseFloat(currentVariation.price) : product.price;
  const currentStock = currentVariation 
    ? (currentVariation.stock ? parseInt(currentVariation.stock) : null) 
    : product.stock;

  const handleAddToCart = () => {
    if (isVariable && !currentVariation) {
      alert("Veuillez sélectionner toutes les options avant d'ajouter au panier.");
      return;
    }

    cartStore.addItem({
      id: currentVariation ? `${product.id}-${currentVariation.id}` : product.id,
      productId: product.id,
      variationId: currentVariation?.id,
      title: product.title,
      price: currentPrice,
      image: product.images?.[0] || '',
      quantity,
      attributes: currentVariation ? selectedAttributes : undefined,
    });
    
    // Optional: show a mini toast or alert
    alert('Produit ajouté au panier !');
  };

  const handleBuyNow = () => {
    if (isVariable && !currentVariation) {
      alert("Veuillez sélectionner toutes les options avant l'achat rapide.");
      return;
    }

    cartStore.addItem({
      id: currentVariation ? `${product.id}-${currentVariation.id}` : product.id,
      productId: product.id,
      variationId: currentVariation?.id,
      title: product.title,
      price: currentPrice,
      image: product.images?.[0] || '',
      quantity,
      attributes: currentVariation ? selectedAttributes : undefined,
    });
    
    router.push('/checkout');
  };

  return (
    <div>
      {/* Price Display */}
      <div className="mb-6">
        {product.compareAtPrice && !currentVariation && (
          <span className="text-2xl text-gray-400 line-through mr-3">{formatPrice(product.compareAtPrice)}</span>
        )}
        <span className="text-3xl font-bold text-red-600">{formatPrice(currentPrice)}</span>
      </div>

      {/* Attributes Selection (Only if Variable) */}
      {isVariable && attributes.length > 0 && (
        <div className="space-y-4 mb-6">
          {attributes.map(attr => (
            <div key={attr.name}>
              <span className="text-sm text-gray-500 mb-2 block">{attr.name} : <span className="text-gray-900 font-semibold">{selectedAttributes[attr.name] || 'Sélectionner...'}</span></span>
              <div className="flex flex-wrap gap-2">
                {attr.options.map((opt: string) => {
                  const isSelected = selectedAttributes[attr.name] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setSelectedAttributes({ ...selectedAttributes, [attr.name]: opt })}
                      className={`px-3 py-1 border rounded-md text-sm transition ${
                        isSelected ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold ring-1 ring-orange-500' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stock status */}
      <p className="text-teal-600 font-semibold mb-6">
        {currentStock === null ? 'En stock' : `${currentStock} en stock`}
      </p>

      {/* Actions (Quantity + Cart + Buy) */}
      <div className="flex gap-4 mb-8">
        {/* Qty */}
        <div className="flex border border-gray-300 rounded-md overflow-hidden bg-gray-50 w-32">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-gray-600 hover:bg-gray-200 font-bold">-</button>
          <input type="text" value={quantity} readOnly className="w-full text-center bg-transparent font-semibold border-x border-gray-300" />
          <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 font-bold">+</button>
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="flex-1 bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold rounded-md transition shadow-sm"
        >
          Add to Cart
        </button>
        
        {enableBuyNow && (
          <button 
            onClick={handleBuyNow}
            className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-md transition shadow-sm"
          >
            Buy Now
          </button>
        )}
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button 
          onClick={() => wishlistStore.toggleItem(product.id)}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md border transition ${
            isWishlisted ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-600 hover:text-orange-500 bg-orange-50/50 border-orange-100'
          }`}
        >
          <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 bg-orange-50/50 px-4 py-2 rounded-md border border-orange-100 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          Compare
        </button>
        <button 
          onClick={() => router.push('/contact')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 bg-orange-50/50 px-4 py-2 rounded-md border border-orange-100 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Ask a Question
        </button>
      </div>
    </div>
  );
}
