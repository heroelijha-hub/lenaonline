import prisma from '@/lib/prisma';
import ReviewTable from '@/components/admin/ReviewTable';

export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import AdminPagination from '@/components/admin/AdminPagination';

export default async function AdminReviewsPage({ searchParams }: { searchParams: { page?: string } }) {
  const t = await getTranslations('AdminReviews');
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      skip,
      take: limit,
      include: {
        product: { select: { title: true, slug: true } },
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.review.count()
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ReviewTable reviews={reviews as any} />
      </div>
      <AdminPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
