'use client';
import { useRef, useEffect, ReactNode } from 'react';

export default function ProductSliderWrapper({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto slide logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth > 600 ? 320 : 266, behavior: 'smooth' });
        }
      }
    }, 4000); // Autoslide every 4s

    return () => clearInterval(interval);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth pb-4"
      >
        {children}
      </div>

      {/* Navigation Arrows (Visible only on hover on Desktop) */}
      <button 
        onClick={scrollLeft}
        className="absolute top-[40%] -left-5 transform -translate-y-1/2 bg-white text-gray-900 border shadow-lg rounded-full w-10 h-10 md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 z-10 hover:bg-orange-500 hover:text-white hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      <button 
        onClick={scrollRight}
        className="absolute top-[40%] -right-5 transform -translate-y-1/2 bg-white text-gray-900 border shadow-lg rounded-full w-10 h-10 md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 z-10 hover:bg-orange-500 hover:text-white hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}
