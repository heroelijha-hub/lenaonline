import { getTranslations } from 'next-intl/server';
import { getAbandonedCarts } from '@/actions/admin';
import AbandonedCartTable from '@/components/admin/AbandonedCartTable';

export const dynamic = 'force-dynamic';

export default async function AbandonedCartsPage() {
  const t = await getTranslations('AdminAbandonedCarts');
  const carts = await getAbandonedCarts();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("abandoned_carts")}</h1>
      </div>

      <AbandonedCartTable carts={carts} />
    </div>
  );
}
