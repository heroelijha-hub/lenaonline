import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

// Fetch SMTP settings from DB
async function getTransporter() {
  const settingsDb = await prisma.setting.findMany({
    where: {
      key: {
        in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'HEADER_LOGO_IMAGE']
      }
    }
  });

  const settings = settingsDb.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

  if (!settings.SMTP_HOST || !settings.SMTP_USER || !settings.SMTP_PASS) {
    throw new Error('SMTP configuration is missing in the database.');
  }

  const transporter = nodemailer.createTransport({
    host: settings.SMTP_HOST,
    port: parseInt(settings.SMTP_PORT || '587'),
    secure: settings.SMTP_PORT === '465',
    auth: {
      user: settings.SMTP_USER,
      pass: settings.SMTP_PASS,
    },
  });

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "My Store";
  return { transporter, from: settings.SMTP_FROM || `"${storeName}" <${settings.SMTP_USER}>`, logo: settings.HEADER_LOGO_IMAGE };
}

// General email sender
export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  try {
    const { transporter, from } = await getTransporter();
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email: ", error);
    return { success: false, error };
  }
}

// FORMATTER HELPERS
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
};

// --- EMAIL TEMPLATES ---

// 1. Client Order Confirmation
export async function sendClientOrderConfirmation(order: any, userEmail: string, userName: string) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: '' }));
    
    const logoHtml = logo ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 50px;"></div>` : '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a;">Merci pour votre commande</h1>
        <p>Bonjour ${userName || 'Client'},</p>
        <p>We have received your order <strong>#${order.id.slice(-6).toUpperCase()}</strong>.</p>
        <p>It is currently pending confirmation of your payment processing (if applicable) or will be shipped very soon.</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Order Summary</h3>
        <p style="color: #666; font-size: 13px;">Commande n°${order.id.slice(-6).toUpperCase()} (${formatDate(new Date(order.createdAt))})</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${order.orderItems?.map((item: any) => {
            let attrString = '';
            if (item.attributes) {
              try {
                const attrs = typeof item.attributes === 'string' ? JSON.parse(item.attributes) : item.attributes;
                attrString = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ');
                if (attrString) attrString = ` <span style="color: #666; font-size: 12px;">(${attrString})</span>`;
              } catch (e) {}
            }
            return `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px 0;">
                <strong>${item.product?.title || 'Produit'}</strong>${attrString}
              </td>
              <td style="padding: 15px 0; text-align: center;">×${item.quantity}</td>
              <td style="padding: 15px 0; text-align: right;">${formatPrice(item.price)}</td>
            </tr>
          `}).join('') || ''}
        </table>
        
        <div style="margin-top: 20px; text-align: right; font-size: 16px;">
          <p><strong>Total: ${formatPrice(order.total)}</strong></p>
        </div>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px;">
          Encore merci ! Contactez-nous si vous avez besoin d'aide avec votre commande.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Confirmation de commande #${order.id.slice(-6).toUpperCase()}`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

// 2. Admin New Order Notification
export async function sendAdminOrderNotification(order: any, adminEmail: string, customerDetails: any) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: '' }));
    
    const logoHtml = logo ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 40px;"></div>` : '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a;">Nouvelle Commande : Nr. ${order.id.slice(-6).toUpperCase()}</h1>
        <p>You have received a new order from <strong>${customerDetails.name || 'a customer'}</strong> :</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Order Summary</h3>
        <p style="color: #666; font-size: 13px;">Order number ${order.id.slice(-6).toUpperCase()} (${formatDate(new Date(order.createdAt))})</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead style="text-align: left; border-bottom: 1px solid #eee;">
            <tr>
              <th style="padding-bottom: 10px;">Product</th>
              <th style="padding-bottom: 10px; text-align: center;">Quantity</th>
              <th style="padding-bottom: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems?.map((item: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px 0;">${item.product?.title || 'Produit'}</td>
                <td style="padding: 15px 0; text-align: center;">×${item.quantity}</td>
                <td style="padding: 15px 0; text-align: right;">${formatPrice(item.price)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right; font-size: 16px;">
          <p><strong>Total: ${formatPrice(order.total)}</strong></p>
        </div>
        
        <table style="width: 100%; margin-top: 30px;">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <strong>Client / Contact</strong><br/>
              ${customerDetails.name || ''}<br/>
              ${customerDetails.email || ''}
            </td>
            <td style="vertical-align: top; width: 50%;">
              <strong>Paiement</strong><br/>
              Payment Method: ${order.paymentMethod}<br/>
              Statut : ${order.status}
            </td>
          </tr>
        </table>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `Nouvelle Commande #${order.id.slice(-6).toUpperCase()}`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

// 3. Client Order Status Update (Cancelled / Shipped)
export async function sendOrderStatusUpdate(order: any, userEmail: string, status: string) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: '' }));
    
    const logoHtml = logo ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 50px;"></div>` : '';

    let title = "Your order has been updated";
    let message = `The status of your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> has been updated.`;
    let color = "#333";

    if (status === 'SHIPPED') {
      title = "Great news! Your order is on its way 🚚";
      message = `Your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> has been shipped. You can track the delivery from your account.`;
      color = "#16a34a"; // green
    } else if (status === 'CANCELLED') {
      title = "Information about your order";
      message = `We inform you that your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> has unfortunately been <strong>cancelled</strong>. If a payment was made, the refund is being processed.`;
      color = "#dc2626"; // red
    } else if (status === 'DELIVERED') {
      title = "Your order has been delivered!";
      message = `Your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> is marked as delivered. We hope you are satisfied!`;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: ${color};">${title}</h1>
        <p>Hello,</p>
        <p>${message}</p>
        
        <p style="margin-top: 30px;">
          Do not hesitate to contact us for any additional questions.
        </p>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
          Your store team.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Order update #${order.id.slice(-6).toUpperCase()}`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

// 4. Abandoned Cart Recovery Email
export async function sendAbandonedCartRecoveryEmail(cart: any, userEmail: string, userName: string, checkoutUrl: string) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: '' }));
    
    const logoHtml = logo ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 50px;"></div>` : '';

    // USER TODO: Add your coupon code here! For example: "Use code COMEBACK10 for 10% off!"
    const couponMessage = ""; 

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a;">Did you forget something?</h1>
        <p>Hello ${userName || 'there'},</p>
        <p>We noticed that you left some items in your cart. They are waiting for you!</p>
        
        <div style="margin: 20px 0;">
          ${couponMessage ? `<p style="font-size: 16px; font-weight: bold; color: #d97706;">${couponMessage}</p>` : ''}
        </div>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Your Cart Summary</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${cart.cartData?.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px 0;">
                <strong>${item.title || 'Product'}</strong>
              </td>
              <td style="padding: 15px 0; text-align: center;">×${item.quantity}</td>
              <td style="padding: 15px 0; text-align: right;">${formatPrice(item.price)}</td>
            </tr>
          `).join('') || ''}
        </table>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${checkoutUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Complete my purchase
          </a>
        </div>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px;">
          If you have any questions, feel free to contact us.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Complete your purchase`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

