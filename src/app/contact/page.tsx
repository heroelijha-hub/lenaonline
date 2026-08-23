import { Metadata } from 'next';
import ContactForm from './ContactForm';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Column: Legal text & Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold mb-6">Content Responsibility</h2>
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  <p>
                    En Tant Que Prestataire De Services, Nous Sommes Responsables De Nos Propres
                    Content on these pages in accordance with Section 7, Paragraph 1 of the
                    German Telemedia Act (TMG).
                  </p>
                  <p>
                    However, under Sections 8 to 10 of the TMG, we are not
                    obligated to monitor transmitted or stored third-party information or
                    investigate circumstances indicating illegal activity.
                  </p>
                  <p>
                    Les Obligations De Retrait Ou De Blocage De L'utilisation D'informations En Vertu
                    General legal obligations remain unchanged.
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

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg flex-shrink-0">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
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

              <ContactForm />
            </div>
            
          </div>
        </div>
      </main>
      
    </div>
  );
}
