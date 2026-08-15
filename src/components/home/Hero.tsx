import Link from 'next/link';

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4 w-full py-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
        
        {/* Left Tall Banner (Apple iPhone 17 Pro Max) */}
        <div className="lg:col-span-4 rounded-xl overflow-hidden bg-[#FFF5EE] relative p-8 flex flex-col items-center text-center h-full border border-gray-100 group">
          <div className="z-10 relative mt-4">
            <span className="text-red-500 font-bold text-sm tracking-wider uppercase mb-3 block">Supper Discount</span>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Apple Iphone 17 Pro Max</h2>
            <p className="text-gray-600 mb-6 text-lg">from <span className="font-bold text-2xl text-slate-900">$349.99</span></p>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-2.5 rounded shadow-sm transition-transform transform hover:scale-105">
              Shop Now
            </button>
          </div>
          {/* Placeholder for Image */}
          <div className="absolute bottom-[-10%] w-full h-[60%] bg-orange-400 rounded-t-3xl mt-auto translate-y-10 group-hover:translate-y-4 transition-transform duration-500">
            {/* Abstract shape representing the phone */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4/5 h-full bg-orange-500 rounded-3xl shadow-xl border-4 border-orange-300">
                <div className="absolute top-6 left-6 w-16 h-16 bg-orange-700/40 rounded-2xl flex flex-wrap p-2 gap-1">
                   <div className="w-5 h-5 bg-black rounded-full"></div>
                   <div className="w-5 h-5 bg-black rounded-full"></div>
                   <div className="w-5 h-5 bg-black rounded-full"></div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Section (Grid of 3 banners) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          
          {/* Top Row (Two Banners) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full lg:h-[50%]">
            
            {/* Middle Top Banner (Watches) */}
            <div className="bg-[#F8F9FA] rounded-xl overflow-hidden relative p-8 flex flex-col justify-center border border-gray-100 group">
              <div className="z-10 w-2/3">
                <span className="text-gray-500 text-sm font-semibold mb-2 block uppercase tracking-wide">Use Code: <span className="text-red-500">SALE35%</span></span>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 leading-tight">Heavy On Features<br/>Light On Price</h2>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-2 rounded shadow-sm transition-transform transform hover:scale-105">
                  Shop Now
                </button>
              </div>
              {/* Placeholder for Image */}
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-8 border-gray-200 bg-white shadow-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                 <div className="text-center font-bold text-3xl">12<br/>9 3<br/>6</div>
              </div>
            </div>

            {/* Right Top Banner (Speaker) */}
            <div className="bg-[#F8F9FA] rounded-xl overflow-hidden relative p-8 flex flex-col justify-center border border-gray-100 group">
              <div className="z-10 w-2/3">
                <span className="text-red-500 font-bold text-sm tracking-wider uppercase mb-2 block">New Product</span>
                <h2 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">Sale 10%<br/>Off Speaker</h2>
                <p className="text-gray-500 text-xs mb-6 font-semibold uppercase tracking-wide">Limited Time Offer *</p>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-2 rounded shadow-sm transition-transform transform hover:scale-105">
                  Shop Now
                </button>
              </div>
              {/* Placeholder for Image */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 bg-zinc-800 rounded-3xl translate-x-4 shadow-2xl flex items-center justify-center group-hover:-translate-x-2 transition-transform duration-500">
                 <span className="text-zinc-600 font-bold text-2xl -rotate-90">XBOOM</span>
              </div>
            </div>
            
          </div>

          {/* Bottom Row Banner (Headphones) */}
          <div className="bg-[#FFF5EE] rounded-xl overflow-hidden relative p-8 flex flex-col justify-center h-full lg:h-[50%] border border-gray-100 group">
            <div className="z-10 w-1/2 lg:pl-4">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 leading-tight">Headphones Listen With<br/>Heart</h2>
              <p className="text-slate-600 mb-6 font-medium">Last call for up to <span className="text-red-500">25% off</span></p>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-2.5 rounded shadow-sm transition-transform transform hover:scale-105">
                Shop Now
              </button>
            </div>
             {/* Placeholder for Image */}
             <div className="absolute right-4 md:right-16 -bottom-10 w-64 h-64 transition-transform duration-500 group-hover:-translate-y-4">
               {/* Abstract headphones */}
               <div className="absolute inset-x-8 top-0 h-32 border-[12px] border-red-500 rounded-t-[4rem] border-b-0"></div>
               <div className="absolute bottom-8 left-4 w-20 h-28 bg-pink-300 rounded-[2rem] shadow-lg rotate-12"></div>
               <div className="absolute bottom-8 right-4 w-20 h-28 bg-pink-300 rounded-[2rem] shadow-lg -rotate-12"></div>
             </div>
          </div>

        </div>

      </div>
    </section>
  );
}
