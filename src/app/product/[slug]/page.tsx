import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Composant interne pour l'étoile
const Star = ({ filled = true }: { filled?: boolean }) => (
  <svg 
    className={`w-4 h-4 ${filled ? 'text-orange-500' : 'text-gray-300'}`} 
    fill="currentColor" 
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true }
  });

  if (!product) {
    return notFound();
  }

  // Related products (same category)
  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    include: { category: true },
    take: 4,
  });

  const hasImages = product.images && product.images.length > 0;
  const mainImage = hasImages ? product.images[0] : null;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <Header />
      
      <main className="flex-grow pb-20">
        {/* Breadcrumb */}
        <div className="bg-gray-50 py-4 px-4 sm:px-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span className="mx-2">/</span>
            <span className="hover:text-orange-500 cursor-pointer">{product.category?.name || 'Category'}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column: Gallery */}
            <div className="w-full lg:w-1/2 flex gap-4">
              {/* Thumbnails (Vertical) */}
              <div className="flex flex-col gap-3 w-20">
                <button className="w-full py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-100 flex justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                
                {hasImages ? (
                  product.images.slice(0, 5).map((img, idx) => (
                    <div key={idx} className={`border-2 rounded overflow-hidden cursor-pointer h-20 w-20 flex-shrink-0 ${idx === 0 ? 'border-orange-500' : 'border-transparent hover:border-gray-300'}`}>
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="border-2 border-orange-500 rounded h-20 w-20 bg-gray-100 flex items-center justify-center text-2xl">🛍️</div>
                )}
                
                <button className="w-full py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-100 flex justify-center mt-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              {/* Main Image */}
              <div className="flex-1 border border-gray-200 rounded-lg relative overflow-hidden flex items-center justify-center bg-white min-h-[400px]">
                {product.discountLabel && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    {product.discountLabel}
                  </span>
                )}
                {mainImage ? (
                  <img src={mainImage} alt={product.title} className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-9xl text-gray-300">🛍️</div>
                )}
              </div>
            </div>

            {/* Right Column: Product Info */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <h1 className="text-3xl font-bold mb-4 leading-tight">{product.title}</h1>
              
              {/* Reviews & Sold */}
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => <Star key={i} />)}
                  </div>
                  <span className="ml-1 text-gray-600">1 customer review</span>
                </div>
                <span className="border-l border-gray-300 h-4"></span>
                <span>Sold: <span className="font-semibold text-gray-900">24</span></span>
              </div>

              {/* Price */}
              <div className="mb-6">
                {product.compareAtPrice && (
                  <span className="text-2xl text-gray-400 line-through mr-3">${product.compareAtPrice.toFixed(2)}</span>
                )}
                <span className="text-3xl font-bold text-red-600">${product.price.toFixed(2)}</span>
              </div>

              {/* Features list (Mocked for now since schema has generic attributes) */}
              <ul className="list-disc pl-5 mb-6 text-sm text-gray-600 space-y-2">
                <li>RAM: 16GB</li>
                <li>Hard Drive: 256GB SSD</li>
                <li>Screen Size: 13.3 inches</li>
              </ul>

              {/* Color Swatches */}
              <div className="mb-6">
                <span className="text-sm text-gray-500 mb-2 block">color : <span className="text-gray-900 font-semibold">Black</span></span>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-black border-2 border-white ring-2 ring-black cursor-pointer flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-700 cursor-pointer border border-gray-200"></div>
                  <div className="w-8 h-8 rounded-full bg-pink-500 cursor-pointer border border-gray-200"></div>
                </div>
              </div>

              {/* Short Description */}
              {product.shortDescription ? (
                <div 
                  className="text-sm text-gray-600 mb-6 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                />
              ) : (
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Aucune description courte disponible pour ce produit.
                </p>
              )}

              {/* Stock status */}
              <p className="text-teal-600 font-semibold mb-6">
                {product.stock === null ? 'En stock' : `${product.stock} in stock`}
              </p>

              {/* Actions (Quantity + Cart + Buy) */}
              <div className="flex gap-4 mb-8">
                {/* Qty */}
                <div className="flex border border-gray-300 rounded-md overflow-hidden bg-gray-50 w-32">
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-200 font-bold">-</button>
                  <input type="text" value="1" readOnly className="w-full text-center bg-transparent font-semibold border-x border-gray-300" />
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-200 font-bold">+</button>
                </div>
                
                <button className="flex-1 bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold rounded-md transition shadow-sm">
                  Add to Cart
                </button>
                
                <button className="flex-1 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-md transition shadow-sm">
                  Buy Now
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex flex-wrap gap-3 mb-8">
                <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 bg-orange-50/50 px-4 py-2 rounded-md border border-orange-100 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  Add to wishlist
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 bg-orange-50/50 px-4 py-2 rounded-md border border-orange-100 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  Compare
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 bg-orange-50/50 px-4 py-2 rounded-md border border-orange-100 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Ask a Question
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 bg-orange-50/50 px-4 py-2 rounded-md border border-orange-100 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Delivery Return
                </button>
              </div>

              {/* Meta tags */}
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold text-gray-900">SKU:</span> {product.id.split('-')[0].toUpperCase()}</p>
                <p><span className="font-semibold text-gray-900">Categories:</span> {product.category?.name || 'Uncategorized'}</p>
                <p><span className="font-semibold text-gray-900">Tags:</span> Shopelios, Featured</p>
              </div>

            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-20">
            <div className="flex justify-center border-b border-gray-200 mb-8">
              <button className="px-8 py-4 text-sm font-bold text-gray-900 border-b-2 border-orange-500">
                Description
              </button>
              <button className="px-8 py-4 text-sm font-semibold text-gray-500 hover:text-gray-900">
                Reviews (1)
              </button>
            </div>
            <div className="max-w-4xl mx-auto text-sm text-gray-700 leading-relaxed space-y-6">
              {product.description ? (
                <div 
                  className="prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: product.description }} 
                />
              ) : (
                <div className="whitespace-pre-wrap">Aucune description détaillée.</div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          <div className="mt-20">
            <div className="border-b border-gray-200 pb-4 mb-8">
              <h2 className="text-xl font-bold text-gray-900">Related products</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.length > 0 ? (
                relatedProducts.map(rp => (
                  <Link href={`/product/${rp.slug}`} key={rp.id} className="group border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition flex flex-col">
                    <div className="relative h-48 w-full flex items-center justify-center mb-4">
                      {rp.images && rp.images[0] ? (
                        <img src={rp.images[0]} alt={rp.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="text-6xl text-gray-300">🛍️</div>
                      )}
                    </div>
                    <div className="mt-auto">
                      <p className="text-xs text-blue-500 font-semibold mb-1">{rp.category?.name}</p>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-500 transition">{rp.title}</h3>
                      <p className="font-bold text-red-600">${rp.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No related products found.</p>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
