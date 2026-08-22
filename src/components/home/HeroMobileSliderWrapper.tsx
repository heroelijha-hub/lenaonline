'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function HeroMobileSliderWrapper({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const childrenArray = React.Children.toArray(children).filter(child => {
    return React.isValidElement(child);
  });

  const childCount = childrenArray.length;

  useEffect(() => {
    if (childCount <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % childCount;
        if (scrollRef.current) {
          const childWidth = scrollRef.current.clientWidth;
          scrollRef.current.scrollTo({
            left: next * childWidth,
            behavior: 'smooth'
          });
        }
        return next;
      });
    }, 4000); // Autoslide every 4 seconds

    return () => clearInterval(interval);
  }, [childCount]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const childWidth = scrollRef.current.clientWidth;
      const index = Math.round(scrollLeft / childWidth);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  if (childCount === 0) return null;

  if (childCount === 1) {
    return <div className="w-full lg:hidden">{children}</div>;
  }

  return (
    <div className="relative w-full h-auto lg:hidden group">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />
        {React.Children.map(children, (child, index) => (
          <div className="w-full h-full flex-shrink-0 snap-center relative">
            {child}
          </div>
        ))}
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
        {Array.from({ length: childCount }).map((_, i) => (
          <div 
            key={i} 
            className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-orange-500' : 'w-2 bg-gray-300/80'}`}
          />
        ))}
      </div>
    </div>
  );
}
