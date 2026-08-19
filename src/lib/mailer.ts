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

  return { transporter, from: settings.SMTP_FROM || `"Shopelios" <${settings.SMTP_USER}>`, logo: settings.HEADER_LOGO_IMAGE };
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
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
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
        <p>Nous avons bien reçu votre commande <strong>#${order.id.slice(-6).toUpperCase()}</strong>.</p>
        <p>Elle est actuellement en attente jusqu'à confirmation du traitement de votre paiement (si applicable) ou sera expédiée très prochainement.</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Résumé de la commande</h3>
        <p style="color: #666; font-size: 13px;">Commande n°${order.id.slice(-6).toUpperCase()} (${formatDate(new Date(order.createdAt))})</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${order.orderItems?.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px 0;">
                <strong>${item.product?.title || 'Produit'}</strong>
              </td>
              <td style="padding: 15px 0; text-align: center;">×${item.quantity}</td>
              <td style="padding: 15px 0; text-align: right;">${formatPrice(item.price)}</td>
            </tr>
          `).join('') || ''}
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
      subject: \`Confirmation de commande #\${order.id.slice(-6).toUpperCase()}\`,
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
        <p>Vous avez reçu une nouvelle commande de <strong>${customerDetails.name || 'un client'}</strong> :</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Bestellübersicht (Résumé)</h3>
        <p style="color: #666; font-size: 13px;">Numéro de commande ${order.id.slice(-6).toUpperCase()} (${formatDate(new Date(order.createdAt))})</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead style="text-align: left; border-bottom: 1px solid #eee;">
            <tr>
              <th style="padding-bottom: 10px;">Produit</th>
              <th style="padding-bottom: 10px; text-align: center;">Quantité</th>
              <th style="padding-bottom: 10px; text-align: right;">Prix</th>
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
              Méthode : ${order.paymentMethod}<br/>
              Statut : ${order.status}
            </td>
          </tr>
        </table>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: \`Nouvelle Commande #\${order.id.slice(-6).toUpperCase()}\`,
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

    let title = "Mise à jour de votre commande";
    let message = \`Le statut de votre commande <strong>#\${order.id.slice(-6).toUpperCase()}</strong> a été mis à jour.\`;
    let color = "#333";

    if (status === 'SHIPPED') {
      title = "Bonne nouvelle ! Votre commande est en route 🚚";
      message = \`Votre commande <strong>#\${order.id.slice(-6).toUpperCase()}</strong> a été expédiée. Vous pouvez suivre la livraison depuis votre espace compte.\`;
      color = "#16a34a"; // green
    } else if (status === 'CANCELLED') {
      title = "Information concernant votre commande";
      message = \`Nous vous informons que votre commande <strong>#\${order.id.slice(-6).toUpperCase()}</strong> a malheureusement été <strong>annulée</strong>. Si un paiement a été effectué, le remboursement est en cours de traitement.\`;
      color = "#dc2626"; // red
    } else if (status === 'DELIVERED') {
      title = "Votre commande a été livrée !";
      message = \`Votre commande <strong>#\${order.id.slice(-6).toUpperCase()}</strong> est marquée comme livrée. Nous espérons que vous en êtes satisfait !\`;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: ${color};">${title}</h1>
        <p>Bonjour,</p>
        <p>${message}</p>
        
        <p style="margin-top: 30px;">
          N'hésitez pas à nous contacter pour toute question supplémentaire.
        </p>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
          L'équipe de votre boutique.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: \`Mise à jour de la commande #\${order.id.slice(-6).toUpperCase()}\`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}
