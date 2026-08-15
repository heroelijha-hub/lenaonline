import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative bg-white overflow-hidden pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-10 sm:pt-16 lg:pt-20">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Redéfinissez votre style</span>{' '}
                <span className="block text-indigo-600 xl:inline">avec Shopelios</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Découvrez notre nouvelle collection conçue pour allier confort, élégance et modernité. 
                Profitez de la livraison gratuite sur votre première commande.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-full shadow">
                  <Link href="/nouveautes" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105">
                    Découvrir
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="/promotions" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105">
                    Offres spéciales
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 mt-10 lg:mt-0 pt-20 lg:pt-0">
        {/* Placeholder pour l'image du Hero */}
        <div className="h-56 w-full bg-gray-200 sm:h-72 md:h-96 lg:w-full lg:h-full relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-white text-lg font-medium tracking-wider uppercase">[Espace Image Hero]</span>
           </div>
        </div>
      </div>
    </div>
  );
}
