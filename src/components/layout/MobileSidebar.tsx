'use client';
import Image from 'next/image';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  logoImage?: string;
  logoHeight?: string;
  aboutTitle: string;
  aboutDesc: string;
  menuLinks: Array<{ label: string, url: string }>;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;
  categories?: Array<{ id: string, name: string, slug: string | null }>;
};

export default function MobileSidebar({
  isOpen,
  onClose,
  logoImage,
  logoHeight = '64',
  aboutTitle,
  aboutDesc,
  menuLinks,
  contactAddress,
  contactPhone,
  contactEmail,
  contactWebsite,
  categories = [],
}: MobileSidebarProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const t = useTranslations('MobileSidebar');

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex lg:hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300 z-10">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" onClick={onClose} className="block">
            {logoImage ? (
              <Image src={logoImage} alt="Logo" width={200} height={80} className="object-contain" style={{ width: 'auto', height: `${logoHeight}px` }} />
            ) : (
              <span className="text-2xl font-extrabold text-gray-900">LOGO</span>
            )}
          </Link>
        </div>

        {/* About Section */}
        {aboutTitle && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{aboutTitle}</h3>
            {aboutDesc && <p className="text-sm text-gray-600 leading-relaxed">{aboutDesc}</p>}
          </div>
        )}

        {/* Menu Links & Categories */}
        <nav className="p-4 border-b border-gray-100 flex-1">
          <ul className="space-y-1">
            {/* First Link (Home/Startseite) */}
            {menuLinks.length > 0 && (
              <li>
                <Link 
                  href={menuLinks[0].url}
                  onClick={onClose}
                  className="block px-4 py-3 text-base font-semibold text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                >
                  {menuLinks[0].label}
                </Link>
              </li>
            )}
            
            {/* Categories Accordion */}
            {categories && categories.length > 0 && (
              <li>
                <button 
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-base font-semibold text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                >
                  {t('categories')}
                  <svg className={`w-5 h-5 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isCategoriesOpen && (
                  <ul className="mt-1 ml-4 space-y-1 border-l-2 border-orange-100 pl-2">
                    <li>
                      <Link 
                        href="/search"
                        onClick={onClose}
                        className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-orange-600 rounded-lg transition-colors"
                      >
                        {t('all_categories')}
                      </Link>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link 
                          href={`/product-category/${cat.slug || cat.id}`}
                          onClick={onClose}
                          className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-orange-600 rounded-lg transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}

            {/* Rest of the Links */}
            {menuLinks.slice(1).map((link, idx) => (
              <li key={`rest-${idx}`}>
                <Link 
                  href={link.url}
                  onClick={onClose}
                  className="block px-4 py-3 text-base font-semibold text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact Info */}
        <div className="p-6 bg-gray-50 mt-auto">
          <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('contact')}</h4>
          <ul className="space-y-4">
            {contactAddress && (
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-sm text-gray-600">{contactAddress}</span>
              </li>
            )}
            {contactPhone && (
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span className="text-sm text-gray-600">{contactPhone}</span>
              </li>
            )}
            {contactEmail && (
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-sm text-gray-600">{contactEmail}</span>
              </li>
            )}
            {contactWebsite && (
              <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                <span className="text-sm text-gray-600">{contactWebsite}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
