'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWishlistStore } from '@/store/wishlistStore';
import { useEffect, useState } from 'react';

type MobileBottomNavProps = {
  onSearchClick: () => void;
  onLoginClick: () => void;
};

export default function MobileBottomNav({ onSearchClick, onLoginClick }: MobileBottomNavProps) {
  const [mounted, setMounted] = useState(false);
  const wishlistItems = useWishlistStore((state) => state.items.length);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a] text-gray-300 border-t border-gray-800 z-[60] px-4 py-2 flex justify-between items-center pb-safe">
      {/* Search */}
      <button 
        onClick={onSearchClick}
        aria-label="Search"
        className="flex flex-col items-center justify-center p-2 hover:text-white transition"
      >
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Login */}
      <button 
        onClick={onLoginClick}
        aria-label="Login"
        className="flex flex-col items-center justify-center p-2 hover:text-white transition"
      >
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>

      {/* Categories / Grid */}
      <Link 
        href="/shop" 
        aria-label="Shop"
        className={`flex flex-col items-center justify-center p-2 transition ${pathname === '/shop' ? 'text-white' : 'hover:text-white'}`}
      >
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </Link>

      {/* Wishlist */}
      <Link 
        href="/wishlist" 
        aria-label="Wishlist"
        className={`flex flex-col items-center justify-center p-2 relative transition ${pathname === '/wishlist' ? 'text-white' : 'hover:text-white'}`}
      >
        <div className="relative">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {mounted && wishlistItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm">
              {wishlistItems}
            </span>
          )}
        </div>
      </Link>

      {/* Sales */}
      <Link 
        href="/sale" 
        aria-label="Sale"
        className={`flex flex-col items-center justify-center p-2 transition ${pathname === '/sale' ? 'text-white' : 'hover:text-white'}`}
      >
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </Link>
    </div>
  );
}
