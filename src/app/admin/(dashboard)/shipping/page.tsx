import { getShippingZones } from '@/actions/shipping';
import ShippingManager from './ShippingManager';

export const metadata = {
  title: 'Shipping Settings | Shopelios Admin',
};

export default async function ShippingPage() {
  const initialZones = await getShippingZones();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shipping Settings</h1>
        <p className="text-gray-500 mt-2">Configure the zones served (countries) and shipping costs.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ShippingManager initialZones={initialZones} />
      </div>
    </div>
  );
}
