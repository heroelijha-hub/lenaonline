import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/actions/pages';
import SafeHTML from '@/components/SafeHTML';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { data: page } = await getPageBySlug(resolvedParams.slug);
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "My Store";
  
  if (!page || !page.isPublished) {
    return {
      title: `Page not found - ${storeName}`,
    };
  }

  return {
    title: `${page.title} - ${storeName}`,
  };
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { data: page, success } = await getPageBySlug(resolvedParams.slug);

  if (!success || !page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
        {/* Basic page header if needed, otherwise leave content free */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">{page.title}</h1>
        
        {/* Container for the custom page */}
        <div className="w-full">
          {/* Desktop Content */}
          <SafeHTML 
            html={page.desktopContent || ''}
            className="hidden md:block w-full prose max-w-none"
          />
          
          {/* Mobile Content */}
          <SafeHTML 
            html={page.mobileContent || (page.desktopContent || '')}
            className="block md:hidden w-full prose max-w-none"
          />
        </div>
      </main>
    </div>
  );
}
