'use client';
import React, { useState, useEffect, useRef } from 'react';

type Props = {
  children: React.ReactNode;
  colsMobile: number;
  colsTablet: number;
  colsDesktop: number;
};

export default function DynamicProductGrid({ children, colsMobile, colsTablet, colsDesktop }: Props) {
  const [mode, setMode] = useState<'grid' | 'slider'>('grid');
  const [cols, setCols] = useState(colsDesktop);
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = React.Children.toArray(children);
  const totalItems = items.length;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let currentCols = colsDesktop;
      if (width < 768) {
        currentCols = colsMobile;
      } else if (width < 1024) {
        currentCols = colsTablet;
      }
      setCols(currentCols);
      
      if (totalItems > currentCols) {
        setMode('slider');
      } else {
        setMode('grid');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [colsDesktop, colsTablet, colsMobile, totalItems]);

  // Auto slide logic for slider mode
  useEffect(() => {
    if (mode !== 'slider') return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth / cols, behavior: 'smooth' });
        }
      }
    }, 4000); // Autoslide every 4s
    return () => clearInterval(interval);
  }, [mode, cols]);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -(scrollRef.current.clientWidth / cols), behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: (scrollRef.current.clientWidth / cols), behavior: 'smooth' });
  };

  if (totalItems === 0) return null;

  if (mode === 'grid') {
    return (
      <div 
        className="grid gap-4" 
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {items}
      </div>
    );
  }

  // Slider mode
  return (
    <div className="relative group">
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth pb-4"
      >
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className="flex-none snap-start"
            style={{ width: `calc((100% - ${(cols - 1) * 16}px) / ${cols})` }}
          >
            {item}
          </div>
        ))}
      </div>
      
      {/* Navigation Arrows */}
      <button 
        onClick={scrollLeft} 
        className="absolute top-[40%] -left-5 transform -translate-y-1/2 bg-white text-gray-900 border shadow-lg rounded-full w-10 h-10 md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-orange-500 hover:text-white hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button 
        onClick={scrollRight} 
        className="absolute top-[40%] -right-5 transform -translate-y-1/2 bg-white text-gray-900 border shadow-lg rounded-full w-10 h-10 md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-orange-500 hover:text-white hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}
