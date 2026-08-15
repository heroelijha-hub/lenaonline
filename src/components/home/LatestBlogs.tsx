import Link from 'next/link';

const blogs = [
  {
    id: 1,
    imagePlaceholder: 'bg-green-100',
    icon: '🏃‍♂️',
    category: 'Fashion',
    title: 'What Does It Really Mean For A Site To Be Keyboard Navigable',
    date: '2 May-2025',
    comments: 0,
  },
  {
    id: 2,
    imagePlaceholder: 'bg-gray-200',
    icon: '⌚',
    category: 'Accessories',
    title: 'Our Boosting Up Your Creativity Without Endless Reference',
    date: '2 May-2025',
    comments: 0,
  },
  {
    id: 3,
    imagePlaceholder: 'bg-teal-100',
    icon: '👗',
    category: 'Electronics',
    title: 'How A Bottom-Up Design Approach Enhances Site...',
    date: '2 May-2025',
    comments: 0,
  },
  {
    id: 4,
    imagePlaceholder: 'bg-orange-50',
    icon: '🛋️',
    category: 'Fashion',
    title: 'Building An Offline-Friendly Image are Upload System',
    date: '2 May-2025',
    comments: 2,
  },
];

export default function LatestBlogs() {
  return (
    <section className="max-w-7xl mx-auto px-4 w-full py-12 font-sans">
      
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Our Latest Blogs</h2>
        <Link href="/blogs" className="flex items-center text-sm font-semibold text-gray-900 hover:text-orange-500 transition">
          See All
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="flex flex-col group cursor-pointer">
            {/* Image Placeholder */}
            <div className={`w-full aspect-[4/3] rounded-xl mb-4 ${blog.imagePlaceholder} flex items-center justify-center overflow-hidden`}>
               <div className="text-6xl group-hover:scale-110 transition duration-500">{blog.icon}</div>
            </div>
            
            {/* Category Badge */}
            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded">
                {blog.category}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 group-hover:text-orange-500 transition line-clamp-2">
              {blog.title}
            </h3>
            
            {/* Metadata */}
            <div className="flex items-center text-sm text-gray-500 mt-auto">
              <span>{blog.date}</span>
              <span className="mx-2">/</span>
              <span>Comments: {blog.comments}</span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
