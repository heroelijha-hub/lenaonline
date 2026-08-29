import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendReviewRequestEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Optional: secure the endpoint if not using Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Vercel Cron automatically sends this header if configured
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Default delay is 7 days
    const delayDays = 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - delayDays);

    // Find orders that were delivered more than 7 days ago and haven't received a review request
    const eligibleOrders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        reviewRequestSent: false,
        deliveredAt: {
          lte: cutoffDate
        }
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      },
      take: 50 // process in batches of 50 to avoid timeouts
    });

    if (eligibleOrders.length === 0) {
      return NextResponse.json({ success: true, message: 'No eligible orders found' });
    }

    const storeUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopelios.vercel.app';
    let processedCount = 0;

    for (const order of eligibleOrders) {
      if (order.user?.email) {
        // Send email
        const userName = order.user.name || 'Client';
        await sendReviewRequestEmail(order, order.user.email, userName, storeUrl);

        // Update database
        await prisma.order.update({
          where: { id: order.id },
          data: { reviewRequestSent: true }
        });
        processedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully sent ${processedCount} review requests.` 
    });
  } catch (error: any) {
    console.error('Error processing review requests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
