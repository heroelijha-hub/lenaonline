import Header from '@/components/layout/Header';
import Hero from '@/components/home/Hero';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        {/* Autres sections viendront ici */}
      </main>
    </div>
  );
}
