import prisma from '@/lib/prisma';
import TrackingMap from '@/components/tracking/TrackingMap';

export const dynamic = 'force-dynamic';

export default async function TrackingPage({ searchParams }: { searchParams: Promise<{ number?: string }> }) {
  const { number } = await searchParams;
  const trackingNumber = number;
  
  let order = null;
  let error = null;

  if (trackingNumber) {
    order = await prisma.order.findUnique({
      where: { trackingNumber },
      include: {
        deliveryPositions: {
          orderBy: { createdAt: 'asc' }
        },
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      error = "Aucune commande trouvée avec ce numéro de suivi. Vérifiez votre saisie.";
    }
  }

  // Calculate percentage logic for Haversine
  let percentage = 0;
  if (order && order.deliveryPositions.length > 0 && order.originLat && order.originLng && order.destinationLat && order.destinationLng) {
    const lastPos = order.deliveryPositions[order.deliveryPositions.length - 1];
    
    const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; 
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const totalDist = distanceKm(order.originLat, order.originLng, order.destinationLat, order.destinationLng);
    const coveredDist = distanceKm(order.originLat, order.originLng, lastPos.latitude, lastPos.longitude);
    
    if (totalDist > 0) {
      percentage = Math.min(100, Math.round((coveredDist / totalDist) * 100));
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      
      {!order ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Suivre ma livraison</h1>
          
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>}
          
          <form method="GET" action="/order-tracking" className="flex flex-col gap-4">
            <div>
              <label htmlFor="number" className="sr-only">Numéro de suivi</label>
              <input 
                type="text" 
                id="number"
                name="number" 
                placeholder="Ex: TRK-2026-0842" 
                required
                defaultValue={trackingNumber}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900"
              />
            </div>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors">
              Rechercher
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Suivi: <span className="text-orange-500">{order.trackingNumber}</span></h1>
            <span className={`px-4 py-1 rounded-full text-sm font-bold ${
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {order.status === 'DELIVERED' ? 'Livré' : 'En transit'}
            </span>
          </div>

          {order.status === 'DELIVERED' ? (
            <div className="text-center py-10 bg-green-50 rounded-xl mb-8">
              <span className="text-5xl mb-4 block">✅</span>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Livraison terminée</h2>
              <p className="text-green-700">Nous vous remercions pour votre confiance !</p>
            </div>
          ) : (
            <div className="mb-10">
              <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                <span>Départ: {order.originCity}</span>
                <span>Arrivée: {order.destinationAddress || order.destinationCountry}</span>
              </div>
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
              </div>
              <div className="text-center mt-2 text-xs text-gray-400">{percentage}% du trajet à vol d'oiseau estimé</div>
            </div>
          )}

          {order.deliveryPositions.length > 0 && order.status !== 'DELIVERED' && (
            <div className="mb-8">
              <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-orange-500 text-xl">📍</span> 
                Position actuelle : {order.deliveryPositions[order.deliveryPositions.length - 1].city}, {order.deliveryPositions[order.deliveryPositions.length - 1].country}
              </p>
              <p className="text-sm text-gray-500 ml-7 mt-1">
                Dernière mise à jour : {new Date(order.deliveryPositions[order.deliveryPositions.length - 1].createdAt).toLocaleString()}
              </p>
              {order.deliveryPositions[order.deliveryPositions.length - 1].note && (
                <p className="text-sm text-gray-700 italic ml-7 mt-2 bg-gray-50 p-3 rounded border">
                  "{order.deliveryPositions[order.deliveryPositions.length - 1].note}"
                </p>
              )}
            </div>
          )}

          <div className="mb-8">
            <TrackingMap 
              originLat={order.originLat}
              originLng={order.originLng}
              originName={`${order.originCity}, ${order.originCountry}`}
              destinationLat={order.destinationLat}
              destinationLng={order.destinationLng}
              destinationName={`${order.destinationAddress}, ${order.destinationCountry}`}
              positions={order.deliveryPositions}
            />
          </div>

          <div className="text-center">
            <a href="/order-tracking" className="text-orange-500 font-medium hover:underline">&larr; Suivre une autre livraison</a>
          </div>
        </div>
      )}
    </div>
  );
}
