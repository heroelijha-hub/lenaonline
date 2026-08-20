'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('free');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getTotalPrice();
  let shippingCost = 0;
  if (shippingMethod === 'standard') shippingCost = 21.87;
  if (shippingMethod === 'express') shippingCost = 53.87;
  
  const total = subtotal + (items.length > 0 ? shippingCost : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Cart Items or Empty State */}
          <div className="flex-grow">
            {items.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-gray-50 border-t-2 border-blue-500 p-4 flex items-center text-gray-700 text-sm">
                  <svg className="w-5 h-5 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Votre panier est actuellement vide.
                </div>
                <Link href="/" className="inline-block bg-[#ff4500] hover:bg-[#e03e00] text-white font-medium px-6 py-2.5 rounded transition">
                  Retour à la boutique
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Desktop Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 text-sm font-bold text-gray-800">
                  <div className="col-span-1 text-center">Retirer</div>
                  <div className="col-span-2 text-center">Image</div>
                  <div className="col-span-4">Titre du produit</div>
                  <div className="col-span-2 text-center">Prix</div>
                  <div className="col-span-2 text-center">Quantité</div>
                  <div className="col-span-1 text-right">Total</div>
                </div>
                
                {/* Cart Items */}
                <div className="divide-y divide-gray-200 border-b border-gray-200">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variationId || ''}`} className="py-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                      
                      {/* Remove Button */}
                      <div className="col-span-1 flex justify-center w-full md:w-auto mb-2 md:mb-0">
                        <button 
                          onClick={() => removeItem(item.productId, item.variationId)}
                          className="text-red-600 hover:text-red-800"
                          title="Retirer"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        </button>
                      </div>

                      {/* Image */}
                      <div className="col-span-2 flex justify-center">
                        <Link href={`/product/${item.productSlug}`} className="w-20 h-20 bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <span className="text-xs text-gray-400">Image</span>
                          )}
                        </Link>
                      </div>

                      {/* Title */}
                      <div className="col-span-4 text-center md:text-left">
                        <Link href={`/product/${item.productSlug}`} className="text-gray-800 hover:text-[#ff4500] font-medium text-sm">
                          {item.title}
                        </Link>
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </div>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="col-span-2 text-center text-gray-700 text-sm">
                        {formatPrice(item.price)}
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center border border-gray-300">
                          <button 
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variationId)}
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition bg-gray-50"
                          >
                            -
                          </button>
                          <input 
                            type="text" 
                            readOnly 
                            value={item.quantity}
                            className="w-10 py-1.5 text-center text-sm font-medium border-x border-gray-300 outline-none"
                          />
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variationId)}
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="col-span-1 text-center md:text-right text-gray-700 text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon & Update Cart Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4">
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <input 
                      type="text" 
                      placeholder="Code de réduction" 
                      className="border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-500 w-full sm:w-48"
                    />
                    <button className="border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition w-full sm:w-auto whitespace-nowrap">
                      Appliquer le coupon
                    </button>
                  </div>
                  <button className="border border-gray-300 px-6 py-2 text-sm font-medium hover:bg-gray-50 transition w-full md:w-auto">
                    Mettre à jour le panier
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-[#f9f9f9] p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Total Panier</h2>
              
              <div className="border border-gray-200 bg-white mb-6 text-sm">
                {/* Subtotal */}
                <div className="flex border-b border-gray-200 p-4">
                  <div className="w-1/3 font-bold text-gray-800">Sous-total</div>
                  <div className="w-2/3 text-gray-700">{formatPrice(subtotal)}</div>
                </div>

                {/* Shipping Options (only show if items exist, or design shows it anyway, let's keep it close to mockup) */}
                {items.length > 0 && (
                  <div className="flex border-b border-gray-200 p-4">
                    <div className="w-1/3 font-bold text-gray-800 pt-1">Expédition</div>
                    <div className="w-2/3 space-y-2 text-gray-700">
                      <label className="flex items-start cursor-pointer">
                        <input 
                          type="radio" 
                          name="shipping" 
                          value="free" 
                          checked={shippingMethod === 'free'}
                          onChange={() => setShippingMethod('free')}
                          className="mt-1 mr-2"
                        />
                        <span>Livraison gratuite</span>
                      </label>
                      <label className="flex items-start cursor-pointer">
                        <input 
                          type="radio" 
                          name="shipping" 
                          value="standard" 
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="mt-1 mr-2"
                        />
                        <span>Livraison standard:<br/>21,87€</span>
                      </label>
                      <label className="flex items-start cursor-pointer">
                        <input 
                          type="radio" 
                          name="shipping" 
                          value="express" 
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          className="mt-1 mr-2"
                        />
                        <span>Livraison expresse:<br/>53,87€</span>
                      </label>
                      
                      <p className="text-xs text-gray-500 mt-4 mb-2">Les options de livraison seront mises à jour lors de la commande.</p>
                      
                      <button className="text-gray-800 underline text-sm hover:text-gray-600">
                        Calculer les frais d'expédition
                      </button>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex p-4 bg-gray-50 items-center">
                  <div className="w-1/3 font-bold text-gray-800">Total</div>
                  <div className="w-2/3 text-lg font-bold text-gray-900">{formatPrice(total)}</div>
                </div>
              </div>

              <button 
                onClick={() => router.push('/checkout')}
                disabled={items.length === 0}
                className="w-full bg-[#111] hover:bg-black text-white font-bold py-3.5 px-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Valider La Commande
              </button>
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
