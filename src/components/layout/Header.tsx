'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useEffect, useState } from 'react';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.getTotalItems());
  const cartTotal = useCartStore((state) => state.getTotalPrice());
  const wishlistItems = useWishlistStore((state) => state.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-200 font-sans">
      {/* Top Bar */}
      <div className="hidden md:flex justify-between items-center px-4 py-2 text-sm text-gray-600 border-b border-gray-100 max-w-7xl mx-auto w-full">
        <div>Welcome to Shopelios</div>
        <div className="flex items-center space-x-6">
          <Link href="/store-locator" className="flex items-center hover:text-orange-600 transition">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Store Locator
          </Link>
          <Link href="/order-tracking" className="flex items-center hover:text-orange-600 transition">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
            Order Tracking
          </Link>
          <Link href="/login" className="flex items-center hover:text-orange-600 transition">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Login
          </Link>
        </div>
      </div>

      {/* Middle Bar */}
      <div className="py-5 px-4 max-w-7xl mx-auto w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-3xl font-extrabold tracking-tight text-gray-900">
            LOGO
          </Link>
        </div>

        {/* Search Bar & Quick Links */}
        <div className="flex-1 w-full max-w-3xl flex flex-col">
          <div className="flex items-center w-full border border-gray-300 rounded-md overflow-hidden bg-white h-11">
            <input 
              type="text" 
              placeholder="Search for Products..." 
              className="flex-1 px-4 h-full outline-none text-gray-700 placeholder-gray-400"
            />
            <div className="flex items-center px-3 border-l border-gray-300 h-full bg-white text-gray-600 text-sm cursor-pointer hover:bg-gray-50">
              <span>All Categories</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-6 h-full transition-colors">
              Search
            </button>
          </div>
          {/* Quick links under search */}
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <Link href="/air" className="hover:text-orange-600">Air</Link>
            <Link href="/galaxy" className="hover:text-orange-600">Galaxy</Link>
            <Link href="/tab" className="hover:text-orange-600">Tab</Link>
            <Link href="/laptop-ai" className="hover:text-orange-600">Laptop AI</Link>
            <Link href="/vivo" className="hover:text-orange-600">Vivo V30E</Link>
          </div>
        </div>

        {/* Wishlist & Cart */}
        <div className="flex items-center flex-shrink-0 space-x-4">
          <button className="p-2 text-gray-700 hover:text-orange-600 transition relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {mounted && wishlistItems > 0 && (
              <span className="absolute 0 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                {wishlistItems}
              </span>
            )}
          </button>
          
          <div className="flex items-center bg-orange-50 rounded-md px-4 py-2 border border-orange-100 cursor-pointer hover:bg-orange-100 transition">
            <div className="relative mr-3">
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {mounted && (
                <span className="absolute -top-1 -right-2 bg-orange-500 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {cartItems}
                </span>
              )}
            </div>
            <span className="font-bold text-gray-900 ml-2">{mounted ? `$${cartTotal.toFixed(2)}` : '$0.00'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between h-14">
          
          <div className="flex items-center h-full space-x-8">
            {/* All Categories Button */}
            <button className="bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-6 h-full flex items-center space-x-2 rounded-t-md mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
              <span>All Categories</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 font-semibold text-gray-800">
              <Link href="/" className="text-orange-600 flex items-center">
                Home <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              <Link href="/shop" className="hover:text-orange-600 flex items-center transition">
                Shop <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              <Link href="/pages" className="hover:text-orange-600 flex items-center transition">
                Pages <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              <Link href="/blogs" className="hover:text-orange-600 flex items-center transition">
                Blogs <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              <Link href="/portfolios" className="hover:text-orange-600 transition">
                Portfolios
              </Link>
              <Link href="/contact" className="hover:text-orange-600 transition">
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Right side tags */}
          <div className="hidden lg:flex items-center space-x-4 text-sm font-semibold text-gray-800">
            <Link href="/new" className="flex items-center hover:text-orange-600 transition">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              New
            </Link>
            <Link href="/hot" className="flex items-center hover:text-orange-600 transition">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              Hot
            </Link>
            <Link href="/sale" className="flex items-center hover:text-orange-600 transition">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              Sale
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
