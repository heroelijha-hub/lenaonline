export default function Newsletter() {
  return (
    <div className="w-full border-t border-gray-200 mt-8 font-sans">
      <section className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Text */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join Our <span className="text-gray-900">Newsletter</span> For <span className="text-gray-900">$10</span> Offer
          </h2>
          <p className="text-gray-500 text-sm">
            Register Now To Get Latest Updates On Promotions & Coupons.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 w-full max-w-lg">
          <form className="flex items-center w-full">
            <input 
              type="email" 
              placeholder="enter your e-mail ..." 
              className="flex-1 bg-gray-50 border border-gray-100 rounded-l-md px-4 py-3 h-12 text-sm text-gray-700 outline-none focus:border-orange-300 transition"
              required
            />
            <button 
              type="submit" 
              className="bg-[#FF5C00] hover:bg-[#E55300] text-white font-bold px-8 h-12 rounded-r-md transition shadow-sm"
            >
              Subscribe
            </button>
          </form>
        </div>

      </section>
    </div>
  );
}
