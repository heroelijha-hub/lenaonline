import Hero from '@/components/home/Hero';
import BestDeals from '@/components/home/BestDeals';
import BestSeller from '@/components/home/BestSeller';
import LatestBlogs from '@/components/home/LatestBlogs';
import Newsletter from '@/components/home/Newsletter';
import PromoBanners from '@/components/home/PromoBanners';
import ProductGrid from '@/components/home/ProductGrid';
import { SectionConfig, SectionType } from '@/app/admin/(dashboard)/landing/LandingForm';
import PreviewSectionWrapper from '@/components/admin/PreviewSectionWrapper';
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
    let content = null;
    switch (section.type) {
      case 'Hero':
        content = <Hero config={section.settings} />;
        break;
      case 'BestDeals':
        content = <BestDeals config={section.settings} />;
        break;
      case 'BestSeller':
        content = <BestSeller config={section.settings} />;
        break;
      case 'LatestBlogs':
        content = <LatestBlogs config={section.settings} />;
        break;
      case 'Newsletter':
        content = <Newsletter config={section.settings} />;
        break;
      case 'PromoBanners':
        content = <PromoBanners config={section.settings} />;
        break;
      case 'ProductGrid':
        content = <ProductGrid config={section.settings} />;
        break;
      default:
        return null;
    }

    return (
      <PreviewSectionWrapper key={section.id} sectionId={section.id} sectionName={section.name || section.type}>
        {content}
      </PreviewSectionWrapper>
    );
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
