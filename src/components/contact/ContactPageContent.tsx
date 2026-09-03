import ContactForm from './ContactForm';
import { getContactSettings } from '@/actions/contactSettings';
import { getTranslations } from 'next-intl/server';

export default async function ContactPageContent() {
  const settings = await getContactSettings();
  const t = await getTranslations('Contact');
  const textParagraphs = settings.text.split('\n').filter((p: string) => p.trim() !== '');
  const bottomTextParagraphs = settings.bottomText ? settings.bottomText.split('\n').filter((p: string) => p.trim() !== '') : [];
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left Column: Legal text & Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold mb-6">{settings.title}</h2>
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  {textParagraphs.map((paragraph: string, idx: number) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {(settings.address || settings.phone || settings.emailDisplay) ? (
                <div className="space-y-6">
                  {/* Adresse */}
                  {settings.address ? (
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg flex-shrink-0">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{t('address_label')}</h3>
                        <p className="text-sm text-gray-600 leading-snug whitespace-pre-line">
                          {settings.address}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Phone */}
                  {settings.phone ? (
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg flex-shrink-0">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{t('phone_label')}</h3>
                        <p className="text-sm text-gray-600">
                          {settings.phone}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* E-mail */}
                  {settings.emailDisplay ? (
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg flex-shrink-0">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{t('email_label')}</h3>
                        <p className="text-sm text-gray-600">
                          {settings.emailDisplay}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Right Column: Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('form_title')}</h2>
              <p className="text-sm text-gray-600 mb-8">
                {t('form_subtitle')}
              </p>

              <ContactForm />
            </div>
            
          </div>

          {/* Bottom Text Section */}
          {bottomTextParagraphs.length > 0 && (
            <div className="mt-16 pt-10 border-t border-gray-200">
              <div className="max-w-3xl mx-auto space-y-4 text-sm text-gray-600 leading-relaxed text-center">
                {bottomTextParagraphs.map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      
    </div>
  );
}
