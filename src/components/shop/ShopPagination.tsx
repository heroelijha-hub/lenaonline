'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function ShopPagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-12 mb-8">
      <nav className="flex items-center gap-2">
        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded border ${
              page === currentPage
                ? 'bg-orange-500 text-white border-orange-500 font-bold'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            } transition-colors`}
          >
            {page}
          </button>
        ))}
        {/* Simple next button if needed */}
        {currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="w-10 h-10 flex items-center justify-center rounded border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </nav>
    </div>
  );
}
