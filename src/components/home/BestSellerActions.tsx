'use client';

import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useTranslations } from 'next-intl';

export const AddToCartBtn = ({ product, btnBgColor, btnTextColor }: { product: any, btnBgColor?: string, btnTextColor?: string }) => {
  const cartStore = useCartStore();
  const t = useTranslations('Home');

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
      style={{ backgroundColor: btnBgColor || '#111827', color: btnTextColor || '#ffffff' }}
      className="p-2 rounded-full hover:opacity-80 transition-opacity shadow-sm"
      aria-label="Add to cart"
      title={t('add_to_cart')}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </button>
  );
};

export const AddToCartBtnBig = ({ product, btnBgColor, btnTextColor }: { product: any, btnBgColor?: string, btnTextColor?: string }) => {
  const cartStore = useCartStore();
  const t = useTranslations('Home');

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
      style={{ backgroundColor: btnBgColor || '#111827', color: btnTextColor || '#ffffff' }}
      className="p-2.5 rounded-full hover:opacity-80 transition-opacity shadow-sm"
      aria-label="Add to cart"
      title={t('add_to_cart')}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </button>
  );
};

export const WishlistBtn = ({ product, btnBgColor, btnTextColor }: { product: any, btnBgColor?: string, btnTextColor?: string }) => {
  const wishlistStore = useWishlistStore();
  const isWishlisted = wishlistStore.hasItem(product.id);
  const t = useTranslations('Home');

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wishlistStore.toggleItem(product.id);
  };

  return (
    <button 
      onClick={handleToggle}
      style={{ backgroundColor: btnBgColor || '#ffffff', color: isWishlisted ? (btnTextColor || '#ea580c') : '#9ca3af' }}
      className="p-2 rounded-full shadow hover:opacity-80 transition-opacity"
      aria-label="Wishlist"
      title={t('wishlist') || 'Wishlist'}
    >
      <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
};

export const QuickviewBtn = ({ product, btnBgColor, btnTextColor }: { product: any, btnBgColor?: string, btnTextColor?: string }) => {
  const t = useTranslations('Home');

  const handleQuickview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Dispatch a custom event to open a quickview modal, or redirect to a special query param
    // Since we don't have the implementation details of Quickview in this codebase,
    // we'll open the product page in a new tab for now, or just trigger an alert
    window.location.href = `/product/${product.slug}`;
  };

  return (
    <button 
      onClick={handleQuickview}
      style={{ backgroundColor: btnBgColor || '#ffffff', color: btnTextColor || '#4b5563' }}
      className="p-2 rounded-full shadow hover:opacity-80 transition-opacity"
      aria-label="Quickview"
      title={t('quick_view') || 'Quick View'}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>
  );
};
