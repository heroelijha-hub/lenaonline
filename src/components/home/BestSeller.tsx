import Link from 'next/link';

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

const SmallCard = ({ icon, title, price }: { icon: string, title: string, price: string }) => (
  <div className="flex flex-col group cursor-pointer">
    <div className="border border-gray-100 rounded-xl mb-3 aspect-square flex items-center justify-center p-4 bg-white shadow-sm group-hover:shadow-md transition">
      <div className="text-5xl group-hover:scale-110 transition duration-500">{icon}</div>
    </div>
    <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-orange-500 transition">
      {title}
    </h3>
    <p className="text-sm font-bold text-gray-900">{price}</p>
  </div>
);

const BigCard = ({ 
  icon, category, title, price, rating, ratingText 
}: { 
  icon: string, category: string, title: string, price: string, rating: number, ratingText: string 
}) => (
  <div className="border border-gray-200 rounded-xl p-5 flex flex-col h-full group cursor-pointer hover:shadow-lg transition bg-white">
    <div className="flex-1 flex items-center justify-center mb-6 py-10 bg-gray-50/50 rounded-lg">
      <div className="text-8xl group-hover:scale-110 transition duration-500">{icon}</div>
    </div>
    <div className="mt-auto">
      <p className="text-xs text-gray-500 mb-1">{category}</p>
      <h3 className="text-base font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-500 transition">
        {title}
      </h3>
      <div className="flex items-center gap-1 mb-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} filled={star <= rating} />
          ))}
        </div>
        <span className="text-xs text-gray-500">{ratingText}</span>
      </div>
      <p className="font-bold text-gray-900">{price}</p>
    </div>
  </div>
);

export default function BestSeller() {
  return (
    <section className="max-w-7xl mx-auto px-4 w-full py-12 font-sans">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Our Best Seller</h2>
        <Link href="/best-seller" className="flex items-center text-sm font-semibold text-gray-900 hover:text-orange-500 transition">
          See All
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Column 1: Big Card */}
        <div className="col-span-1">
          <BigCard 
            icon="👟" 
            category="Cosmetics" 
            title="Comfortable Regular Comfort Sports Sneakers" 
            price="$33.00" 
            rating={5} 
            ratingText="(5.00)" 
          />
        </div>

        {/* Column 2: 2x2 Small Cards */}
        <div className="col-span-1 grid grid-cols-2 grid-rows-2 gap-4">
          <SmallCard icon="📱" title="256GB iphone 16 pro max Ratina..." price="$18.00" />
          <SmallCard icon="👟" title="Niki Dust & Water Proof Comfort..." price="$19.00" />
          <SmallCard icon="🍯" title="Heinz Portion Healthy Food For..." price="$18.00" />
          <SmallCard icon="⌚" title="Explore Pixel and Samsung Watche..." price="$33.00 - $59.00" />
        </div>

        {/* Column 3: Big Card */}
        <div className="col-span-1">
          <BigCard 
            icon="🧀" 
            category="Cosmetics" 
            title="Comfortable Regular Comfort Sports Sneakers" 
            price="$35.00" 
            rating={3} 
            ratingText="(3.00)" 
          />
        </div>

        {/* Column 4: 2x2 Small Cards */}
        <div className="col-span-1 grid grid-cols-2 grid-rows-2 gap-4">
          <SmallCard icon="🩳" title="Short Blue Pant Regular Swimmin..." price="$18.00" />
          <SmallCard icon="🧀" title="Comfortable Regular Comfort..." price="$35.00" />
          <SmallCard icon="🎒" title="Water Proof Travel Bagpack" price="$34.00" />
          <SmallCard icon="👟" title="Comfortable Regular Comfort..." price="$33.00" />
        </div>

      </div>

    </section>
  );
}
