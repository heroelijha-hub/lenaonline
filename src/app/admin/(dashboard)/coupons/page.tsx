import { getCoupons, createCoupon } from '@/actions/admin';
import CouponTable from '@/components/admin/CouponTable';

export const dynamic = 'force-dynamic';

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="max-w-6xl mx-auto flex gap-8 items-start">
      {/* Colonne gauche: Formulaire */}
      <div className="w-1/3 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">New Coupon</h2>
        {/* @ts-expect-error Server Action typing */}
        <form action={createCoupon} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code Promo *</label>
            <input type="text" name="code" required placeholder="ex: SOLDES20" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de réduction *</label>
            <select name="type" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 mb-4">
              <option value="PERCENTAGE">Pourcentage (%)</option>
              <option value="FIXED_AMOUNT">Montant fixe (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valeur de la réduction *</label>
            <input type="number" step="0.01" name="value" required min="0.01" placeholder="ex: 20" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" id="isActive" defaultChecked className="w-4 h-4 text-orange-600 border-gray-300 rounded" />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Active immédiatement</label>
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white font-medium py-2 rounded hover:bg-orange-600 transition">
            Create le Coupon
          </button>
        </form>
      </div>

      {/* Colonne droite: Liste */}
      <div className="w-2/3">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Coupons</h1>
        <CouponTable coupons={coupons} />
      </div>
    </div>
  );
}
