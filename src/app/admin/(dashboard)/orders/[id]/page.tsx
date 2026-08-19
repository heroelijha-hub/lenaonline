import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DeliveryTracker from '@/components/admin/DeliveryTracker';

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      orderItems: {
        include: {
          product: true
        }
      },
      deliveryPositions: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Commande #{order.id.split('-')[0]}</h1>
        <a href="/admin/orders" className="text-sm font-medium text-gray-600 hover:text-gray-900">&larr; Retour aux commandes</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Détails Commande */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Articles</h2>
            <div className="space-y-4">
              {order.orderItems.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex items-center space-x-4">
                    {item.product.images[0] && (
                      <img src={item.product.images[0]} alt={item.product.title} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.product.title}</p>
                      {item.attributes && (
                        <p className="text-xs text-orange-600 font-medium">
                          {(() => {
                            try {
                              const attrs = typeof item.attributes === 'string' ? JSON.parse(item.attributes) : item.attributes;
                              return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ');
                            } catch (e) {
                              return '';
                            }
                          })()}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">Qté: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Suivi Livraison */}
        <div className="lg:col-span-1">
          <DeliveryTracker 
            orderId={order.id}
            trackingNumber={order.trackingNumber}
            originCity={order.originCity}
            originCountry={order.originCountry}
            destinationAddress={order.destinationAddress}
            destinationCountry={order.destinationCountry}
            deliveryPositions={order.deliveryPositions}
          />
        </div>
      </div>
    </div>
  );
}
