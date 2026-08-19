'use server';

import prisma from '@/lib/prisma';

export async function validateCoupon(code: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return { error: "Code promo invalide." };
    }

    if (!coupon.isActive) {
      return { error: "Ce code promo n'est plus actif." };
    }

    return { 
      success: true, 
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value
      } 
    };
  } catch (error) {
    console.error("Coupon validation error:", error);
    return { error: "Erreur lors de la validation du code promo." };
  }
}


export async function processCheckout(formData: FormData, cartItems: any[], finalTotal: number, paymentMethod: string) {
  try {
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    
    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: 'CUSTOMER',
        }
      });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: finalTotal,
        paymentMethod: paymentMethod as any,
        status: paymentMethod === 'BANK_TRANSFER' ? 'PENDING' : 'PENDING',
        orderItems: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            variationId: item.variationId || null,
            attributes: item.attributes || null
          }))
        }
      }
    });

    try {
      const { sendClientOrderConfirmation, sendAdminOrderNotification } = await import('@/lib/mailer');
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { orderItems: { include: { product: true } } }
      });
      if (fullOrder) {
        sendClientOrderConfirmation(fullOrder, user.email, firstName + ' ' + lastName).catch(e => console.error('Client email failed', e));
        const adminSetting = await prisma.setting.findFirst({ where: { key: 'CONTACT_RECEIVER_EMAIL' } });
        const adminEmail = adminSetting?.value || 'admin@shopelios.com';
        sendAdminOrderNotification(fullOrder, adminEmail, { name: firstName + ' ' + lastName, email: user.email }).catch(e => console.error('Admin email failed', e));
      }
    } catch (e) {
      console.error('Email sending setup failed', e);
    }

    // Handle payment method specific logic
    if (paymentMethod === 'STRIPE') {
      // You would create a Stripe Checkout session here
      // For now, return a placeholder URL or success
      return { success: true, orderId: order.id, redirectUrl: '/checkout/success?orderId=' + order.id };
    } else if (paymentMethod === 'PAYPAL') {
      // Return orderId so the frontend can create a PayPal order
      return { success: true, orderId: order.id };
    } else {
      // BANK_TRANSFER
      return { success: true, orderId: order.id, redirectUrl: '/checkout/success?orderId=' + order.id };
    }

  } catch (error: any) {
    console.error("Checkout error:", error);
    return { error: "Une erreur est survenue lors de la commande." };
  }
}
