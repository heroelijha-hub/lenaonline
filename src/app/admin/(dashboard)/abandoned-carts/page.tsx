import { getTranslations } from 'next-intl/server';
import AbandonedCartTable from '@/components/admin/AbandonedCartTable';
import AdminPagination from '@/components/admin/AdminPagination';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AbandonedCartsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const t = await getTranslations('AdminAbandonedCarts');
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [carts, total] = await Promise.all([
    prisma.abandonedCart.findMany({
      skip,
      take: limit,
      orderBy: { lastActive: 'desc' }
    }),
    prisma.abandonedCart.count()
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("abandoned_carts")}</h1>
      </div>

      <AbandonedCartTable carts={carts as any} />
      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
