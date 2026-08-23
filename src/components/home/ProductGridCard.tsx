'use client';

import { useRouter } from 'next/navigation';
import Price from '@/components/Price';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import QuickViewModal from '@/components/product/QuickViewModal';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type ProductGridCardProps = {
  product: any;
  variant: string;
  cardBorderColor: string;
  btnBgColor: string;
  btnTextColor: string;
};

export default function ProductGridCard({
  product,
  variant,
  cardBorderColor,
  btnBgColor,
  btnTextColor,
}: ProductGridCardProps) {
  const router = useRouter();
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const t = useTranslations('Home');
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const isWishlisted = wishlistStore.hasItem(product.id);
  const image = product.images && product.images.length > 0 ? product.images[0] : '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.addItem({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: product.price,
      image: image,
      quantity: 1,
    });
    cartStore.setIsOpen(true);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wishlistStore.toggleItem(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const navigateToProduct = () => {
    router.push(`/product/${product.slug}`);
  };

  return (
    <div
      className="group flex flex-col rounded-xl overflow-hidden bg-white transition relative cursor-pointer"
      style={{
        border: `2px solid ${cardBorderColor}`,
      }}
      onClick={navigateToProduct}
    >
      {/* Image Container */}
      <div className="block relative bg-gray-50 aspect-square p-6 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-contain transition duration-300 group-hover:opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🛒</div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur-[1px] pointer-events-none">
          {/* Variant 2: Button is in the center overlay */}
          {variant === '2' && (
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm shadow-sm transition transform hover:scale-105 z-10 pointer-events-auto"
              style={{ backgroundColor: btnBgColor, color: btnTextColor }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t('add_to_cart')}
            </button>
          )}
        </div>

        {/* Icons Vertical Stack */}
        <div className="absolute top-3 right-3 flex flex-col items-center justify-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            className="p-2 rounded-md shadow-sm transition transform hover:scale-105"
            style={{ backgroundColor: btnBgColor, color: btnTextColor }}
            title={t('add_to_cart')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          <button
            onClick={handleQuickView}
            className="p-2 rounded-md shadow-sm transition transform hover:scale-105"
            style={{ backgroundColor: btnBgColor, color: btnTextColor }}
            title="Quick view"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={handleToggleWishlist}
            className="p-2 rounded-md shadow-sm transition transform hover:scale-105"
            style={{ backgroundColor: btnBgColor, color: btnTextColor }}
            title="Wishlist"
          >
            <svg className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1 flex flex-col">
          <p className="text-xs text-gray-400 font-medium mb-1 truncate">
            {product.category?.name || 'General'}
          </p>
          <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-orange-600 transition">
            {product.title}
          </h3>
          <div className="mt-auto pt-2">
            <Price amount={product.price} className="text-sm font-bold text-gray-900" />
          </div>
        </div>

        {/* Variant 1: Add to Cart Button at the bottom */}
        {variant === '1' && (
          <div className="mt-4">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-2 border rounded-md font-medium text-sm transition-all duration-300 hover:bg-[var(--btn-bg)] hover:text-[var(--btn-text)] hover:border-[var(--btn-bg)] z-10 relative"
              style={
                {
                  borderColor: '#e5e7eb',
                  '--btn-bg': btnBgColor,
                  '--btn-text': btnTextColor,
                } as React.CSSProperties
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {t('add_to_cart')}
            </button>
          </div>
        )}
      </div>

      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        product={product} 
      />
    </div>
  );
}
