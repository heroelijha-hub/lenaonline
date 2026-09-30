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

    let metadata: any = {};
    if (order.destinationAddress) {
      try {
        metadata = typeof order.destinationAddress === 'string' ? JSON.parse(order.destinationAddress) : order.destinationAddress;
      } catch (e) {}
    }

    const subTotal = metadata?.subTotal || order.orderItems?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || order.total;
    const shippingCostStr = metadata?.shippingCost === 0 ? "Kostenlos!" : (metadata?.shippingCost ? formatPrice(metadata.shippingCost) : "0,00 €");
    const shippingMethod = metadata?.shippingMethodName ? `(${metadata.shippingMethodName})` : "";
    
    // Addresses
    const b = metadata?.billing || {};
    const s = metadata?.shipping || b;
    const billingName = `${b.firstName || ''} ${b.lastName || ''}`.trim() || escapeHtml(customerDetails.name) || 'Kunde';
    const shippingName = `${s.firstName || ''} ${s.lastName || ''}`.trim() || billingName;
    const billingAddressHtml = `${b.address1 || ''}<br/>${b.postalCode || ''} ${b.city || ''}${b.country ? `, ${b.country}` : ''}`;
    const shippingAddressHtml = `${s.address1 || ''}<br/>${s.postalCode || ''} ${s.city || ''}${s.country ? `, ${s.country}` : ''}`;
    
    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "Top Kamin Brennstoffe";
    
    // Payment Method mapping
    let paymentMethodStr = order.paymentMethod;
    if (paymentMethodStr === 'BANK_TRANSFER') paymentMethodStr = 'Direkte Banküberweisung';
    if (paymentMethodStr === 'STRIPE') paymentMethodStr = 'Kreditkarte';
    if (paymentMethodStr === 'PAYPAL') paymentMethodStr = 'PayPal';

    const orderId = order.id.slice(-6).toUpperCase();

    const itemsHtml = order.orderItems?.map((item: any) => {
      let imageUrl = '';
      if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
        imageUrl = typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url;
      } else if (typeof item.product?.images === 'string') {
        try {
          const imgs = JSON.parse(item.product.images);
          if (imgs.length > 0) imageUrl = imgs[0];
        } catch(e) {}
      }

      const imgTag = imageUrl ? `<img src="${imageUrl}" alt="Product" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;" />` : '';
      
      let sku = item.product?.sku ? `(#${item.product.sku})` : '';

      return `
        <tr style="border-bottom: 1px dashed #eee;">
          <td style="padding: 15px 0;">
            <table style="width: 100%; border: none;">
              <tr>
                <td style="width: 65px; vertical-align: middle;">${imgTag}</td>
                <td style="vertical-align: middle;">
                  <span style="font-size: 13px; color: #333;">${escapeHtml(item.product?.title || 'Produkt')}</span><br/>
                  <span style="font-size: 12px; color: #666;">${sku}</span>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 15px 0; text-align: center; vertical-align: middle; color: #666; font-size: 13px;">×${item.quantity}</td>
          <td style="padding: 15px 0; text-align: right; vertical-align: middle; color: #666; font-size: 13px;">${formatPrice(item.price)}</td>
        </tr>
      `;
    }).join('') || '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a; margin-top: 0; margin-bottom: 15px;">Neue Bestellung: Nr. ${orderId}</h1>
        <p style="font-size: 13px; color: #666;">Du hast eine neue Bestellung von ${escapeHtml(customerDetails.name) || 'einem Kunden'} erhalten:</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-top: 35px; margin-bottom: 5px;">Bestellübersicht</h3>
        <p style="color: #eab308; font-size: 12px; font-weight: bold; margin-top: 0; margin-bottom: 25px;">Bestellung Nr. ${orderId} (${formatDate(new Date(order.createdAt))})</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead style="text-align: left; border-bottom: 1px solid #eee;">
            <tr>
              <th style="padding-bottom: 10px; font-weight: bold; font-size: 12px; color: #333;">Produkt</th>
              <th style="padding-bottom: 10px; text-align: center; font-weight: bold; font-size: 12px; color: #333;">Anzahl</th>
              <th style="padding-bottom: 10px; text-align: right; font-weight: bold; font-size: 12px; color: #333;">Preis</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 25px;">
          <table style="width: 100%; font-size: 13px; color: #666; line-height: 2;">
            <tr>
              <td>Zwischensumme:</td>
              <td style="text-align: right;">${formatPrice(subTotal)}</td>
            </tr>
            <tr>
              <td>Versand: Gratis Lieferung ${shippingMethod}</td>
              <td style="text-align: right;">${shippingCostStr}</td>
            </tr>
            <tr style="color: #1a1a1a; font-size: 14px;">
              <td><strong>Gesamt:</strong></td>
              <td style="text-align: right;"><strong>${formatPrice(order.total)}</strong></td>
            </tr>
            <tr>
              <td>Zahlungsart:</td>
              <td style="text-align: right;">${paymentMethodStr}</td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-top: 30px; padding-top: 25px; padding-bottom: 25px;">
          <table style="width: 100%; font-size: 12px; color: #333; line-height: 1.4;">
            <tr>
              <td style="vertical-align: top; width: 50%;">
                <strong style="font-size: 13px;">Rechnungsadresse</strong><br/>
                <div style="margin-top: 8px;">
                  ${billingName}<br/>
                  ${billingAddressHtml}<br/>
                  ${b.phone ? `<span style="color: #eab308;">${escapeHtml(b.phone)}</span><br/>` : ''}
                  ${b.email ? `<a href="mailto:${b.email}" style="color: #2563eb; text-decoration: underline;">${escapeHtml(b.email)}</a>` : ''}
                </div>
              </td>
              <td style="vertical-align: top; width: 50%;">
                <strong style="font-size: 13px;">Lieferadresse</strong><br/>
                <div style="margin-top: 8px;">
                  ${shippingName}<br/>
                  ${shippingAddressHtml}<br/>
                  ${s.phone ? `<span style="color: #eab308;">${escapeHtml(s.phone)}</span>` : ''}
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 40px; margin-bottom: 40px; font-size: 13px;">
          <p style="margin-bottom: 8px; color: #333;">Herzlichen Glückwunsch zum Verkauf!</p>
          <p style="color: #666; margin-top: 0;">Verarbeite deine Bestellungen unterwegs. <a href="#" style="color: #eab308; text-decoration: underline;">Hol dir die App</a>.</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 25px; text-align: center; font-size: 10px; color: #eab308; text-transform: uppercase;">
          <strong>${storeName}</strong><br/>
          GRAZER STR. 29, 40789 MONHEIM, DEUTSCHLAND
        </div>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `Neue Bestellung #${orderId}`,
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

