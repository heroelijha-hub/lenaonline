'use server';

import prisma from '@/lib/prisma';

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
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

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
