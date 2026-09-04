'use client';

import React from 'react';

interface HeroPreviewEditButtonProps {
  sectionId: string;
  blockNum: number;
}

export default function HeroPreviewEditButton({ sectionId, blockNum }: HeroPreviewEditButtonProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Notify the parent window (admin dashboard) that this specific block wants to be edited
    window.parent.postMessage({
      type: 'EDIT_SECTION',
      sectionId: sectionId,
      blockNum: blockNum
    }, '*');
  };

  return (
    <button
      onClick={handleEditClick}
      className="absolute top-2 right-2 z-50 bg-purple-600 text-white p-2 rounded-full pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-700 hover:scale-105 shadow-lg flex items-center justify-center"
      title={`Edit Block ${blockNum}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  );
}
