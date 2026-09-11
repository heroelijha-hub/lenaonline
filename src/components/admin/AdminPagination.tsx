'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function AdminPagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
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
    <div className="flex justify-between items-center mt-6">
      <span className="text-sm text-gray-600">
        Page {currentPage} sur {totalPages}
      </span>
      <nav className="flex items-center gap-1">
        {currentPage > 1 && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1.5 flex items-center justify-center rounded border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Précédent
          </button>
        )}
        {pages.map(page => {
          // Logic to show a limited number of pages could go here (e.g. 1 2 ... 7 8 9 ... 20)
          // For now, we display them all or up to a reasonable limit.
          if (
            page === 1 || 
            page === totalPages || 
            (page >= currentPage - 2 && page <= currentPage + 2)
          ) {
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`min-w-[32px] h-8 flex items-center justify-center rounded border px-2 text-sm ${
                  page === currentPage
                    ? 'bg-orange-500 text-white border-orange-500 font-bold'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                } transition-colors`}
              >
                {page}
              </button>
            );
          } else if (
            page === currentPage - 3 || 
            page === currentPage + 3
          ) {
            return <span key={page} className="px-1 text-gray-500">...</span>;
          }
          return null;
        })}
        {currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1.5 flex items-center justify-center rounded border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Suivant
          </button>
        )}
      </nav>
    </div>
  );
}
