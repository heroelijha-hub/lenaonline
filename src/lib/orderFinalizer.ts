import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

/**
 * Finalizes an order after payment has been confirmed.
 * This function handles all post-payment logic:
 * - Recovering abandoned carts
 * - Sending confirmation emails (client + admin)
 * - Decrementing stock with Prisma transaction (race-condition safe)
 * - Sending low stock alerts
 * - Creating in-app notifications
 *
 * Called internally by:
 * - Stripe webhook (after checkout.session.completed)
 * - PayPal capture route (after successful capture)
 * - Bank transfer checkout (after order creation)
 */
export async function finalizeOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderItems: { include: { product: true } },
      },
    });

    if (!order || !order.user) {
      console.error(`[finalizeOrder] Order ${orderId} or user not found`);
      return;
    }

    // Parse order metadata for customer name & idempotency check
    let customerName = 'Client';
    let metadata: any = {};
    if (order.destinationAddress) {
      try {
        metadata = JSON.parse(order.destinationAddress);
        const billing = metadata?.billing;
        if (billing?.firstName) {
          customerName = `${billing.firstName} ${billing.lastName || ''}`.trim();
        }
      } catch (e) {
        // Metadata parse failed, use default name
      }
    }

    // IDEMPOTENCY GUARD: Do not process order if already finalized
    if (metadata.finalizedAt) {
      console.log(`[finalizeOrder] Order ${orderId} was already finalized at ${metadata.finalizedAt}`);
      return;
    }

    // Atomically mark order as finalized
    metadata.finalizedAt = new Date().toISOString();
    await prisma.order.update({
      where: { id: order.id },
      data: { destinationAddress: JSON.stringify(metadata) },
    });

    const userEmail = order.user.email;

    // 1. Recover abandoned cart
    try {
      await prisma.abandonedCart.updateMany({
        where: { email: userEmail, status: 'ABANDONED' },
        data: {
          status: 'RECOVERED',
          recoveredOrderId: order.id,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      console.error('[finalizeOrder] Failed to mark abandoned cart as recovered', e);
    }

    // 2. Fetch settings for emails, currency, stock threshold
    const allSettings = await prisma.setting.findMany();
    const settingsMap = allSettings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, string>
    );
    const adminEmail = settingsMap['CONTACT_RECEIVER_EMAIL'] || 'admin@mystore.com';

    // 3. Send emails (non-blocking)
    try {
      const { sendClientOrderConfirmation, sendAdminOrderNotification } = await import(
        '@/lib/mailer'
      );

      sendClientOrderConfirmation(order, userEmail, customerName).catch((e) =>
        console.error('[finalizeOrder] Client email failed', e)
      );

      sendAdminOrderNotification(order, adminEmail, {
        name: customerName,
        email: userEmail,
      }).catch((e) => console.error('[finalizeOrder] Admin email failed', e));
    } catch (e) {
      console.error('[finalizeOrder] Email sending setup failed', e);
    }

    // 4. Stock decrement inside a Prisma interactive transaction (race-condition safe)
    try {
      const threshold = parseInt(settingsMap['LOW_STOCK_THRESHOLD'] || '5', 10);
      const storeUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.toplenaolline.com').replace(/\/$/, '');
      const { sendLowStockAlertEmail } = await import('@/lib/mailer');

      await prisma.$transaction(async (tx) => {
        for (const item of order.orderItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) continue;

          let currentStock: number | null = null;
          let variationName: string | null = null;

          if (item.variationId && product.variations) {
            const variations = product.variations as any[];
            const variationIndex = variations.findIndex(
              (v) => v.id === item.variationId
            );
            if (
              variationIndex !== -1 &&
              variations[variationIndex].stock !== null
            ) {
              variations[variationIndex].stock = Math.max(
                0,
                variations[variationIndex].stock - item.quantity
              );
              currentStock = variations[variationIndex].stock;
              variationName = Object.values(
                variations[variationIndex].attributes || {}
              ).join(', ');

              await tx.product.update({
                where: { id: product.id },
                data: { variations },
              });
            }
          } else if (product.stock !== null) {
            currentStock = Math.max(0, product.stock - item.quantity);
            await tx.product.update({
              where: { id: product.id },
              data: { stock: currentStock },
            });
          }

          // Send low stock alert (outside transaction, non-blocking)
          if (currentStock !== null && currentStock <= threshold) {
            sendLowStockAlertEmail(
              product.title,
              variationName,
              currentStock,
              threshold,
              adminEmail,
              storeUrl,
              product.id
            ).catch((e) =>
              console.error('[finalizeOrder] Low stock alert failed', e)
            );
          }
        }
      });
    } catch (stockErr) {
      console.error(
        '[finalizeOrder] Failed to decrement stock',
        stockErr
      );
    }

    // 5. In-app notification
    try {
      const { formatPriceNumber, defaultCurrencyOptions } = await import(
        '@/lib/formatPrice'
      );
      const currencyOptions = {
        currencySymbol:
          settingsMap.currencySymbol || defaultCurrencyOptions.currencySymbol,
        currencyPosition:
          (settingsMap.currencyPosition as any) ||
          defaultCurrencyOptions.currencyPosition,
        thousandSeparator:
          settingsMap.thousandSeparator !== undefined
            ? settingsMap.thousandSeparator
            : defaultCurrencyOptions.thousandSeparator,
        decimalSeparator:
          settingsMap.decimalSeparator ||
          defaultCurrencyOptions.decimalSeparator,
        taxIncludedInPrice: settingsMap.TAX_INCLUDED_IN_PRICE === 'true',
        defaultVatRate: Number(settingsMap.DEFAULT_VAT_RATE) || 20,
      };

      createNotification({
        isAdmin: true,
        type: 'ORDER',
        message: JSON.stringify({
          key: 'new_order_from',
          name: customerName,
          amount: formatPriceNumber(order.total, currencyOptions),
        }),
        link: `/admin/orders/${order.id}`,
      }).catch((e) =>
        console.error('[finalizeOrder] Notification failed', e)
      );
    } catch (e) {
      console.error('[finalizeOrder] Notification setup failed', e);
    }
  } catch (error) {
    console.error(`[finalizeOrder] Critical error for order ${orderId}:`, error);
  }
}
