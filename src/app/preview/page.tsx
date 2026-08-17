import Hero from '@/components/home/Hero';
import BestDeals from '@/components/home/BestDeals';
import BestSeller from '@/components/home/BestSeller';
import LatestBlogs from '@/components/home/LatestBlogs';
import Newsletter from '@/components/home/Newsletter';
import PromoBanners from '@/components/home/PromoBanners';
import ProductGrid from '@/components/home/ProductGrid';
import { SectionConfig } from '@/app/admin/landing/LandingForm';
import { cookies } from 'next/headers';
import { getSettings } from '@/actions/settings';

export const dynamic = 'force-dynamic';

export default async function PreviewPage() {
  const cookieStore = await cookies();
  const layoutCookie = cookieStore.get('preview_layout');
  
  let layout: SectionConfig[] = [];
  if (layoutCookie && layoutCookie.value) {
    try {
      layout = JSON.parse(layoutCookie.value);
    } catch (e) {
      console.error(e);
    }
  } else {
    const settings = await getSettings();
    if (settings.HOMEPAGE_LAYOUT) {
      layout = JSON.parse(settings.HOMEPAGE_LAYOUT);
    }
  }

  const activeSections = layout.filter(s => s.enabled);

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case 'Hero':
        return <Hero key={section.id} config={section.settings} />;
      case 'BestDeals':
        return <BestDeals key={section.id} config={section.settings} />;
      case 'BestSeller':
        return <BestSeller key={section.id} config={section.settings} />;
      case 'LatestBlogs':
        return <LatestBlogs key={section.id} config={section.settings} />;
      case 'Newsletter':
        return <Newsletter key={section.id} config={section.settings} />;
      case 'PromoBanners':
        return <PromoBanners key={section.id} config={section.settings} />;
      case 'ProductGrid':
        return <ProductGrid key={section.id} config={section.settings} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main>
        {activeSections.length > 0 ? activeSections.map(renderSection) : (
          <div className="flex items-center justify-center h-64 text-gray-400">Aucune section active.</div>
        )}
      </main>
    </div>
  );
}
