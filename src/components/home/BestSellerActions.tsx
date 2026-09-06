'use client';

import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import QuickViewModal from '@/components/product/QuickViewModal';

export const AddToCartBtn = ({ product, btnBgColor, btnTextColor, btnHoverBgColor, btnHoverTextColor }: { product: any, btnBgColor?: string, btnTextColor?: string, btnHoverBgColor?: string, btnHoverTextColor?: string }) => {
  const cartStore = useCartStore();
  const t = useTranslations('ProductCard');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.addItem({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.imageUrl,
    });
    cartStore.setIsOpen(true);
  };

  return (
    <button 
      onClick={handleAddToCart}
      style={{ backgroundColor: btnBgColor || '#111827', color: btnTextColor || '#ffffff', '--btn-hover-bg': btnHoverBgColor || '#1f2937', '--btn-hover-text': btnHoverTextColor || '#ffffff' } as React.CSSProperties}
      className="p-2 rounded-full transition-all duration-300 shadow-sm hover:[background-color:var(--btn-hover-bg)] hover:[color:var(--btn-hover-text)] hover:scale-105"
      aria-label="Add to cart"
      title={t('add_to_cart')}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </button>
  );
};

export const AddToCartBtnBig = ({ product, btnBgColor, btnTextColor, btnHoverBgColor, btnHoverTextColor }: { product: any, btnBgColor?: string, btnTextColor?: string, btnHoverBgColor?: string, btnHoverTextColor?: string }) => {
  const cartStore = useCartStore();
  const t = useTranslations('ProductCard');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.addItem({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.imageUrl,
    });
    cartStore.setIsOpen(true);
  };

  return (
    <button 
      onClick={handleAddToCart}
      style={{ backgroundColor: btnBgColor || '#111827', color: btnTextColor || '#ffffff', '--btn-hover-bg': btnHoverBgColor || '#1f2937', '--btn-hover-text': btnHoverTextColor || '#ffffff' } as React.CSSProperties}
      className="p-2.5 rounded-full transition-all duration-300 shadow-sm hover:[background-color:var(--btn-hover-bg)] hover:[color:var(--btn-hover-text)] hover:scale-105"
      aria-label="Add to cart"
      title={t('add_to_cart')}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </button>
  );
};

export const WishlistBtn = ({ product, btnBgColor, btnTextColor, btnHoverBgColor, btnHoverTextColor }: { product: any, btnBgColor?: string, btnTextColor?: string, btnHoverBgColor?: string, btnHoverTextColor?: string }) => {
  const wishlistStore = useWishlistStore();
  const isWishlisted = wishlistStore.hasItem(product.id);
  const t = useTranslations('ProductCard');

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasWishlisted = wishlistStore.hasItem(product.id);
    wishlistStore.toggleItem(product.id);
    if (!wasWishlisted) {
      wishlistStore.setIsOpen(true);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      style={{ backgroundColor: isWishlisted ? (btnHoverBgColor || '#ea580c') : (btnBgColor || '#ffffff'), color: isWishlisted ? (btnHoverTextColor || '#ffffff') : (btnTextColor || '#9ca3af'), '--btn-hover-bg': btnHoverBgColor || '#ea580c', '--btn-hover-text': btnHoverTextColor || '#ffffff' } as React.CSSProperties}
      className="p-2 rounded-full shadow transition-all duration-300 hover:[background-color:var(--btn-hover-bg)] hover:[color:var(--btn-hover-text)] hover:scale-105"
      aria-label="Wishlist"
      title={t('add_to_wishlist')}
    >
      <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
};

export const QuickviewBtn = ({ product, btnBgColor, btnTextColor, btnHoverBgColor, btnHoverTextColor }: { product: any, btnBgColor?: string, btnTextColor?: string, btnHoverBgColor?: string, btnHoverTextColor?: string }) => {
  const t = useTranslations('ProductCard');
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <button 
        onClick={handleQuickview}
        style={{ backgroundColor: btnBgColor || '#ffffff', color: btnTextColor || '#4b5563', '--btn-hover-bg': btnHoverBgColor || '#ea580c', '--btn-hover-text': btnHoverTextColor || '#ffffff' } as React.CSSProperties}
        className="p-2 rounded-full shadow transition-all duration-300 hover:[background-color:var(--btn-hover-bg)] hover:[color:var(--btn-hover-text)] hover:scale-105"
        aria-label="Quickview"
        title={t('quick_view')}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
      
      <QuickViewModal 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        product={product} 
      />
    </>
  );
};
