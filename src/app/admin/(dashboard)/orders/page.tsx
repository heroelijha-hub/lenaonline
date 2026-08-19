import { getOrders } from '@/actions/admin';
import OrderTable from '@/components/admin/OrderTable';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h1>
      </div>

      <OrderTable orders={orders} />
    </div>
  );
}
