import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * PayPal Capture Handler
 * 
 * Called after the user approves the payment on PayPal.
 * Captures the payment, updates order status, and triggers post-payment logic.
 * 
 * Flow:
 * 1. User clicks "Pay with PayPal" → redirected to PayPal approval URL
 * 2. User approves → PayPal redirects to this route with token & orderId
 * 3. This route captures the payment via PayPal API
 * 4. On success → finalizeOrder() + redirect to success page
 * 5. On failure → redirect to checkout with error
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    const paypalToken = url.searchParams.get('token');

    if (!orderId || !paypalToken) {
      return NextResponse.redirect(
        new URL('/checkout?error=missing_params', request.url)
      );
    }

    // Validate orderId is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return NextResponse.redirect(
        new URL('/checkout?error=invalid_order', request.url)
      );
    }

    // Verify order exists and is PENDING
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.redirect(
        new URL('/checkout?error=order_not_found', request.url)
      );
    }

    if (order.status !== 'PENDING') {
      // Already processed (idempotency)
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.topkaminbrennstoffe.com';
      return NextResponse.redirect(
        new URL(`/checkout/success?orderId=${orderId}`, baseUrl)
      );
    }

    // Fetch PayPal credentials from Settings DB
    const [clientIdSetting, secretSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'PAYPAL_CLIENT_ID' } }),
      prisma.setting.findUnique({ where: { key: 'PAYPAL_SECRET' } }),
    ]);

    if (!clientIdSetting?.value || !secretSetting?.value) {
      console.error('[PayPal Capture] PayPal credentials not found in Settings');
      return NextResponse.redirect(
        new URL('/checkout?error=paypal_not_configured', request.url)
      );
    }

    // Get PayPal access token
    const auth = Buffer.from(
      `${clientIdSetting.value}:${secretSetting.value}`
    ).toString('base64');

    const tokenRes = await fetch(
      'https://api-m.paypal.com/v1/oauth2/token',
      {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('[PayPal Capture] Failed to get access token');
      return NextResponse.redirect(
        new URL('/checkout?error=paypal_auth_failed', request.url)
      );
    }

    // Capture the payment
    const captureRes = await fetch(
      `https://api-m.paypal.com/v2/checkout/orders/${paypalToken}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const captureData = await captureRes.json();

    if (captureData.status === 'COMPLETED') {
      // Update order status to PAID
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      });

      // Trigger post-payment logic
      const { finalizeOrder } = await import('@/lib/orderFinalizer');
      await finalizeOrder(orderId);

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.topkaminbrennstoffe.com';
      return NextResponse.redirect(
        new URL(`/checkout/success?orderId=${orderId}`, baseUrl)
      );
    } else {
      console.error(
        '[PayPal Capture] Capture failed:',
        JSON.stringify(captureData)
      );
      return NextResponse.redirect(
        new URL('/checkout?error=paypal_capture_failed', request.url)
      );
    }
  } catch (error: any) {
    console.error('[PayPal Capture] Unhandled error:', error);
    return NextResponse.redirect(
      new URL('/checkout?error=server_error', request.url)
    );
  }
}
