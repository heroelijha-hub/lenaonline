import { getTranslations } from 'next-intl/server';
import OrderTable from '@/components/admin/OrderTable';
import AdminPagination from '@/components/admin/AdminPagination';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({ searchParams }: { searchParams: { page?: string } }) {
  const t = await getTranslations('AdminOrders');
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: limit,
      include: {
        user: true,
        orderItems: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.count()
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("manage_orders")}</h1>
      </div>

      <OrderTable orders={orders as any} />
      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
