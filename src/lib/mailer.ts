import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

// HTML escape utility to prevent XSS in email templates
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
export async function sendEmail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: any[] }) {
  try {
    const { transporter, from } = await getTransporter();
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments,
    });

    // Message sent successfully
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
        <p>Bonjour ${escapeHtml(userName) || 'Client'},</p>
        <p>We have received your order <strong>#${order.id.slice(-6).toUpperCase()}</strong>.</p>
        <p>Elle est en cours de traitement et sera expédiée très prochainement.</p>
        
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

    const { generateInvoicePDF } = await import('./pdfGenerator');
    let pdfAttachment: any = null;
    try {
      const pdfBuffer = await generateInvoicePDF(order);
      pdfAttachment = {
        filename: `facture-${order.id.slice(-6).toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      };
    } catch (pdfErr) {
      console.error('Failed to generate PDF invoice', pdfErr);
    }

    return sendEmail({
      to: userEmail,
      subject: `Confirmation de commande #${order.id.slice(-6).toUpperCase()}`,
      html,
      attachments: pdfAttachment ? [pdfAttachment] : []
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
        <p>You have received a new order from <strong>${escapeHtml(customerDetails.name) || 'a customer'}</strong> :</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Order Summary</h3>
        <p style="color: #666; font-size: 13px;">Commande N° ${order.id.slice(-6).toUpperCase()} (${formatDate(new Date(order.createdAt))})</p>
        
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
              ${escapeHtml(customerDetails.name) || ''}<br/>
              ${escapeHtml(customerDetails.email) || ''}
            </td>
            <td style="vertical-align: top; width: 50%;">
              <strong>Paiement</strong><br/>
              Moyen de paiement : ${order.paymentMethod}<br/>
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

    let title = "Votre commande a été mise à jour";
    let message = `Le statut de votre commande <strong>#${order.id.slice(-6).toUpperCase()}</strong> a été mis à jour.`;
    let color = "#333";

    if (status === 'SHIPPED') {
      title = "Bonne nouvelle ! Votre commande est en route 🚚";
      message = `Your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> a été expédiée. Vous pouvez suivre la livraison depuis votre compte.`;
      color = "#16a34a"; // green
    } else if (status === 'CANCELLED') {
      title = "Information concernant votre commande";
      message = `Nous vous informons que votre commande <strong>#${order.id.slice(-6).toUpperCase()}</strong> a malheureusement été <strong>annulée</strong>. Si un paiement a été effectué, le remboursement est en cours de traitement.`;
      color = "#dc2626"; // red
    } else if (status === 'DELIVERED') {
      title = "Votre commande a été livrée !";
      message = `Votre commande <strong>#${order.id.slice(-6).toUpperCase()}</strong> est marquée comme livrée. Nous espérons que vous en êtes satisfait !`;
      color = "#16a34a";
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: ${color};">${title}</h1>
        <p>Bonjour,</p>
        <p>${message}</p>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
          N'hésitez pas à nous contacter pour toute question supplémentaire.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Mise à jour de votre commande #${order.id.slice(-6).toUpperCase()}`,
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
        <h1 style="font-size: 24px; color: #1a1a1a;">Panier abandonné</h1>
        <p>Bonjour ${escapeHtml(userName) || 'Client'},</p>
        <p>Nous avons remarqué que vous avez laissé des articles dans votre panier. Ils vous attendent !</p>
        
        <div style="margin: 20px 0;">
          ${couponMessage ? `<p style="font-size: 16px; font-weight: bold; color: #d97706;">${couponMessage}</p>` : ''}
        </div>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Résumé de votre panier</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${cart.cartData?.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px 0;">
                <strong>${item.title || 'Produit'}</strong>
              </td>
              <td style="padding: 15px 0; text-align: center;">×${item.quantity}</td>
              <td style="padding: 15px 0; text-align: right;">${formatPrice(item.price)}</td>
            </tr>
          `).join('') || ''}
        </table>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${checkoutUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Finaliser ma commande
          </a>
        </div>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px;">
          Si vous avez des questions, n'hésitez pas à nous contacter.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Finalisez votre commande`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}


// 5. Review Request Email
export async function sendReviewRequestEmail(order: any, userEmail: string, userName: string, storeUrl: string) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: "" }));
    
    const logoHtml = logo ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 50px;"></div>` : "";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a;">Comment s'est passée votre commande ?</h1>
        <p>Bonjour ${escapeHtml(userName) || "Client"},</p>
        <p>Nous espérons que vous profitez bien des articles de votre récente commande sur notre boutique !</p>
        <p>Votre avis est très important pour nous et aide d'autres clients à faire le bon choix.</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Laissez un avis sur vos articles</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${order.orderItems?.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px 0;">
                <strong>${item.product?.title || "Produit"}</strong>
              </td>
              <td style="padding: 15px 0; text-align: right;">
                <a href="${storeUrl}/product/${item.product?.slug || item.product?.id}" style="background-color: #ea580c; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                  Donner mon avis
                </a>
              </td>
            </tr>
          `).join("") || ""}
        </table>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px;">
          Merci de prendre le temps de partager votre expérience.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Laissez un avis sur votre récente commande #${order.id.slice(-6).toUpperCase()}`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}


// 6. Admin Low Stock Alert
export async function sendLowStockAlertEmail(productTitle: string, variationName: string | null, currentStock: number, threshold: number, adminEmail: string, storeUrl: string, productId: string) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: "" }));
    
    const logoHtml = logo ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 40px;"></div>` : "";

    const productName = variationName ? `${productTitle} (${variationName})` : productTitle;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #dc2626;">Alerte : Stock Faible</h1>
        <p>Bonjour,</p>
        <p>Le stock du produit suivant est passé sous le seuil d'alerte (${threshold} unités).</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">${escapeHtml(productName)}</h3>
          <p style="margin-bottom: 0; font-size: 16px;"><strong>Stock restant : <span style="color: #dc2626;">${currentStock}</span></strong></p>
        </div>
        
        <p style="margin-top: 30px;">
          <a href="${storeUrl}/admin/products/${productId}/edit" style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Gérer le stock
          </a>
        </p>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `[Alerte Stock] ${productName} - Plus que ${currentStock} en stock`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}


// 7. Admin New Chat Message Notification
export async function sendAdminNewChatMessageEmail(guestName: string, guestEmail: string | null, messageContent: string, adminEmail: string, storeUrl: string) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: "" }));
    
    const logoHtml = logo ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 40px;"></div>` : "";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a;">Nouveau message de support</h1>
        <p>Un visiteur vient de laisser un message sur le chat de votre boutique.</p>

        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
          <tr>
            <td style="padding: 10px;"><strong>De :</strong></td>
            <td style="padding: 10px;">${escapeHtml(guestName) || "Visiteur"} ${guestEmail ? `(${escapeHtml(guestEmail)})` : ""}</td>
          </tr>
          <tr>
            <td style="padding: 10px; vertical-align: top;"><strong>Message :</strong></td>
            <td style="padding: 10px; font-style: italic;">"${escapeHtml(messageContent)}"</td>
          </tr>
        </table>
        
        <p style="margin-top: 30px;">
          <a href="${storeUrl}/admin/chat" style="background-color: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Ouvrir le Chat Admin
          </a>
        </p>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `[Support Chat] Nouveau message de ${escapeHtml(guestName) || "Visiteur"}`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

