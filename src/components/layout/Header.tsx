'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useEffect, useState, useRef } from 'react';
import LoginModal from '@/components/auth/LoginModal';
import CartDrawer from '@/components/cart/CartDrawer';
import { searchProducts } from '@/actions/public';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import MobileSidebar from '@/components/layout/MobileSidebar';
import MobileSearchOverlay from '@/components/layout/MobileSearchOverlay';

type HeaderProps = {
  announcement?: string;
  logoImage?: string;
  menuLinks?: Array<{ label: string, url: string }>;
  topBarLinks?: Array<{ label: string, icon: string, url: string }>;
  topBarBgColor?: string;
  topBarTextColor?: string;
  categories?: Array<{ id: string, name: string, slug: string | null }>;
  searchBorderColor?: string;
  searchPlaceholder?: string;
  searchBtnText?: string;
  searchBtnBgColor?: string;
  searchBtnTextColor?: string;
  showNew?: boolean;
  showHot?: boolean;
  showSale?: boolean;
  mobileAboutTitle?: string;
  mobileAboutDesc?: string;
  mobileMenuLinks?: Array<{ label: string, url: string }>;
  mobileContactAddress?: string;
  mobileContactPhone?: string;
  mobileContactEmail?: string;
  mobileContactWebsite?: string;
};

export default function Header({ 
  announcement = 'Welcome to Shopelios', 
  logoImage = '',
  menuLinks = [],
  topBarLinks = [
    { label: 'Store Locator', icon: 'location', url: '/store-locator' },
    { label: 'Order Tracking', icon: 'truck', url: '/order-tracking' }
  ],
  topBarBgColor = '#ffffff',
  topBarTextColor = '#4b5563',
  categories = [],
  searchBorderColor = '#d1d5db',
  searchPlaceholder = 'Rechercher un produit...',
  searchBtnText = 'Search',
  searchBtnBgColor = '#f97316',
  searchBtnTextColor = '#111827',
  showNew = true,
  showHot = true,
  showSale = true,
  mobileAboutTitle = '',
  mobileAboutDesc = '',
  mobileMenuLinks = [],
  mobileContactAddress = '',
  mobileContactPhone = '',
  mobileContactEmail = '',
  mobileContactWebsite = '',
}: HeaderProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const cartStore = useCartStore();
  const cartItems = useCartStore((state) => state.getTotalItems());
  const cartTotal = useCartStore((state) => state.getTotalPrice());
  const wishlistItems = useWishlistStore((state) => state.items.length);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Helper pour rendre les icônes
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'location':
        return <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
      case 'truck':
        return <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>;
      case 'phone':
        return <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
      case 'mail':
        return <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case 'star':
      default:
        return <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
    }
  };

  // Bottom categories dropdown
  const [isBottomCategoryOpen, setIsBottomCategoryOpen] = useState(false);
  const bottomCategoryRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
        setIsCategoryDropdownOpen(false);
      }
      if (bottomCategoryRef.current && !bottomCategoryRef.current.contains(event.target as Node)) {
        setIsBottomCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Close mobile menu on resize to desktop
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Hydration mismatch preventer for cart/wishlist icons
  if (!mounted) {
    // Return early or provide a skeleton if needed. Here we just let it mount without numbers first.
  }

  return (
    <header className="w-full bg-white border-b border-gray-300 lg:border-gray-200 shadow-sm lg:shadow-none font-sans relative z-50">
      {/* Top Bar */}
      <div 
        className="hidden md:flex justify-between items-center px-4 py-2 text-sm border-b border-gray-100 max-w-7xl mx-auto w-full transition-colors"
        style={{ backgroundColor: topBarBgColor, color: topBarTextColor }}
      >
        <div>{announcement}</div>
        <div className="flex items-center space-x-6">
          {topBarLinks.map((link, idx) => (
            <Link key={idx} href={link.url} className="flex items-center hover:opacity-75 transition">
              {renderIcon(link.icon)}
              {link.label}
            </Link>
          ))}
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center hover:opacity-75 transition"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Login
          </button>
        </div>
      </div>

      {/* Middle Bar */}
      <div className="py-3 md:py-5 px-4 max-w-7xl mx-auto w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 md:gap-10 lg:gap-16">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center">
            {logoImage ? (
              <img src={logoImage} alt="Shopelios Logo" className="h-16 sm:h-20 md:h-24 object-contain" />
            ) : (
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">LOGO</span>
            )}
          </Link>
        </div>

        {/* Search Bar & Quick Links */}
        <div className="hidden lg:flex flex-1 w-full max-w-3xl flex-col relative order-last lg:order-none" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full rounded-md overflow-hidden bg-white h-11 relative z-20" style={{ border: `1px solid ${searchBorderColor}` }}>
            <input 
              type="text" 
              placeholder={searchPlaceholder} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.length > 1) setShowSearchResults(true); }}
              className="flex-1 px-4 h-full outline-none text-gray-700 placeholder-gray-400"
            />
            
            {/* Category Dropdown Toggle */}
            <div 
              className="relative flex items-center px-3 h-full bg-white text-gray-600 text-sm cursor-pointer hover:bg-gray-50"
              style={{ borderLeft: `1px solid ${searchBorderColor}` }}
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <span className="truncate max-w-[100px] md:max-w-[150px]">
                {selectedCategory === 'all' 
                  ? 'Toutes les catégories' 
                  : categories.find(c => c.id === selectedCategory)?.name || 'Toutes les catégories'}
              </span>
              <svg className="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              
              {/* Category Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-md z-30 max-h-60 overflow-y-auto">
                  <div 
                    className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-gray-700"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Toutes les catégories
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
            
            <button 
              type="submit" 
              className="font-semibold px-6 h-full transition-colors flex items-center justify-center hover:opacity-90"
              style={{ backgroundColor: searchBtnBgColor, color: searchBtnTextColor }}
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: searchBtnTextColor, borderTopColor: 'transparent' }}></div>
              ) : (
                searchBtnText
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
                              <img src={product.images[0]} alt={product.title} className="w-full h-full object-contain p-1" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">{product.title}</h4>
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
                      Voir tous les résultats pour &quot;{searchQuery}&quot;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Aucun produit trouvé pour &quot;{searchQuery}&quot;</p>
                  {selectedCategory !== 'all' && <p className="text-xs mt-1">dans la catégorie sélectionnée.</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wishlist & Cart */}
        <div className="flex items-center flex-shrink-0 space-x-2 md:space-x-4">
          <button 
            onClick={() => router.push('/wishlist')}
            className="hidden lg:flex items-center justify-center p-2 text-gray-700 hover:text-orange-600 transition relative"
            title="Mes favoris"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {mounted && wishlistItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center border-2 border-white shadow-sm">
                {wishlistItems}
              </span>
            )}
          </button>
          
          <div 
            onClick={() => cartStore.setIsOpen(true)}
            className="flex items-center bg-orange-50 rounded-md px-3 md:px-4 py-2 border border-orange-100 cursor-pointer hover:bg-orange-100 transition"
          >
            <div className="relative mr-2 md:mr-3">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {mounted && (
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {cartItems}
                </span>
              )}
            </div>
            <span className="font-bold text-gray-900 text-sm md:text-base ml-1 md:ml-2">{mounted ? `$${cartTotal.toFixed(2)}` : '$0.00'}</span>
          </div>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-orange-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="hidden lg:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between h-14">
          
          <div className="flex items-center h-full space-x-8">
            {/* All Categories Button */}
            <div className="relative h-full" ref={bottomCategoryRef}>
              <button 
                onClick={() => setIsBottomCategoryOpen(!isBottomCategoryOpen)}
                className="bg-orange-500 hover:bg-orange-600 text-gray-900 font-semibold px-6 h-full flex items-center space-x-2 rounded-t-md mt-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                <span>Toutes les catégories</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {isBottomCategoryOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 shadow-xl rounded-b-md rounded-tr-md z-40 py-2">
                  <Link 
                    href="/search" 
                    className="block px-6 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-medium"
                    onClick={() => setIsBottomCategoryOpen(false)}
                  >
                    Toutes les catégories
                  </Link>
                  {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={`/search?category=${cat.id}`}
                      className="block px-6 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      onClick={() => setIsBottomCategoryOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 font-semibold text-gray-800">
              {menuLinks.map((link, idx) => (
                <Link key={idx} href={link.url} className="hover:text-orange-600 flex items-center transition">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side tags */}
          <div className="hidden lg:flex items-center space-x-4 text-sm font-semibold text-gray-800">
            {showNew && (
              <Link href="/new" className="flex items-center hover:text-orange-600 transition">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                New
              </Link>
            )}
            {showHot && (
              <Link href="/hot" className="flex items-center hover:text-orange-600 transition">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Hot
              </Link>
            )}
            {showSale && (
              <Link href="/sale" className="flex items-center hover:text-orange-600 transition">
                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Sale
              </Link>
            )}
          </div>

        </div>
      </div>



      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
      
      <CartDrawer 
        isOpen={cartStore.isOpen}
        onClose={() => cartStore.setIsOpen(false)}
      />

      <MobileBottomNav 
        onSearchClick={() => setIsMobileSearchOpen(true)}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />

      <MobileSearchOverlay 
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        placeholder={searchPlaceholder}
      />

      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        logoImage={logoImage}
        aboutTitle={mobileAboutTitle}
        aboutDesc={mobileAboutDesc}
        menuLinks={mobileMenuLinks}
        contactAddress={mobileContactAddress}
        contactPhone={mobileContactPhone}
        contactEmail={mobileContactEmail}
        contactWebsite={mobileContactWebsite}
      />
    </header>
  );
}
