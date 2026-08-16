import Link from 'next/link';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main 
        className="flex-grow flex items-center justify-center bg-cover bg-center relative"
        style={{ backgroundImage: "url('/404 page image')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          <h1 className="text-9xl font-bold text-white mb-4 drop-shadow-lg">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-md">
            Oops! Cette page est introuvable.
          </h2>
          <p className="text-lg text-gray-200 mb-8 max-w-lg mx-auto drop-shadow">
            Il semble que nous ne puissions pas trouver la page que vous cherchez. Elle a peut-être été déplacée ou supprimée.
          </p>
          
          <Link 
            href="/" 
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
