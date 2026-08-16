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
          <div 
            className="rounded-xl overflow-hidden p-8 flex flex-col justify-center h-48 border border-gray-200 relative group"
            style={{
              backgroundColor: config.BANNER_1_BG_COLOR || '#ffedd5',
              backgroundImage: config.BANNER_1_BG_IMAGE ? `url(${config.BANNER_1_BG_IMAGE})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="z-10 relative">
              <h3 className="text-2xl font-bold mb-2" style={{ color: config.BANNER_1_TEXT_COLOR || '#111827' }}>
                {config.BANNER_1_TITLE}
              </h3>
              <Link 
                href={config.BANNER_1_LINK || '/#'} 
                className="font-bold hover:underline inline-block"
                style={{ color: config.BANNER_1_TEXT_COLOR || '#ea580c' }}
              >
                Shop Now &rarr;
              </Link>
            </div>
            {config.BANNER_1_IMAGE && (
              <img src={config.BANNER_1_IMAGE} alt={config.BANNER_1_TITLE} className="absolute right-4 top-1/2 -translate-y-1/2 h-4/5 object-contain group-hover:scale-105 transition-transform duration-500 z-0" />
            )}
          </div>
        )}

        {/* Banner 2 */}
        {config?.BANNER_2_TITLE && (
          <div 
            className="rounded-xl overflow-hidden p-8 flex flex-col justify-center h-48 border border-gray-200 relative group"
            style={{
              backgroundColor: config.BANNER_2_BG_COLOR || '#f3f4f6',
              backgroundImage: config.BANNER_2_BG_IMAGE ? `url(${config.BANNER_2_BG_IMAGE})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="z-10 relative">
              <h3 className="text-2xl font-bold mb-2" style={{ color: config.BANNER_2_TEXT_COLOR || '#111827' }}>
                {config.BANNER_2_TITLE}
              </h3>
              <Link 
                href={config.BANNER_2_LINK || '/#'} 
                className="font-bold hover:underline inline-block"
                style={{ color: config.BANNER_2_TEXT_COLOR || '#111827' }}
              >
                Shop Now &rarr;
              </Link>
            </div>
            {config.BANNER_2_IMAGE && (
              <img src={config.BANNER_2_IMAGE} alt={config.BANNER_2_TITLE} className="absolute right-4 top-1/2 -translate-y-1/2 h-4/5 object-contain group-hover:scale-105 transition-transform duration-500 z-0" />
            )}
          </div>
        )}

      </div>
    </section>
  );
}
