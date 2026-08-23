import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/actions/pages';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: page } = await getPageBySlug(params.slug);
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

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const { data: page, success } = await getPageBySlug(params.slug);

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
          <div 
            className="hidden md:block w-full prose max-w-none"
            dangerouslySetInnerHTML={{ __html: page.desktopContent || '' }}
          />
          
          {/* Mobile Content */}
          <div 
            className="block md:hidden w-full prose max-w-none"
            dangerouslySetInnerHTML={{ __html: page.mobileContent || (page.desktopContent || '') }}
          />
        </div>
      </main>
    </div>
  );
}
