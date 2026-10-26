'use server';

import prisma from '@/lib/prisma';
import { getOrderAccessToken } from '@/lib/security';

const ALLOWED_PAYMENT_METHODS = ['STRIPE', 'PAYPAL', 'BANK_TRANSFER'] as const;
const MAX_CART_LINES = 50;
const MAX_QTY_PER_LINE = 999;

export async function validateCoupon(code: string) {
  try {
    if (!code || typeof code !== 'string') {
      return { error: "Invalid coupon code." };
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() }
    });

    if (!coupon) {
      return { error: "Invalid coupon code." };
    }

    if (!coupon.isActive) {
      return { error: "This coupon code is no longer active." };
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
    return { error: "Error validating the coupon code." };
  }
}

export async function processCheckout(formData: FormData, cartItems: any[], finalTotal: number, paymentMethod: string) {
  try {
    const email = (formData.get('email') as string || '').trim().toLowerCase();
    const firstName = (formData.get('firstName') as string || '').trim().slice(0, 100);
    const lastName = (formData.get('lastName') as string || '').trim().slice(0, 100);
    const country = (formData.get('country') as string || '').trim().slice(0, 100);
    const shippingMethodId = formData.get('shippingMethod') as string;
    const shipToDifferentAddress = formData.get('shipToDifferentAddress') === 'on';
    const shippingCountry = (formData.get('shippingCountry') as string || '').trim().slice(0, 100);
    
    const effectiveCountry = shipToDifferentAddress ? shippingCountry : country;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 254) {
      return { error: "Please provide a valid email address." };
    }

    if (!firstName || !lastName || !country) {
      return { error: "Please fill in all required name and address fields." };
    }

    if (!(ALLOWED_PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) {
      return { error: "Invalid payment method." };
    }
    
    if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > MAX_CART_LINES) {
      return { error: "Your cart is invalid." };
    }

    // Validate that shippingMethodId is a valid UUID to prevent Prisma P2023 errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!shippingMethodId || !uuidRegex.test(shippingMethodId)) {
      return { error: "Invalid shipping method. Please refresh the page." };
    }

    const validZone = await prisma.shippingZone.findFirst({
      where: { name: effectiveCountry, isActive: true },
      include: { methods: { where: { id: shippingMethodId, isActive: true } } }
    });

    if (!validZone) {
      return { error: "This shipping zone is not currently covered." };
    }

    if (!validZone.methods || validZone.methods.length === 0) {
      return { error: "Invalid shipping method." };
    }

    const shippingRate = validZone.methods[0].rate;
    
    // ===== SERVER-SIDE PRICE AND VARIATION VERIFICATION =====
    // Fetch products and their real prices & variations from database
    const productIds = cartItems.map((item: any) => item.productId).filter(Boolean);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isDeleted: false },
      select: { id: true, price: true, title: true, images: true, variations: true },
    });
    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    let serverCartTotal = 0;
    const verifiedItems: any[] = [];
    for (const item of cartItems) {
      const qty = Number(item?.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
        return { error: "Invalid quantity in cart." };
      }
      
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return { error: `Product not found: ${item.productId}. Please refresh your cart.` };
      }

      let verifiedPrice = dbProduct.price;
      let verifiedTitle = dbProduct.title;
      let verifiedImage = dbProduct.images && dbProduct.images.length > 0 ? dbProduct.images[0] : null;

      // Handle variable product variation price securely
      if (item.variationId && dbProduct.variations) {
        const variations = dbProduct.variations as any[];
        const matchedVar = variations.find((v: any) => v.id === item.variationId);
        if (matchedVar) {
          if (matchedVar.price !== undefined && matchedVar.price !== null && matchedVar.price !== '') {
            const parsedVarPrice = Number(matchedVar.price);
            if (!isNaN(parsedVarPrice) && parsedVarPrice >= 0) {
              verifiedPrice = parsedVarPrice;
            }
          }
          if (matchedVar.image) {
            verifiedImage = matchedVar.image;
          }
          if (matchedVar.attributes && typeof matchedVar.attributes === 'object') {
            const varSuffix = Object.values(matchedVar.attributes).join(', ');
            if (varSuffix) {
              verifiedTitle = `${dbProduct.title} (${varSuffix})`;
            }
          }
        }
      }

      serverCartTotal += verifiedPrice * qty;
      verifiedItems.push({
        productId: dbProduct.id,
        title: verifiedTitle,
        image: verifiedImage,
        price: verifiedPrice,
        quantity: qty,
        variationId: item.variationId || null,
        attributes: item.attributes || null
      });
    }

    // Apply coupon discount server-side if provided
    const couponCode = (formData.get('couponCode') as string || '').trim();
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive) {
        if (coupon.type === 'PERCENTAGE') {
          discountAmount = serverCartTotal * (coupon.value / 100);
        } else {
          discountAmount = Math.min(coupon.value, serverCartTotal);
        }
      }
    }

    const serverTotal = Math.max(0, serverCartTotal - discountAmount) + shippingRate;
    const verifiedTotal = Math.round(serverTotal * 100) / 100;

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

    const orderMetadata = {
      billing: {
        firstName,
        lastName,
        email,
        phone: (formData.get('phone') as string || '').slice(0, 50),
        address1: (formData.get('address1') as string || '').slice(0, 200),
        address2: (formData.get('address2') as string || '').slice(0, 200),
        city: (formData.get('city') as string || '').slice(0, 100),
        postalCode: (formData.get('postalCode') as string || '').slice(0, 30),
        country: country
      },
      shipping: shipToDifferentAddress ? {
        firstName: (formData.get('shippingFirstName') as string || '').slice(0, 100),
        lastName: (formData.get('shippingLastName') as string || '').slice(0, 100),
        company: (formData.get('shippingCompany') as string || '').slice(0, 100),
        phone: (formData.get('shippingPhone') as string || '').slice(0, 50),
        address1: (formData.get('shippingAddress1') as string || '').slice(0, 200),
        address2: (formData.get('shippingAddress2') as string || '').slice(0, 200),
        city: (formData.get('shippingCity') as string || '').slice(0, 100),
        postalCode: (formData.get('shippingPostalCode') as string || '').slice(0, 30),
        country: shippingCountry
      } : null,
      shippingCost: shippingRate,
      shippingMethodName: validZone.methods[0].type,
      subTotal: serverCartTotal,
      discount: discountAmount,
      couponCode: couponCode || null,
    };

    // Create the order with SERVER-VERIFIED total (status PENDING for all methods)
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total: verifiedTotal,
        paymentMethod: paymentMethod as any,
        status: 'PENDING',
        orderItems: {
          create: verifiedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            variationId: item.variationId || null,
            attributes: item.attributes || null
          }))
        },
        destinationAddress: JSON.stringify(orderMetadata)
      }
    });

    const orderToken = getOrderAccessToken(order.id);

    // Fetch settings once for currency and payment config
    const allSettings = await prisma.setting.findMany();
    const settingsMap = allSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    const storeCurrencyCode = settingsMap.currency || 'EUR';
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.toplenaolline.com').replace(/\/$/, '');

    // ===== PAYMENT METHOD HANDLING =====
    if (paymentMethod === 'STRIPE') {
      const stripeSecretKey = settingsMap['STRIPE_SECRET_KEY'];
      if (!stripeSecretKey) {
        import('@/lib/mailer').then(({ sendCriticalFailureAlertEmail }) => {
          sendCriticalFailureAlertEmail({
            action: 'Paiement Carte (Stripe)',
            errorDetails: 'La clé secrète Stripe (STRIPE_SECRET_KEY) n’est pas configurée dans les paramètres de la boutique.',
            customerEmail: user.email,
            orderId: order.id,
            contextData: { Montant: `${verifiedTotal} ${storeCurrencyCode}`, Moyen: 'STRIPE' }
          }).catch(console.error);
        });
        import('@/lib/notifications').then(({ createNotification }) => {
          createNotification({
            isAdmin: true,
            type: 'SYSTEM',
            message: `⚠️ Paiement Stripe échoué : Clé API Stripe non configurée pour la commande #${order.id.slice(0, 8)} (${user.email}).`,
            link: '/admin/settings'
          }).catch(console.error);
        });

        return { 
          error: "Le paiement par carte bancaire est actuellement indisponible.", 
          paymentUnavailable: true, 
          failedMethod: 'STRIPE' 
        };
      }

      try {
        const { default: Stripe } = await import('stripe');
        const stripe = new Stripe(stripeSecretKey);

        const line_items: any[] = verifiedItems.map(item => ({
          price_data: {
            currency: storeCurrencyCode.toLowerCase(),
            product_data: {
              name: item.title,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        // Include shipping fee in Stripe session
        if (shippingRate > 0) {
          line_items.push({
            price_data: {
              currency: storeCurrencyCode.toLowerCase(),
              product_data: {
                name: `Livraison: ${validZone.methods[0].type || 'Standard'}`,
                images: [],
              },
              unit_amount: Math.round(shippingRate * 100),
            },
            quantity: 1,
          });
        }

        const sessionParams: any = {
          payment_method_types: ['card'],
          line_items,
          mode: 'payment',
          success_url: `${baseUrl}/checkout/success?orderId=${order.id}&token=${orderToken}`,
          cancel_url: `${baseUrl}/checkout`,
          client_reference_id: order.id,
          customer_email: user.email,
        };

        // Apply coupon discount in Stripe if any
        if (discountAmount > 0) {
          try {
            const stripeCoupon = await stripe.coupons.create({
              amount_off: Math.round(discountAmount * 100),
              currency: storeCurrencyCode.toLowerCase(),
              duration: 'once',
              name: couponCode ? `Coupon ${couponCode.toUpperCase()}` : 'Remise',
            });
            sessionParams.discounts = [{ coupon: stripeCoupon.id }];
          } catch (couponErr) {
            console.error('[Stripe Checkout] Failed to create Stripe discount coupon:', couponErr);
          }
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        await prisma.order.update({
          where: { id: order.id },
          data: { stripeSessionId: session.id }
        });

        return { success: true, orderId: order.id, redirectUrl: session.url };
      } catch (stripeErr: any) {
        console.error("Stripe Checkout Session error:", stripeErr);
        import('@/lib/mailer').then(({ sendCriticalFailureAlertEmail }) => {
          sendCriticalFailureAlertEmail({
            action: 'Création Session Stripe',
            errorDetails: stripeErr?.message || String(stripeErr),
            customerEmail: user.email,
            orderId: order.id,
            contextData: { Montant: `${verifiedTotal} ${storeCurrencyCode}` }
          }).catch(console.error);
        });
        import('@/lib/notifications').then(({ createNotification }) => {
          createNotification({
            isAdmin: true,
            type: 'SYSTEM',
            message: `⚠️ Session Stripe rejetée : ${stripeErr?.message || 'Erreur API'} sur commande #${order.id.slice(0, 8)}.`,
            link: `/admin/orders/${order.id}`
          }).catch(console.error);
        });

        return { 
          error: "Le paiement par carte bancaire est actuellement indisponible.", 
          paymentUnavailable: true, 
          failedMethod: 'STRIPE' 
        };
      }
    } 
    else if (paymentMethod === 'PAYPAL') {
      const paypalClientId = settingsMap['PAYPAL_CLIENT_ID'];
      const paypalSecret = settingsMap['PAYPAL_SECRET'];
      
      if (!paypalClientId || !paypalSecret) {
        import('@/lib/mailer').then(({ sendCriticalFailureAlertEmail }) => {
          sendCriticalFailureAlertEmail({
            action: 'Paiement PayPal',
            errorDetails: 'Les identifiants PayPal (PAYPAL_CLIENT_ID ou PAYPAL_SECRET) ne sont pas configurés dans les paramètres.',
            customerEmail: user.email,
            orderId: order.id,
            contextData: { Montant: `${verifiedTotal} ${storeCurrencyCode}`, Moyen: 'PAYPAL' }
          }).catch(console.error);
        });
        import('@/lib/notifications').then(({ createNotification }) => {
          createNotification({
            isAdmin: true,
            type: 'SYSTEM',
            message: `⚠️ Paiement PayPal impossible : Identifiants PayPal non renseignés (Commande #${order.id.slice(0, 8)}).`,
            link: '/admin/settings'
          }).catch(console.error);
        });

        return { 
          error: "Le paiement par PayPal est actuellement indisponible.", 
          paymentUnavailable: true, 
          failedMethod: 'PAYPAL' 
        };
      }
      
      try {
        const auth = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64');
        const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
          method: 'POST',
          body: 'grant_type=client_credentials',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
          import('@/lib/mailer').then(({ sendCriticalFailureAlertEmail }) => {
            sendCriticalFailureAlertEmail({
              action: 'Authentification OAuth PayPal',
              errorDetails: tokenData.error_description || 'Identifiants PayPal invalides ou refusés par l’API PayPal.',
              customerEmail: user.email,
              orderId: order.id
            }).catch(console.error);
          });

          return { 
            error: "Le paiement par PayPal est actuellement indisponible.", 
            paymentUnavailable: true, 
            failedMethod: 'PAYPAL' 
          };
        }

        const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              reference_id: order.id,
              amount: {
                currency_code: storeCurrencyCode,
                value: verifiedTotal.toFixed(2)
              }
            }],
            application_context: {
              return_url: `${baseUrl}/api/paypal/capture?orderId=${order.id}`,
              cancel_url: `${baseUrl}/checkout`
            }
          })
        });
        
        const orderData = await orderRes.json();
        const approveLink = orderData.links?.find((l: any) => l.rel === 'approve');
        
        if (approveLink) {
          return { success: true, orderId: order.id, redirectUrl: approveLink.href };
        } else {
          import('@/lib/mailer').then(({ sendCriticalFailureAlertEmail }) => {
            sendCriticalFailureAlertEmail({
              action: 'Création Commande PayPal',
              errorDetails: orderData.message || JSON.stringify(orderData),
              customerEmail: user.email,
              orderId: order.id
            }).catch(console.error);
          });

          return { 
            error: "Le paiement par PayPal est actuellement indisponible.", 
            paymentUnavailable: true, 
            failedMethod: 'PAYPAL' 
          };
        }
      } catch (paypalErr: any) {
        console.error("PayPal checkout error:", paypalErr);
        import('@/lib/mailer').then(({ sendCriticalFailureAlertEmail }) => {
          sendCriticalFailureAlertEmail({
            action: 'Connexion Passerelle PayPal',
            errorDetails: paypalErr?.message || String(paypalErr),
            customerEmail: user.email,
            orderId: order.id
          }).catch(console.error);
        });

        return { 
          error: "Le paiement par PayPal est actuellement indisponible.", 
          paymentUnavailable: true, 
          failedMethod: 'PAYPAL' 
        };
      }
    } 
    else {
      // BANK_TRANSFER — Finalize post-order tasks (emails, notifications)
      const { finalizeOrder } = await import('@/lib/orderFinalizer');
      finalizeOrder(order.id).catch(e => console.error('Bank transfer finalization failed', e));
      
      return { success: true, orderId: order.id, redirectUrl: `/checkout/success?orderId=${order.id}&token=${orderToken}` };
    }

  } catch (error: any) {
    console.error("Checkout error:", error);
    return { error: "Une erreur est survenue lors de la commande." };
  }
}
