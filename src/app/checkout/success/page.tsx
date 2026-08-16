import Link from 'next/link';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const orderId = searchParams.orderId as string;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande Confirmée !</h1>
      <p className="text-lg text-gray-600 mb-8">
        Merci pour votre achat. Votre commande a été enregistrée avec succès.
      </p>

      {orderId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Détails de la commande</h2>
          <p className="text-gray-700 mb-2"><strong>Numéro de commande :</strong> {orderId}</p>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Instructions de virement bancaire</h3>
            <p className="text-sm text-gray-600 mb-4">
              Veuillez effectuer votre virement bancaire sur le compte ci-dessous. Indiquez le numéro de commande en référence.
            </p>
            <div className="bg-white p-4 rounded border border-gray-200 font-mono text-sm space-y-2">
              <p><strong>Titulaire :</strong> Shopelios SARL</p>
              <p><strong>IBAN :</strong> FR76 1234 5678 9101 1121 3141 516</p>
              <p><strong>BIC :</strong> EXAMPLFR123</p>
              <p><strong>Banque :</strong> Banque Exemple</p>
            </div>
            <p className="text-xs text-orange-600 mt-4 font-medium">
              Votre commande sera traitée dès réception des fonds.
            </p>
          </div>
        </div>
      )}

      <div>
        <Link href="/" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded transition-colors">
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
