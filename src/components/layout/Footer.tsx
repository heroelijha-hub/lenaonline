"use client";

import Link from 'next/link';

type FooterProps = {
  supportPhone?: string;
  supportEmail?: string;
};

export default function Footer({ supportPhone = '+08 9229 8228', supportEmail = 'info@shopelios.com' }: FooterProps) {
  return (
    <footer className="bg-[#0B162C] text-gray-300 font-sans pt-16 pb-6 relative">
      <div className="max-w-7xl mx-auto px-4 w-full">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16 border-b border-gray-700/50 pb-12">
          
          {/* Left Column (Locations, Newsletter, Contact) */}
          <div className="w-full lg:w-[30%] space-y-8">
            
            {/* Our Locations */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Our Locations</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <p><span className="text-orange-500 font-medium">Store 1:</span> 2972 Westheimer Rd. Illinois 85486</p>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <p><span className="text-orange-500 font-medium">Store 2:</span> 17 Princess Road, London, Greater London NW1 8JR, UK</p>
                </li>
              </ul>
            </div>

            {/* Newsletter Info */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Newsletter</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Get 15% off your first purchase! Plus, be the first to know about sales new product launches and exclusive offers!
              </p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email..." 
                  className="w-full px-4 py-2 text-sm text-gray-900 bg-white rounded-l outline-none"
                />
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-gray-900 px-4 py-2 rounded-r transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>

            {/* Call Us */}
            <div className="flex items-center space-x-4 pt-2">
              <div className="bg-transparent border border-orange-500 text-orange-500 p-2 rounded-lg">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">Call Us Now <span className="text-orange-500">{supportPhone}</span></p>
                <p className="text-sm text-gray-400">Email: {supportEmail}</p>
              </div>
            </div>

          </div>

          {/* Right Columns (Links Grid) */}
          <div className="w-full lg:w-[65%] grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8">
            
            {/* Column 1 */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-orange-500 transition">About Us</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Our Team</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">FAQs</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Portfolios</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Account</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-orange-500 transition">Shop</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Checkout</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">My account</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Tracking Order</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">On Sale Product</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-orange-500 transition">Shipping & Returns</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Term Of Use</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Vacancies</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Social Share</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Customer Care</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-orange-500 transition">Our Team</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Portfolios</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Tbay List Icons</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Flash Sale</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Tracking Order</Link></li>
              </ul>
            </div>

            {/* Column 5 */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Help & Support</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-orange-500 transition">Shipping Info</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Returns</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">How to Order</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Size Guide</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Newsletter</Link></li>
              </ul>
            </div>

            {/* Column 6 */}
            <div>
              <h3 className="text-white font-bold text-base mb-4">Company Info</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-orange-500 transition">New York</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">London</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Cockfosters</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Los Angeles</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">Chicago</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 pt-2">
          
          <div className="mb-4 md:mb-0">
            © 2025 <span className="text-orange-500 font-semibold">Shopelios</span> All rights reserved.
          </div>
          
          {/* Payment Icons */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="bg-white text-blue-600 font-bold px-1.5 py-0.5 rounded text-[10px]">AMEX</span>
            <span className="bg-white text-black font-bold px-1.5 py-0.5 rounded text-[10px]">Pay</span>
            <span className="bg-white text-gray-800 font-bold px-1.5 py-0.5 rounded text-[10px]">G Pay</span>
            <span className="bg-white text-red-500 font-bold px-1.5 py-0.5 rounded text-[10px]">Master</span>
            <span className="bg-white text-blue-800 font-bold px-1.5 py-0.5 rounded text-[10px]">DPay</span>
            <span className="bg-white text-blue-900 font-bold px-1.5 py-0.5 rounded text-[10px] italic">VISA</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-4">
             <Link href="#" className="hover:text-white transition"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></Link>
             <Link href="#" className="hover:text-white transition"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></Link>
             <Link href="#" className="hover:text-white transition"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></Link>
             <Link href="#" className="hover:text-white transition"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.202 0 3.584.012 4.849.07 1.366.062 2.633.344 3.608 1.319.975.975 1.257 2.242 1.319 3.608.058 1.265.07 1.647.07 4.849s-.012 3.584-.07 4.849c-.062 1.366-.344 2.633-1.319 3.608-.975.975-2.242 1.257-3.608 1.319-1.265.058-1.647.07-4.849.07s-3.584-.012-4.849-.07c-1.366-.062-2.633-.344-3.608-1.319-.975-.975-1.257-2.242-1.319-3.608-.058-1.265-.07-1.647-.07-4.849s.012-3.584.07-4.849c.062-1.366.344-2.633 1.319-3.608.975-.975 2.242-1.257 3.608-1.319 1.265-.058 1.647-.07 4.849-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.947.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.947s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.058-1.689-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></Link>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button 
          className="absolute bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 w-10 h-10 flex items-center justify-center rounded shadow-lg transition"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        </button>

      </div>
    </footer>
  );
}
