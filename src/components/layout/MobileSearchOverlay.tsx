'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type MobileSearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
};

export default function MobileSearchOverlay({ isOpen, onClose, placeholder = 'Rechercher un produit...' }: MobileSearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when overlay opens
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] lg:hidden bg-white/95 backdrop-blur-sm transition-opacity flex flex-col pt-4 animate-in fade-in duration-200">
      
      {/* Top Bar with Close Button */}
      <div className="flex justify-end px-4 mb-4">
        <button 
          onClick={onClose}
          className="w-10 h-10 bg-orange-600 hover:bg-orange-700 text-white rounded-md flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Input Area */}
      <div className="px-4 w-full">
        <form onSubmit={handleSubmit} className="relative w-full flex">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 w-full h-14 pl-4 pr-16 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg shadow-sm"
          />
          <button 
            type="submit"
            className="absolute right-0 top-0 h-14 w-14 bg-gray-900 hover:bg-gray-800 text-white rounded-r-md flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  );
}
