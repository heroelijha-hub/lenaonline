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
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'long' }).format(date);
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
        <h1 style="font-size: 24px; color: #1a1a1a;">Vielen Dank für Ihre Bestellung</h1>
        <p>Hallo ${escapeHtml(userName) || 'Kunde'},</p>
        <p>Wir haben Ihre Bestellung <strong>#${order.id.slice(-6).toUpperCase()}</strong> erhalten.</p>
        <p>Sie wird derzeit bearbeitet und in Kürze versandt.</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Zusammenfassung der Bestellung</h3>
        <p style="color: #666; font-size: 13px;">Bestellung Nr. ${order.id.slice(-6).toUpperCase()} (${formatDate(new Date(order.createdAt))})</p>
        
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
                <strong>${item.product?.title || 'Produkt'}</strong>${attrString}
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
          Nochmals vielen Dank! Kontaktieren Sie uns, wenn Sie Hilfe bei Ihrer Bestellung benötigen.
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
      subject: `Bestellbestätigung #${order.id.slice(-6).toUpperCase()}`,
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
        <h1 style="font-size: 24px; color: #1a1a1a;">Neue Bestellung: Nr. ${order.id.slice(-6).toUpperCase()}</h1>
        <p>Sie haben eine neue Bestellung von <strong>${escapeHtml(customerDetails.name) || 'einem Kunden'}</strong> erhalten:</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Zusammenfassung der Bestellung</h3>
        <p style="color: #666; font-size: 13px;">Bestellung Nr. ${order.id.slice(-6).toUpperCase()} (${formatDate(new Date(order.createdAt))})</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead style="text-align: left; border-bottom: 1px solid #eee;">
            <tr>
              <th style="padding-bottom: 10px;">Produkt</th>
              <th style="padding-bottom: 10px; text-align: center;">Menge</th>
              <th style="padding-bottom: 10px; text-align: right;">Preis</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems?.map((item: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px 0;">${item.product?.title || 'Produkt'}</td>
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
              <strong>Kunde / Kontakt</strong><br/>
              ${escapeHtml(customerDetails.name) || ''}<br/>
              ${escapeHtml(customerDetails.email) || ''}
            </td>
            <td style="vertical-align: top; width: 50%;">
              <strong>Zahlung</strong><br/>
              Zahlungsmethode: ${order.paymentMethod}<br/>
              Status: ${order.status}
            </td>
          </tr>
        </table>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `Neue Bestellung #${order.id.slice(-6).toUpperCase()}`,
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

    let title = "Ihre Bestellung wurde aktualisiert";
    let message = `Der Status Ihrer Bestellung <strong>#${order.id.slice(-6).toUpperCase()}</strong> wurde aktualisiert.`;
    let color = "#333";

    if (status === 'SHIPPED') {
      title = "Gute Neuigkeiten! Ihre Bestellung ist unterwegs 🚚";
      message = `Ihre Bestellung <strong>#${order.id.slice(-6).toUpperCase()}</strong> wurde versandt. Sie können die Lieferung in Ihrem Konto verfolgen.`;
      color = "#16a34a"; // green
    } else if (status === 'CANCELLED') {
      title = "Informationen zu Ihrer Bestellung";
      message = `Wir möchten Sie darüber informieren, dass Ihre Bestellung <strong>#${order.id.slice(-6).toUpperCase()}</strong> leider <strong>storniert</strong> wurde. Falls eine Zahlung getätigt wurde, wird die Rückerstattung derzeit bearbeitet.`;
      color = "#dc2626"; // red
    } else if (status === 'DELIVERED') {
      title = "Ihre Bestellung wurde zugestellt!";
      message = `Ihre Bestellung <strong>#${order.id.slice(-6).toUpperCase()}</strong> wurde als zugestellt markiert. Wir hoffen, Sie sind zufrieden!`;
      color = "#16a34a";
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: ${color};">${title}</h1>
        <p>Hallo,</p>
        <p>${message}</p>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
          Zögern Sie nicht, uns bei weiteren Fragen zu kontaktieren.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Aktualisierung Ihrer Bestellung #${order.id.slice(-6).toUpperCase()}`,
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
        <h1 style="font-size: 24px; color: #1a1a1a;">Verlassener Warenkorb</h1>
        <p>Hallo ${escapeHtml(userName) || 'Kunde'},</p>
        <p>Wir haben festgestellt, dass Sie Artikel in Ihrem Warenkorb gelassen haben. Sie warten auf Sie!</p>
        
        <div style="margin: 20px 0;">
          ${couponMessage ? `<p style="font-size: 16px; font-weight: bold; color: #d97706;">${couponMessage}</p>` : ''}
        </div>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Zusammenfassung Ihres Warenkorbs</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${cart.cartData?.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px 0;">
                <strong>${item.title || 'Produkt'}</strong>
              </td>
              <td style="padding: 15px 0; text-align: center;">×${item.quantity}</td>
              <td style="padding: 15px 0; text-align: right;">${formatPrice(item.price)}</td>
            </tr>
          `).join('') || ''}
        </table>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${checkoutUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Bestellung abschließen
          </a>
        </div>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px;">
          Wenn Sie Fragen haben, zögern Sie nicht, uns zu kontaktieren.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Schließen Sie Ihre Bestellung ab`,
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
        <h1 style="font-size: 24px; color: #1a1a1a;">Wie war Ihre Bestellung?</h1>
        <p>Hallo ${escapeHtml(userName) || "Kunde"},</p>
        <p>Wir hoffen, dass Sie die Artikel aus Ihrer letzten Bestellung in unserem Shop genießen!</p>
        <p>Ihre Meinung ist uns sehr wichtig und hilft anderen Kunden, die richtige Wahl zu treffen.</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Hinterlassen Sie eine Bewertung</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${order.orderItems?.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 15px 0;">
                <strong>${item.product?.title || "Produkt"}</strong>
              </td>
              <td style="padding: 15px 0; text-align: right;">
                <a href="${storeUrl}/product/${item.product?.slug || item.product?.id}" style="background-color: #ea580c; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                  Meine Bewertung abgeben
                </a>
              </td>
            </tr>
          `).join("") || ""}
        </table>
        
        <p style="margin-top: 40px; color: #666; font-size: 14px;">
          Vielen Dank, dass Sie sich die Zeit nehmen, Ihre Erfahrung zu teilen.
        </p>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Hinterlassen Sie eine Bewertung zu Ihrer letzten Bestellung #${order.id.slice(-6).toUpperCase()}`,
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
        <h1 style="font-size: 24px; color: #dc2626;">Warnung: Geringer Bestand</h1>
        <p>Hallo,</p>
        <p>Der Bestand des folgenden Produkts ist unter die Warnschwelle gefallen (${threshold} Einheiten).</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">${escapeHtml(productName)}</h3>
          <p style="margin-bottom: 0; font-size: 16px;"><strong>Verbleibender Bestand: <span style="color: #dc2626;">${currentStock}</span></strong></p>
        </div>
        
        <p style="margin-top: 30px;">
          <a href="${storeUrl}/admin/products/${productId}/edit" style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Bestand verwalten
          </a>
        </p>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `[Bestandswarnung] ${productName} - Nur noch ${currentStock} auf Lager`,
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
        <h1 style="font-size: 24px; color: #1a1a1a;">Neue Support-Nachricht</h1>
        <p>Ein Besucher hat gerade eine Nachricht im Chat Ihres Shops hinterlassen.</p>

        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
          <tr>
            <td style="padding: 10px;"><strong>Von:</strong></td>
            <td style="padding: 10px;">${escapeHtml(guestName) || "Besucher"} ${guestEmail ? `(${escapeHtml(guestEmail)})` : ""}</td>
          </tr>
          <tr>
            <td style="padding: 10px; vertical-align: top;"><strong>Nachricht:</strong></td>
            <td style="padding: 10px; font-style: italic;">"${escapeHtml(messageContent)}"</td>
          </tr>
        </table>
        
        <p style="margin-top: 30px;">
          <a href="${storeUrl}/admin/chat" style="background-color: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Admin-Chat öffnen
          </a>
        </p>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `[Support-Chat] Neue Nachricht von ${escapeHtml(guestName) || "Besucher"}`,
      html
    });
  } catch (e) {
    console.error(e);
  }
}

