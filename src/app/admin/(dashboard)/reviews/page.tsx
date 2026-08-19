import prisma from '@/lib/prisma';
import ReviewTable from '@/components/admin/ReviewTable';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      product: { select: { title: true, slug: true } },
      user: { select: { email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Avis Clients</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ReviewTable reviews={reviews} />
      </div>
    </div>
  );
}
