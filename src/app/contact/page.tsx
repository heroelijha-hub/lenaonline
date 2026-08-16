import { Metadata } from 'next';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Column: Legal text & Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold mb-6">Responsabilité relative au contenu</h2>
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  <p>
                    En Tant Que Prestataire De Services, Nous Sommes Responsables De Nos Propres
                    Contenus Sur Ces Pages Conformément À L'article 7, Paragraphe 1, De La Loi
                    Allemande Sur La Protection Des Données (DDG).
                  </p>
                  <p>
                    Cependant, Conformément Aux Articles 8 À 10 De La DDG, Nous Ne Sommes Pas
                    Tenus De Surveiller Les Informations Transmises Ou Stockées Par Des Tiers Ni De
                    Rechercher Des Faits Ou Circonstances Révélant Une Activité Illégale.
                  </p>
                  <p>
                    Les Obligations De Retrait Ou De Blocage De L'utilisation D'informations En Vertu
                    Des Lois Générales Restent Inchangées.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Adresse */}
                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-sm text-gray-600 leading-snug">
                      Chaussée de Tirlemont 110, 5030 Gembloux, BELGIQUE<br />
                      London, UK
                    </p>
                  </div>
                </div>

                {/* Téléphone */}
                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Téléphone</h3>
                    <p className="text-sm text-gray-600">
                      +32456761781
                    </p>
                  </div>
                </div>

                {/* E-mail */}
                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">E-mail</h3>
                    <p className="text-sm text-gray-600">
                      commandes@phicomaJardinage.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Envoyez-nous un message!</h2>
              <p className="text-sm text-gray-600 mb-8">
                Contactez-Nous En Remplissant Le Formulaire Ci-Dessous.
              </p>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Nom complet" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-orange-500 focus:border-orange-500" 
                    />
                  </div>
                  <div>
                    <input 
                      type="email" 
                      placeholder="@" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-orange-500 focus:border-orange-500" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input 
                      type="tel" 
                      placeholder="+32 XXX ....." 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-orange-500 focus:border-orange-500" 
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="Objet" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-orange-500 focus:border-orange-500" 
                    />
                  </div>
                </div>

                <div>
                  <textarea 
                    placeholder="Votre Message" 
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-orange-500 focus:border-orange-500" 
                  ></textarea>
                </div>

                <div>
                  <button 
                    type="submit" 
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded transition-colors mt-2"
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
            
          </div>
        </div>
      </main>
      
    </div>
  );
}
