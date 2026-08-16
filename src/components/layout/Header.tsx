'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useEffect, useState, useRef } from 'react';
import LoginModal from '@/components/auth/LoginModal';
import CartDrawer from '@/components/cart/CartDrawer';
import { searchProducts } from '@/actions/public';

type HeaderProps = {
  announcement?: string;
  logoImage?: string;
  menuLinks?: Array<{ label: string, url: string }>;
  categories?: Array<{ id: string, name: string, slug: string | null }>;
};

export default function Header({ 
  announcement = 'Welcome to Shopelios', 
  logoImage = '',
  menuLinks = [],
  categories = []
}: HeaderProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.getTotalItems());
  const cartTotal = useCartStore((state) => state.getTotalPrice());
  const wishlistItems = useWishlistStore((state) => state.items.length);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        setShowSearchResults(true);
        try {
          const results = await searchProducts(searchQuery, selectedCategory, 5);
          setSearchResults(results);
        } catch (error) {
          console.error("Erreur de recherche", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      let url = `/search?q=${encodeURIComponent(searchQuery)}`;
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      router.push(url);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-200 font-sans">
      {/* Top Bar */}
      <div className="hidden md:flex justify-between items-center px-4 py-2 text-sm text-gray-600 border-b border-gray-100 max-w-7xl mx-auto w-full">
        <div>{announcement}</div>
        <div className="flex items-center space-x-6">
          <Link href="/store-locator" className="flex items-center hover:text-orange-600 transition">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Store Locator
          </Link>
          <Link href="/order-tracking" className="flex items-center hover:text-orange-600 transition">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
            Order Tracking
          </Link>
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center hover:text-orange-600 transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Login
          </button>
        </div>
      </div>

      {/* Middle Bar */}
      <div className="py-5 px-4 max-w-7xl mx-auto w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center">
            {logoImage ? (
              <img src={logoImage} alt="Shopelios Logo" className="h-10 object-contain" />
            ) : (
              <span className="text-3xl font-extrabold tracking-tight text-gray-900">LOGO</span>
            )}
          </Link>
        </div>

        {/* Search Bar & Quick Links */}
        <div className="flex-1 w-full max-w-3xl flex flex-col relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full border border-gray-300 rounded-md overflow-hidden bg-white h-11 relative z-20">
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.length > 1) setShowSearchResults(true); }}
              className="flex-1 px-4 h-full outline-none text-gray-700 placeholder-gray-400"
            />
            
            {/* Category Dropdown Toggle */}
            <div 
              className="relative flex items-center px-3 border-l border-gray-300 h-full bg-white text-gray-600 text-sm cursor-pointer hover:bg-gray-50"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <span className="truncate max-w-[100px] md:max-w-[150px]">
                {selectedCategory === 'all' 
                  ? 'All Categories' 
                  : categories.find(c => c.id === selectedCategory)?.name || 'All Categories'}
              </span>
              <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              
              {/* Category Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-30 max-h-60 overflow-y-auto">
                  <div 
                    className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-gray-700"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Categories
                  </div>
                  {categories.map(cat => (
                    <div 
                      key={cat.id} 
                      className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-gray-700 truncate"
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-6 h-full transition-colors flex items-center justify-center">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Search'
              )}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg z-50 overflow-hidden">
              {isSearching && searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Recherche en cours...</div>
              ) : searchResults.length > 0 ? (
                <div>
                  <ul className="max-h-80 overflow-y-auto py-2 custom-scrollbar">
                    {searchResults.map((product) => (
                      <li key={product.id}>
                        <Link 
                          href={`/product/${product.slug}`} 
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center px-4 py-3 hover:bg-orange-50 transition border-b border-gray-100 last:border-0"
                        >
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden mr-4">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-orange-600 font-bold text-sm">${product.price.toFixed(2)}</span>
                              {product.compareAtPrice && product.compareAtPrice > product.price && (
                                <span className="text-gray-400 line-through text-xs">${product.compareAtPrice.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-100 p-2 text-center bg-gray-50">
                    <button 
                      onClick={handleSearchSubmit}
                      className="text-sm text-orange-600 font-semibold hover:text-orange-700 w-full py-2"
                    >
                      Voir tous les résultats pour "{searchQuery}"
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Aucun produit trouvé pour "{searchQuery}"</p>
                  {selectedCategory !== 'all' && <p className="text-xs mt-1">dans la catégorie sélectionnée.</p>}
                </div>
              )}
            </div>
          )}
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
          
          <div 
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex items-center bg-orange-50 rounded-md px-4 py-2 border border-orange-100 cursor-pointer hover:bg-orange-100 transition"
          >
            <div className="relative mr-3">
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {mounted && (
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
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
              {menuLinks.map((link, idx) => (
                <Link key={idx} href={link.url} className="hover:text-orange-600 flex items-center transition">
                  {link.label}
                  {/* Optionnel: Icône flèche si nécessaire, on garde simple pour l'instant */}
                </Link>
              ))}
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

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      
      <CartDrawer 
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </header>
  );
}
