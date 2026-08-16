import Link from 'next/link';

export default function PromoBanners({ config }: { config?: any }) {
  // Only render if at least one title is configured
  if (!config?.BANNER_1_TITLE && !config?.BANNER_2_TITLE) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 w-full py-8 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Banner 1 */}
        {config?.BANNER_1_TITLE && (
          <div className="bg-orange-100 rounded-xl overflow-hidden p-8 flex flex-col justify-center h-48 border border-orange-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.BANNER_1_TITLE}</h3>
            <Link 
              href={config.BANNER_1_LINK || '/#'} 
              className="text-orange-600 font-bold hover:underline"
            >
              Shop Now &rarr;
            </Link>
          </div>
        )}

        {/* Banner 2 */}
        {config?.BANNER_2_TITLE && (
          <div className="bg-gray-100 rounded-xl overflow-hidden p-8 flex flex-col justify-center h-48 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.BANNER_2_TITLE}</h3>
            <Link 
              href={config.BANNER_2_LINK || '/#'} 
              className="text-gray-900 font-bold hover:underline"
            >
              Shop Now &rarr;
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
