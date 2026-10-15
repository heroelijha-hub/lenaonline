import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Stripe Webhook Handler
 * 
 * Listens for `checkout.session.completed` events to confirm payments.
 * Updates order status from PENDING to PAID and triggers post-payment logic.
 * 
 * Setup in Stripe Dashboard:
 * - Endpoint URL: https://your-domain.com/api/stripe/webhook
 * - Events: checkout.session.completed
 * - Webhook signing secret → set as STRIPE_WEBHOOK_SECRET env var
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Get Stripe secret key from Settings DB
    const stripeSecretSetting = await prisma.setting.findUnique({
      where: { key: 'STRIPE_SECRET_KEY' },
    });

    if (!stripeSecretSetting?.value) {
      console.error('[Stripe Webhook] STRIPE_SECRET_KEY not found in Settings');
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get webhook secret from env
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET env var not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const Stripe = require('stripe');
    const stripe = new Stripe(stripeSecretSetting.value);

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('[Stripe Webhook] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.client_reference_id;

      if (!orderId) {
        console.error('[Stripe Webhook] No client_reference_id in session');
        return NextResponse.json(
          { error: 'Missing order reference' },
          { status: 400 }
        );
      }

      // Verify payment status is confirmed as paid
      if (session.payment_status !== 'paid') {
        console.warn(`[Stripe Webhook] Order ${orderId} payment_status is '${session.payment_status}', not 'paid'`);
        return NextResponse.json({ received: true });
      }

      // Fetch order
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (!order) {
        console.error(`[Stripe Webhook] Order ${orderId} not found`);
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Verify payment amount matches order total in cents
      const expectedCents = Math.round(order.total * 100);
      if (typeof session.amount_total === 'number' && session.amount_total !== expectedCents) {
        console.error(`[Stripe Webhook] Order ${orderId} total mismatch: expected ${expectedCents} cents, got ${session.amount_total} cents`);
        return NextResponse.json(
          { error: 'Amount mismatch' },
          { status: 400 }
        );
      }

      // Atomic update for idempotency (only transition if status is PENDING)
      const updated = await prisma.order.updateMany({
        where: { id: orderId, status: 'PENDING' },
        data: { status: 'PAID', stripeSessionId: session.id },
      });

      if (updated.count === 1) {
        // Trigger post-payment logic (emails, stock, notifications)
        const { finalizeOrder } = await import('@/lib/orderFinalizer');
        await finalizeOrder(orderId);
      }

      return NextResponse.json({ received: true });
    }

    // Return 200 for unhandled event types
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
