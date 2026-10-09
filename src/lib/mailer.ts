import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

// HTML escape utility to prevent XSS in email templates
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Fetch SMTP settings from DB
async function getTransporter() {
  const settingsDb = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          "SMTP_HOST",
          "SMTP_PORT",
          "SMTP_USER",
          "SMTP_PASS",
          "SMTP_FROM",
          "HEADER_LOGO_IMAGE",
        ],
      },
    },
  });

  const settings = settingsDb.reduce(
    (acc, s) => ({ ...acc, [s.key]: s.value }),
    {} as Record<string, string>,
  );

  if (!settings.SMTP_HOST || !settings.SMTP_USER || !settings.SMTP_PASS) {
    throw new Error("SMTP configuration is missing in the database.");
  }

  const transporter = nodemailer.createTransport({
    host: settings.SMTP_HOST,
    port: parseInt(settings.SMTP_PORT || "587"),
    secure: settings.SMTP_PORT === "465",
    auth: {
      user: settings.SMTP_USER,
      pass: settings.SMTP_PASS,
    },
  });

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "My Store";
  return {
    transporter,
    from: settings.SMTP_FROM || `"${storeName}" <${settings.SMTP_USER}>`,
    logo: settings.HEADER_LOGO_IMAGE,
  };
}

// General email sender
export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}) {
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
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(date);
};

// --- EMAIL TEMPLATES ---

// 1. Client Order Confirmation
export async function sendClientOrderConfirmation(
  order: any,
  userEmail: string,
  userName: string,
) {
  try {
    const { logo, from } = await getTransporter().catch(() => ({
      logo: "",
      from: "",
    }));

    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 40px;"></div>`
      : "";

    let metadata: any = {};
    if (order.destinationAddress) {
      try {
        metadata =
          typeof order.destinationAddress === "string"
            ? JSON.parse(order.destinationAddress)
            : order.destinationAddress;
      } catch (e) {}
    }

    const subTotal =
      metadata?.subTotal ||
      order.orderItems?.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0,
      ) ||
      order.total;
    const shippingCostStr =
      metadata?.shippingCost === 0
        ? "¡Gratis!"
        : metadata?.shippingCost
          ? formatPrice(metadata.shippingCost)
          : "0,00 €";
    const shippingMethod = metadata?.shippingMethodName
      ? `(${metadata.shippingMethodName})`
      : "";

    // Addresses
    const b = metadata?.billing || {};
    const s = metadata?.shipping || b;
    const billingName =
      `${b.firstName || ""} ${b.lastName || ""}`.trim() ||
      escapeHtml(userName) ||
      "Cliente";
    const shippingName =
      `${s.firstName || ""} ${s.lastName || ""}`.trim() || billingName;
    const billingAddressHtml = `${b.address1 || ""}<br/>${b.postalCode || ""} ${b.city || ""}${b.country ? `, ${b.country}` : ""}`;
    const shippingAddressHtml = `${s.address1 || ""}<br/>${s.postalCode || ""} ${s.city || ""}${s.country ? `, ${s.country}` : ""}`;

    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "LEÑA ONLINE SL";
    const storeEmailMatch = from.match(/<(.+)>/);
    const storeEmail = storeEmailMatch
      ? storeEmailMatch[1]
      : "info@lenaonline.com";

    // Payment Method mapping
    let paymentMethodStr = order.paymentMethod;
    if (paymentMethodStr === "BANK_TRANSFER")
      paymentMethodStr = "Transferencia bancaria directa";
    if (paymentMethodStr === "STRIPE") paymentMethodStr = "Tarjeta de crédito";
    if (paymentMethodStr === "PAYPAL") paymentMethodStr = "PayPal";

    const orderId = order.id.slice(-6).toUpperCase();

    const itemsHtml =
      order.orderItems
        ?.map((item: any) => {
          let imageUrl = "";
          if (
            item.product?.images &&
            Array.isArray(item.product.images) &&
            item.product.images.length > 0
          ) {
            imageUrl =
              typeof item.product.images[0] === "string"
                ? item.product.images[0]
                : item.product.images[0].url;
          } else if (typeof item.product?.images === "string") {
            try {
              const imgs = JSON.parse(item.product.images);
              if (imgs.length > 0) imageUrl = imgs[0];
            } catch (e) {}
          }

          const imgTag = imageUrl
            ? `<img src="${imageUrl}" alt="Product" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;" />`
            : "";

          let sku = item.product?.sku ? `(#${item.product.sku})` : "";

          return `
        <tr style="border-bottom: 1px dashed #eee;">
          <td style="padding: 15px 0;">
            <table style="width: 100%; border: none;">
              <tr>
                <td style="width: 65px; vertical-align: middle;">${imgTag}</td>
                <td style="vertical-align: middle;">
                  <span style="font-size: 13px; color: #333;">${escapeHtml(item.product?.title || "Producto")}</span><br/>
                  <span style="font-size: 12px; color: #666;">${sku}</span>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 15px 0; text-align: center; vertical-align: middle; color: #666; font-size: 13px;">Ã—${item.quantity}</td>
          <td style="padding: 15px 0; text-align: right; vertical-align: middle; color: #666; font-size: 13px;">${formatPrice(item.price)}</td>
        </tr>
      `;
        })
        .join("") || "";

    // Bank Details logic
    let bankDetailsHtml = "";
    if (order.paymentMethod === "BANK_TRANSFER") {
      const dbSettings = await prisma.setting.findMany({
        where: {
          key: {
            in: [
              "BANK_TRANSFER_ACCOUNT_HOLDER",
              "BANK_TRANSFER_IBAN",
              "BANK_TRANSFER_BIC",
              "BANK_TRANSFER_BANK_NAME",
              "BANK_TRANSFER_INSTRUCTIONS",
            ],
          },
        },
      });
      const settings = dbSettings.reduce(
        (acc, s) => ({ ...acc, [s.key]: s.value }),
        {} as Record<string, string>,
      );

      bankDetailsHtml = `
        <div style="background-color: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin-top: 25px; margin-bottom: 25px;">
          <h4 style="margin-top: 0; margin-bottom: 15px; color: #1a1a1a; font-size: 14px;">Detalles de su transferencia bancaria</h4>
          <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Por favor, transfiera el importe de la factura a la siguiente cuenta. Indique como concepto su número de pedido <strong>${orderId}</strong> an.</p>
          <table style="width: 100%; font-size: 13px; color: #333; line-height: 1.6;">
            ${settings.BANK_TRANSFER_ACCOUNT_HOLDER ? `<tr><td style="width: 150px; color: #666;">Titular de la cuenta:</td><td><strong>${settings.BANK_TRANSFER_ACCOUNT_HOLDER}</strong></td></tr>` : ""}
            ${settings.BANK_TRANSFER_IBAN ? `<tr><td style="color: #666;">IBAN:</td><td><strong>${settings.BANK_TRANSFER_IBAN}</strong></td></tr>` : ""}
            ${settings.BANK_TRANSFER_BIC ? `<tr><td style="color: #666;">BIC:</td><td><strong>${settings.BANK_TRANSFER_BIC}</strong></td></tr>` : ""}
            ${settings.BANK_TRANSFER_BANK_NAME ? `<tr><td style="color: #666;">Banco:</td><td><strong>${settings.BANK_TRANSFER_BANK_NAME}</strong></td></tr>` : ""}
          </table>
        </div>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a; margin-top: 0; margin-bottom: 15px;">Detalles del pedido n.º ${orderId}</h1>
        <p style="font-size: 13px; color: #666;">Hola ${escapeHtml(userName) || "Cliente"},</p>
        <p style="font-size: 13px; color: #666;">Estos son los detalles de su pedido del ${formatDate(new Date(order.createdAt))}:</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-top: 35px; margin-bottom: 5px;">Resumen del pedido</h3>
        <p style="color: #eab308; font-size: 12px; font-weight: bold; margin-top: 0; margin-bottom: 25px;">Pedido n.º ${orderId} (${formatDate(new Date(order.createdAt))})</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead style="text-align: left; border-bottom: 1px solid #eee;">
            <tr>
              <th style="padding-bottom: 10px; font-weight: bold; font-size: 12px; color: #333;">Producto</th>
              <th style="padding-bottom: 10px; text-align: center; font-weight: bold; font-size: 12px; color: #333;">Cantidad</th>
              <th style="padding-bottom: 10px; text-align: right; font-weight: bold; font-size: 12px; color: #333;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 25px;">
          <table style="width: 100%; font-size: 13px; color: #666; line-height: 2;">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">${formatPrice(subTotal)}</td>
            </tr>
            <tr>
              <td>Envío: Envío gratis ${shippingMethod}</td>
              <td style="text-align: right;">${shippingCostStr}</td>
            </tr>
            <tr style="color: #1a1a1a; font-size: 14px;">
              <td><strong>Total:</strong></td>
              <td style="text-align: right;"><strong>${formatPrice(order.total)}</strong></td>
            </tr>
            <tr>
              <td>Método de pago:</td>
              <td style="text-align: right;">${paymentMethodStr}</td>
            </tr>
          </table>
        </div>

        ${bankDetailsHtml}

        <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-top: 30px; padding-top: 25px; padding-bottom: 25px;">
          <table style="width: 100%; font-size: 12px; color: #333; line-height: 1.4;">
            <tr>
              <td style="vertical-align: top; width: 50%;">
                <strong style="font-size: 13px;">Dirección de facturación</strong><br/>
                <div style="margin-top: 8px;">
                  ${billingName}<br/>
                  ${billingAddressHtml}<br/>
                  ${b.phone ? `<span style="color: #eab308;">${escapeHtml(b.phone)}</span><br/>` : ""}
                  ${b.email ? `<a href="mailto:${b.email}" style="color: #2563eb; text-decoration: underline;">${escapeHtml(b.email)}</a>` : ""}
                </div>
              </td>
              <td style="vertical-align: top; width: 50%;">
                <strong style="font-size: 13px;">Dirección de envío</strong><br/>
                <div style="margin-top: 8px;">
                  ${shippingName}<br/>
                  ${shippingAddressHtml}<br/>
                  ${s.phone ? `<span style="color: #eab308;">${escapeHtml(s.phone)}</span>` : ""}
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 40px; margin-bottom: 40px; font-size: 13px;">
          <p style="color: #333;">¡Muchas gracias! Si necesita ayuda con su pedido, puede contactarnos en cualquier momento en <a href="mailto:${storeEmail}" style="color: #2563eb; text-decoration: underline;">${storeEmail}</a> kontaktieren.</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 25px; text-align: center; font-size: 10px; color: #eab308; text-transform: uppercase;">
          <strong>${storeName}</strong><br/>
          
        </div>
      </div>
    `;

    const { generateInvoicePDF } = await import("./pdfGenerator");
    let pdfAttachment: any = null;
    try {
      const pdfBuffer = await generateInvoicePDF(order);
      pdfAttachment = {
        filename: `rechnung-${orderId}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      };
    } catch (pdfErr) {
      console.error("Failed to generate PDF invoice", pdfErr);
    }

    return sendEmail({
      to: userEmail,
      subject: `Confirmación de pedido #${orderId}`,
      html,
      attachments: pdfAttachment ? [pdfAttachment] : [],
    });
  } catch (e) {
    console.error(e);
  }
}

// 2. Admin New Order Notification
export async function sendAdminOrderNotification(
  order: any,
  adminEmail: string,
  customerDetails: any,
) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: "" }));

    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 40px;"></div>`
      : "";

    let metadata: any = {};
    if (order.destinationAddress) {
      try {
        metadata =
          typeof order.destinationAddress === "string"
            ? JSON.parse(order.destinationAddress)
            : order.destinationAddress;
      } catch (e) {}
    }

    const subTotal =
      metadata?.subTotal ||
      order.orderItems?.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0,
      ) ||
      order.total;
    const shippingCostStr =
      metadata?.shippingCost === 0
        ? "¡Gratis!"
        : metadata?.shippingCost
          ? formatPrice(metadata.shippingCost)
          : "0,00 €";
    const shippingMethod = metadata?.shippingMethodName
      ? `(${metadata.shippingMethodName})`
      : "";

    // Addresses
    const b = metadata?.billing || {};
    const s = metadata?.shipping || b;
    const billingName =
      `${b.firstName || ""} ${b.lastName || ""}`.trim() ||
      escapeHtml(customerDetails.name) ||
      "Cliente";
    const shippingName =
      `${s.firstName || ""} ${s.lastName || ""}`.trim() || billingName;
    const billingAddressHtml = `${b.address1 || ""}<br/>${b.postalCode || ""} ${b.city || ""}${b.country ? `, ${b.country}` : ""}`;
    const shippingAddressHtml = `${s.address1 || ""}<br/>${s.postalCode || ""} ${s.city || ""}${s.country ? `, ${s.country}` : ""}`;

    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "LEÑA ONLINE SL";

    // Payment Method mapping
    let paymentMethodStr = order.paymentMethod;
    if (paymentMethodStr === "BANK_TRANSFER")
      paymentMethodStr = "Transferencia bancaria directa";
    if (paymentMethodStr === "STRIPE") paymentMethodStr = "Tarjeta de crédito";
    if (paymentMethodStr === "PAYPAL") paymentMethodStr = "PayPal";

    const orderId = order.id.slice(-6).toUpperCase();

    const itemsHtml =
      order.orderItems
        ?.map((item: any) => {
          let imageUrl = "";
          if (
            item.product?.images &&
            Array.isArray(item.product.images) &&
            item.product.images.length > 0
          ) {
            imageUrl =
              typeof item.product.images[0] === "string"
                ? item.product.images[0]
                : item.product.images[0].url;
          } else if (typeof item.product?.images === "string") {
            try {
              const imgs = JSON.parse(item.product.images);
              if (imgs.length > 0) imageUrl = imgs[0];
            } catch (e) {}
          }

          const imgTag = imageUrl
            ? `<img src="${imageUrl}" alt="Product" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;" />`
            : "";

          let sku = item.product?.sku ? `(#${item.product.sku})` : "";

          return `
        <tr style="border-bottom: 1px dashed #eee;">
          <td style="padding: 15px 0;">
            <table style="width: 100%; border: none;">
              <tr>
                <td style="width: 65px; vertical-align: middle;">${imgTag}</td>
                <td style="vertical-align: middle;">
                  <span style="font-size: 13px; color: #333;">${escapeHtml(item.product?.title || "Producto")}</span><br/>
                  <span style="font-size: 12px; color: #666;">${sku}</span>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding: 15px 0; text-align: center; vertical-align: middle; color: #666; font-size: 13px;">Ã—${item.quantity}</td>
          <td style="padding: 15px 0; text-align: right; vertical-align: middle; color: #666; font-size: 13px;">${formatPrice(item.price)}</td>
        </tr>
      `;
        })
        .join("") || "";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a; margin-top: 0; margin-bottom: 15px;">Nuevo pedido: n.º ${orderId}</h1>
        <p style="font-size: 13px; color: #666;">Ha recibido un nuevo pedido de ${escapeHtml(customerDetails.name) || "un cliente"} :</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-top: 35px; margin-bottom: 5px;">Resumen del pedido</h3>
        <p style="color: #eab308; font-size: 12px; font-weight: bold; margin-top: 0; margin-bottom: 25px;">Pedido n.º ${orderId} (${formatDate(new Date(order.createdAt))})</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead style="text-align: left; border-bottom: 1px solid #eee;">
            <tr>
              <th style="padding-bottom: 10px; font-weight: bold; font-size: 12px; color: #333;">Producto</th>
              <th style="padding-bottom: 10px; text-align: center; font-weight: bold; font-size: 12px; color: #333;">Cantidad</th>
              <th style="padding-bottom: 10px; text-align: right; font-weight: bold; font-size: 12px; color: #333;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 25px;">
          <table style="width: 100%; font-size: 13px; color: #666; line-height: 2;">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">${formatPrice(subTotal)}</td>
            </tr>
            <tr>
              <td>Envío: Envío gratis ${shippingMethod}</td>
              <td style="text-align: right;">${shippingCostStr}</td>
            </tr>
            <tr style="color: #1a1a1a; font-size: 14px;">
              <td><strong>Total:</strong></td>
              <td style="text-align: right;"><strong>${formatPrice(order.total)}</strong></td>
            </tr>
            <tr>
              <td>Método de pago:</td>
              <td style="text-align: right;">${paymentMethodStr}</td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-top: 30px; padding-top: 25px; padding-bottom: 25px;">
          <table style="width: 100%; font-size: 12px; color: #333; line-height: 1.4;">
            <tr>
              <td style="vertical-align: top; width: 50%;">
                <strong style="font-size: 13px;">Dirección de facturación</strong><br/>
                <div style="margin-top: 8px;">
                  ${billingName}<br/>
                  ${billingAddressHtml}<br/>
                  ${b.phone ? `<span style="color: #eab308;">${escapeHtml(b.phone)}</span><br/>` : ""}
                  ${b.email ? `<a href="mailto:${b.email}" style="color: #2563eb; text-decoration: underline;">${escapeHtml(b.email)}</a>` : ""}
                </div>
              </td>
              <td style="vertical-align: top; width: 50%;">
                <strong style="font-size: 13px;">Dirección de envío</strong><br/>
                <div style="margin-top: 8px;">
                  ${shippingName}<br/>
                  ${shippingAddressHtml}<br/>
                  ${s.phone ? `<span style="color: #eab308;">${escapeHtml(s.phone)}</span>` : ""}
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 40px; margin-bottom: 40px; font-size: 13px;">
          <p style="margin-bottom: 8px; color: #333;">¡Felicidades por la venta!</p>
          <p style="color: #666; margin-top: 0;">Gestione sus pedidos. <a href="#" style="color: #eab308; text-decoration: underline;">Ir al panel de control</a>.</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 25px; text-align: center; font-size: 10px; color: #eab308; text-transform: uppercase;">
          <strong>${storeName}</strong><br/>
          
        </div>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `Nuevo pedido #${orderId}`,
      html,
    });
  } catch (e) {
    console.error(e);
  }
}

// 3. Client Order Status Update (Cancelled / Shipped / Delivered)
export async function sendOrderStatusUpdate(
  order: any,
  userEmail: string,
  status: string,
) {
  try {
    const { logo, from } = await getTransporter().catch(() => ({
      logo: "",
      from: "",
    }));

    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 40px;"></div>`
      : "";

    let title = "Su pedido ha sido actualizado";
    let message = `El estado de su pedido <strong>#${order.id.slice(-6).toUpperCase()}</strong> ha sido actualizado.`;
    let color = "#1a1a1a";

    if (status === "SHIPPED") {
      title = "Su pedido está en camino 🚚";
      message = `Su pedido <strong>#${order.id.slice(-6).toUpperCase()}</strong> ha sido enviado. Puede realizar el seguimiento de la entrega en su cuenta.`;
      color = "#16a34a"; // green
    } else if (status === "CANCELLED") {
      title = "Información sobre su pedido";
      message = `Le informamos que su pedido <strong>#${order.id.slice(-6).toUpperCase()}</strong> lamentablemente ha sido <strong>cancelado</strong>. Si se ha realizado algún pago, el reembolso se está procesando actualmente.`;
      color = "#dc2626"; // red
    } else if (status === "DELIVERED") {
      title = "¡Su pedido ha sido entregado!";
      message = `Su pedido <strong>#${order.id.slice(-6).toUpperCase()}</strong> ha sido marcado como entregado. ¡Esperamos que esté satisfecho!`;
      color = "#16a34a";
    }

    let metadata: any = {};
    if (order.destinationAddress) {
      try {
        metadata =
          typeof order.destinationAddress === "string"
            ? JSON.parse(order.destinationAddress)
            : order.destinationAddress;
      } catch (e) {}
    }

    const subTotal =
      metadata?.subTotal ||
      order.orderItems?.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0,
      ) ||
      order.total;
    const shippingCostStr =
      metadata?.shippingCost === 0
        ? "¡Gratis!"
        : metadata?.shippingCost
          ? formatPrice(metadata.shippingCost)
          : "0,00 €";
    const shippingMethod = metadata?.shippingMethodName
      ? `(${metadata.shippingMethodName})`
      : "";

    // Addresses
    const b = metadata?.billing || {};
    const s = metadata?.shipping || b;
    const billingName =
      `${b.firstName || ""} ${b.lastName || ""}`.trim() || "Cliente";
    const shippingName =
      `${s.firstName || ""} ${s.lastName || ""}`.trim() || billingName;
    const billingAddressHtml = `${b.address1 || ""}<br/>${b.postalCode || ""} ${b.city || ""}${b.country ? `, ${b.country}` : ""}`;
    const shippingAddressHtml = `${s.address1 || ""}<br/>${s.postalCode || ""} ${s.city || ""}${s.country ? `, ${s.country}` : ""}`;

    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "LEÑA ONLINE SL";
    const storeEmailMatch = from?.match(/<(.+)>/);
    const storeEmail = storeEmailMatch
      ? storeEmailMatch[1]
      : "info@lenaonline.com";

    // Payment Method mapping
    let paymentMethodStr = order.paymentMethod;
    if (paymentMethodStr === "BANK_TRANSFER")
      paymentMethodStr = "Transferencia bancaria directa";
    if (paymentMethodStr === "STRIPE") paymentMethodStr = "Tarjeta de crédito";
    if (paymentMethodStr === "PAYPAL") paymentMethodStr = "PayPal";

    const orderId = order.id.slice(-6).toUpperCase();

    let itemsHtml = "";
    if (order.orderItems && order.orderItems.length > 0) {
      itemsHtml = order.orderItems
        .map((item: any) => {
          let imageUrl = "";
          if (
            item.product?.images &&
            Array.isArray(item.product.images) &&
            item.product.images.length > 0
          ) {
            imageUrl =
              typeof item.product.images[0] === "string"
                ? item.product.images[0]
                : item.product.images[0].url;
          } else if (typeof item.product?.images === "string") {
            try {
              const imgs = JSON.parse(item.product.images);
              if (imgs.length > 0) imageUrl = imgs[0];
            } catch (e) {}
          }

          const imgTag = imageUrl
            ? `<img src="${imageUrl}" alt="Product" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;" />`
            : "";
          let sku = item.product?.sku ? `(#${item.product.sku})` : "";

          return `
          <tr style="border-bottom: 1px dashed #eee;">
            <td style="padding: 15px 0;">
              <table style="width: 100%; border: none;">
                <tr>
                  <td style="width: 65px; vertical-align: middle;">${imgTag}</td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 13px; color: #333;">${escapeHtml(item.product?.title || "Producto")}</span><br/>
                    <span style="font-size: 12px; color: #666;">${sku}</span>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 15px 0; text-align: center; vertical-align: middle; color: #666; font-size: 13px;">Ã—${item.quantity}</td>
            <td style="padding: 15px 0; text-align: right; vertical-align: middle; color: #666; font-size: 13px;">${formatPrice(item.price)}</td>
          </tr>
        `;
        })
        .join("");
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: ${color}; margin-top: 0; margin-bottom: 15px;">${title}</h1>
        <p style="font-size: 13px; color: #666;">Hola,</p>
        <p style="font-size: 13px; color: #666;">${message}</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-top: 35px; margin-bottom: 5px;">Resumen del pedido</h3>
        <p style="color: #eab308; font-size: 12px; font-weight: bold; margin-top: 0; margin-bottom: 25px;">Pedido n.º ${orderId} (${formatDate(new Date(order.createdAt))})</p>
        
        ${
          itemsHtml
            ? `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead style="text-align: left; border-bottom: 1px solid #eee;">
            <tr>
              <th style="padding-bottom: 10px; font-weight: bold; font-size: 12px; color: #333;">Producto</th>
              <th style="padding-bottom: 10px; text-align: center; font-weight: bold; font-size: 12px; color: #333;">Cantidad</th>
              <th style="padding-bottom: 10px; text-align: right; font-weight: bold; font-size: 12px; color: #333;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        `
            : ""
        }
        
        <div style="margin-top: 25px;">
          <table style="width: 100%; font-size: 13px; color: #666; line-height: 2;">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">${formatPrice(subTotal)}</td>
            </tr>
            <tr>
              <td>Envío: Envío gratis ${shippingMethod}</td>
              <td style="text-align: right;">${shippingCostStr}</td>
            </tr>
            <tr style="color: #1a1a1a; font-size: 14px;">
              <td><strong>Total:</strong></td>
              <td style="text-align: right;"><strong>${formatPrice(order.total)}</strong></td>
            </tr>
            <tr>
              <td>Método de pago:</td>
              <td style="text-align: right;">${paymentMethodStr}</td>
            </tr>
          </table>
        </div>

        <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-top: 30px; padding-top: 25px; padding-bottom: 25px;">
          <table style="width: 100%; font-size: 12px; color: #333; line-height: 1.4;">
            <tr>
              <td style="vertical-align: top; width: 50%;">
                <strong style="font-size: 13px;">Dirección de facturación</strong><br/>
                <div style="margin-top: 8px;">
                  ${billingName}<br/>
                  ${billingAddressHtml}<br/>
                  ${b.phone ? `<span style="color: #eab308;">${escapeHtml(b.phone)}</span><br/>` : ""}
                  ${b.email ? `<a href="mailto:${b.email}" style="color: #2563eb; text-decoration: underline;">${escapeHtml(b.email)}</a>` : ""}
                </div>
              </td>
              <td style="vertical-align: top; width: 50%;">
                <strong style="font-size: 13px;">Dirección de envío</strong><br/>
                <div style="margin-top: 8px;">
                  ${shippingName}<br/>
                  ${shippingAddressHtml}<br/>
                  ${s.phone ? `<span style="color: #eab308;">${escapeHtml(s.phone)}</span>` : ""}
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 40px; margin-bottom: 40px; font-size: 13px;">
          <p style="color: #333;">No dude en contactarnos si tiene más preguntas en <a href="mailto:${storeEmail}" style="color: #2563eb; text-decoration: underline;">${storeEmail}</a> .</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 25px; text-align: center; font-size: 10px; color: #eab308; text-transform: uppercase;">
          <strong>${storeName}</strong><br/>
          
        </div>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Actualización de su pedido #${orderId}`,
      html,
    });
  } catch (e) {
    console.error(e);
  }
}

// 4. Abandoned Cart Recovery Email
export async function sendAbandonedCartRecoveryEmail(
  cart: any,
  userEmail: string,
  userName: string,
  checkoutUrl: string,
) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: "" }));

    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 50px;"></div>`
      : "";

    // USER TODO: Add your coupon code here! For example: "Use code COMEBACK10 for 10% off!"
    const couponMessage = "";

    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "LEÑA ONLINE SL";

    let itemsHtml = "";
    if (cart.cartData && cart.cartData.length > 0) {
      itemsHtml = cart.cartData
        .map((item: any) => {
          let imageUrl = "";
          if (
            item.product?.images &&
            Array.isArray(item.product.images) &&
            item.product.images.length > 0
          ) {
            imageUrl =
              typeof item.product.images[0] === "string"
                ? item.product.images[0]
                : item.product.images[0].url;
          } else if (typeof item.product?.images === "string") {
            try {
              const imgs = JSON.parse(item.product.images);
              if (imgs.length > 0) imageUrl = imgs[0];
            } catch (e) {}
          }

          const imgTag = imageUrl
            ? `<img src="${imageUrl}" alt="Product" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;" />`
            : "";

          return `
          <tr style="border-bottom: 1px dashed #eee;">
            <td style="padding: 15px 0;">
              <table style="width: 100%; border: none;">
                <tr>
                  <td style="width: 65px; vertical-align: middle;">${imgTag}</td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 13px; color: #333;">${escapeHtml(item.title || "Producto")}</span>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 15px 0; text-align: center; vertical-align: middle; color: #666; font-size: 13px;">Ã—${item.quantity}</td>
            <td style="padding: 15px 0; text-align: right; vertical-align: middle; color: #666; font-size: 13px;">${formatPrice(item.price)}</td>
          </tr>
        `;
        })
        .join("");
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a; margin-top: 0; margin-bottom: 15px;">Carrito abandonado</h1>
        <p style="font-size: 13px; color: #666;">Hola ${escapeHtml(userName) || "Cliente"},</p>
        <p style="font-size: 13px; color: #666;">Hemos notado que dejó artículos en su carrito. ¡Lo están esperando!</p>
        
        <div style="margin: 20px 0;">
          ${couponMessage ? `<p style="font-size: 16px; font-weight: bold; color: #eab308;">${couponMessage}</p>` : ""}
        </div>

        <h3 style="font-size: 16px; font-weight: bold; margin-top: 35px; margin-bottom: 5px;">Resumen de su carrito</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead style="text-align: left; border-bottom: 1px solid #eee;">
            <tr>
              <th style="padding-bottom: 10px; font-weight: bold; font-size: 12px; color: #333;">Producto</th>
              <th style="padding-bottom: 10px; text-align: center; font-weight: bold; font-size: 12px; color: #333;">Cantidad</th>
              <th style="padding-bottom: 10px; text-align: right; font-weight: bold; font-size: 12px; color: #333;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${checkoutUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Finalizar pedido
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 40px; margin-bottom: 40px; font-size: 13px;">
          <p style="color: #666;">Si tiene alguna pregunta, no dude en contactarnos.</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 25px; text-align: center; font-size: 10px; color: #eab308; text-transform: uppercase;">
          <strong>${storeName}</strong><br/>
          
        </div>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Finalice su pedido`,
      html,
    });
  } catch (e) {
    console.error(e);
  }
}

// 5. Review Request Email
export async function sendReviewRequestEmail(
  order: any,
  userEmail: string,
  userName: string,
  storeUrl: string,
) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: "" }));

    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 50px;"></div>`
      : "";

    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "LEÑA ONLINE SL";

    let itemsHtml = "";
    if (order.orderItems && order.orderItems.length > 0) {
      itemsHtml = order.orderItems
        .map((item: any) => {
          let imageUrl = "";
          if (
            item.product?.images &&
            Array.isArray(item.product.images) &&
            item.product.images.length > 0
          ) {
            imageUrl =
              typeof item.product.images[0] === "string"
                ? item.product.images[0]
                : item.product.images[0].url;
          } else if (typeof item.product?.images === "string") {
            try {
              const imgs = JSON.parse(item.product.images);
              if (imgs.length > 0) imageUrl = imgs[0];
            } catch (e) {}
          }

          const imgTag = imageUrl
            ? `<img src="${imageUrl}" alt="Product" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;" />`
            : "";

          return `
          <tr style="border-bottom: 1px dashed #eee;">
            <td style="padding: 15px 0;">
              <table style="width: 100%; border: none;">
                <tr>
                  <td style="width: 65px; vertical-align: middle;">${imgTag}</td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 13px; color: #333;">${escapeHtml(item.product?.title || "Producto")}</span>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 15px 0; text-align: right; vertical-align: middle;">
              <a href="${storeUrl}/product/${item.product?.slug || item.product?.id}" style="background-color: #ea580c; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; display: inline-block;">
                Valorar
              </a>
            </td>
          </tr>
        `;
        })
        .join("");
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a; margin-top: 0; margin-bottom: 15px;">¿Qué tal su pedido?</h1>
        <p style="font-size: 13px; color: #666;">Hola ${escapeHtml(userName) || "Kunde"},</p>
        <p style="font-size: 13px; color: #666;">¡Esperamos que disfrute de los artículos de su último pedido en nuestra tienda!</p>
        <p style="font-size: 13px; color: #666;">Su opinión es muy importante para nosotros y ayuda a otros clientes a tomar la decisión correcta.</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-top: 35px; margin-bottom: 5px;">Deje una valoración</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: center; margin-top: 40px; margin-bottom: 40px; font-size: 13px;">
          <p style="color: #666;">Muchas gracias por tomarse el tiempo de compartir su experiencia.</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 25px; text-align: center; font-size: 10px; color: #eab308; text-transform: uppercase;">
          <strong>${storeName}</strong><br/>
          
        </div>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Deje una valoración para su último pedido #${order.id.slice(-6).toUpperCase()}`,
      html,
    });
  } catch (e) {
    console.error(e);
  }
}

// 6. Admin Low Stock Alert
export async function sendLowStockAlertEmail(
  productTitle: string,
  variationName: string | null,
  currentStock: number,
  threshold: number,
  adminEmail: string,
  storeUrl: string,
  productId: string,
) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: "" }));

    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 40px;"></div>`
      : "";

    const productName = variationName
      ? `${productTitle} (${variationName})`
      : productTitle;

    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "LEÑA ONLINE SL";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #dc2626; margin-top: 0; margin-bottom: 15px;">Advertencia: Stock bajo</h1>
        <p style="font-size: 13px; color: #666;">Hola,</p>
        <p style="font-size: 13px; color: #666;">El stock del siguiente producto ha caído por debajo del umbral de advertencia (${threshold} unidades).</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">${escapeHtml(productName)}</h3>
          <p style="margin-bottom: 0; font-size: 16px;"><strong>Stock restante: <span style="color: #dc2626;">${currentStock}</span></strong></p>
        </div>
        
        <p style="margin-top: 30px; text-align: center; margin-bottom: 40px;">
          <a href="${storeUrl}/admin/products/${productId}/edit" style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Gestionar stock
          </a>
        </p>
        
        <div style="border-top: 1px solid #eee; padding-top: 25px; text-align: center; font-size: 10px; color: #eab308; text-transform: uppercase;">
          <strong>${storeName}</strong><br/>
          
        </div>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `[Advertencia de stock] ${productName} - Solo quedan ${currentStock} en stock`,
      html,
    });
  } catch (e) {
    console.error(e);
  }
}

// 7. Admin New Chat Message Notification
export async function sendAdminNewChatMessageEmail(
  guestName: string,
  guestEmail: string | null,
  messageContent: string,
  adminEmail: string,
  storeUrl: string,
) {
  try {
    const { logo } = await getTransporter().catch(() => ({ logo: "" }));

    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 40px;"></div>`
      : "";

    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "LEÑA ONLINE SL";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a; margin-top: 0; margin-bottom: 15px;">Nuevo mensaje de soporte</h1>
        <p style="font-size: 13px; color: #666;">Un visitante acaba de dejar un mensaje en el chat de su tienda.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
          <tr>
            <td style="padding: 10px; font-size: 13px;"><strong>De:</strong></td>
            <td style="padding: 10px; font-size: 13px;">${escapeHtml(guestName) || "Visitante"} ${guestEmail ? `(<a href="mailto:${guestEmail}" style="color: #2563eb;">${escapeHtml(guestEmail)}</a>)` : ""}</td>
          </tr>
          <tr>
            <td style="padding: 10px; vertical-align: top; font-size: 13px;"><strong>Mensaje:</strong></td>
            <td style="padding: 10px; font-size: 13px; font-style: italic;">"${escapeHtml(messageContent)}"</td>
          </tr>
        </table>
        
        <p style="margin-top: 30px; text-align: center; margin-bottom: 40px;">
          <a href="${storeUrl}/admin/chat" style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Abrir chat de administrador
          </a>
        </p>
        
        <div style="border-top: 1px solid #eee; padding-top: 25px; text-align: center; font-size: 10px; color: #eab308; text-transform: uppercase;">
          <strong>${storeName}</strong><br/>
          
        </div>
      </div>
    `;

    return sendEmail({
      to: adminEmail,
      subject: `[Support-Chat] Nuevo mensaje de ${escapeHtml(guestName) || "Besucher"}`,
      html,
    });
  } catch (e) {
    console.error(e);
  }
}

// 8. Newsletter Welcome Email for Client
export async function sendNewsletterWelcomeEmail(userEmail: string) {
  try {
    const { logo, from } = await getTransporter().catch(() => ({
      logo: "",
      from: "",
    }));

    const logoHtml = logo
      ? `<div style="text-align: left; margin-bottom: 20px;"><img src="${logo}" alt="Logo" style="max-height: 40px;"></div>`
      : "";

    const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "LEÑA ONLINE SL";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5; padding: 20px;">
        ${logoHtml}
        <h1 style="font-size: 24px; color: #1a1a1a; margin-top: 0; margin-bottom: 15px;">ðŸŽ Willkommen! 25 â‚¬ Rabatt auf Ihren nÃ¤chsten Einkauf</h1>
        
        <p style="font-size: 14px; color: #333; margin-bottom: 20px;">¡Estamos muy contentos de darle la bienvenida como nuevo suscriptor de nuestro boletín! 🌿</p>
        <p style="font-size: 14px; color: #333; margin-bottom: 25px;">ðŸŽ Als Willkommensgeschenk erhalten Sie <strong>25 â‚¬ Rabatt</strong> auf Ihren nÃ¤chsten Einkauf!</p>
        
        <div style="background-color: #fef3c7; border: 1px dashed #d97706; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">Simplemente use el siguiente código promocional exclusivo:</p>
          <p style="margin: 10px 0 0 0; font-size: 22px; font-weight: bold; color: #b45309; letter-spacing: 2px;">ðŸ·ï¸ BH874XP</p>
        </div>
        
        <p style="font-size: 13px; color: #666; margin-bottom: 30px;">Ingrese el código en su próxima compra: ¡no hay valor mínimo de pedido! 🛒</p>
        
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">Como suscriptor(a) de nuestro boletín, recibirá regularmente:</h3>
        <ul style="font-size: 14px; color: #333; padding-left: 20px; margin-bottom: 30px; line-height: 1.8;">
          <li>✨ Ofertas y descuentos exclusivos</li>
          <li>🔥 Noticias sobre nuestros productos</li>
          <li>💡 Consejos e información útil sobre nuestros productos</li>
        </ul>
        
        <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 30px; border-radius: 0 4px 4px 0;">
          <p style="margin: 0; font-size: 13px; color: #4b5563;">📥 <strong>Consejo:</strong> ¡Guarde nuestra dirección de correo electrónico en sus contactos para no perderse ninguna de nuestras ofertas y noticias!</p>
        </div>
        
        <p style="font-size: 14px; color: #333; margin-bottom: 10px;">¡Esperamos volver a saber de usted pronto y le deseamos una feliz compra! 😊</p>
        <p style="font-size: 14px; font-weight: bold; color: #ea580c; margin-bottom: 40px;">🔥 Su equipo de ${storeName}</p>
        
        <div style="border-top: 1px solid #eee; padding-top: 25px; text-align: center; font-size: 10px; color: #eab308; text-transform: uppercase;">
          <strong>${storeName}</strong><br/>
          
        </div>
      </div>
    `;

    return sendEmail({
      to: userEmail,
      subject: `Willkommen! Hier ist Ihr 25 â‚¬ Gutschein ðŸŽ`,
      html,
    });
  } catch (e) {
    console.error(e);
  }
}
