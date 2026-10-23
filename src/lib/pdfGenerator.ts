import PDFDocument from "pdfkit";
import prisma from "./prisma";
import fs from "fs";
import path from "path";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(date);
};

export async function generateInvoicePDF(order: any): Promise<Buffer> {
  let storeName = "TOP LEÑA ONLINE";
  let storeAddress = "C. Atún, 1, 03540 Alicante, ESPANA";
  let storeEmail = "info@toplenaolline.com";
  let logoUrl = "";

  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "HEADER_LOGO_IMAGE",
            "FOOTER_LOGO_IMAGE",
            "CONTACT_ADDRESS",
            "FOOTER_ADDRESS_1",
            "CONTACT_EMAIL_DISPLAY",
            "FOOTER_SUPPORT_EMAIL",
            "CHAT_STORE_NAME",
          ],
        },
      },
    });

    const map = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, string>,
    );

    if (map["CHAT_STORE_NAME"]) storeName = map["CHAT_STORE_NAME"];
    if (map["CONTACT_ADDRESS"] || map["FOOTER_ADDRESS_1"]) {
      storeAddress = map["CONTACT_ADDRESS"] || map["FOOTER_ADDRESS_1"];
    }
    if (map["CONTACT_EMAIL_DISPLAY"] || map["FOOTER_SUPPORT_EMAIL"]) {
      storeEmail = map["CONTACT_EMAIL_DISPLAY"] || map["FOOTER_SUPPORT_EMAIL"];
    }
    if (map["HEADER_LOGO_IMAGE"] || map["FOOTER_LOGO_IMAGE"]) {
      logoUrl = map["HEADER_LOGO_IMAGE"] || map["FOOTER_LOGO_IMAGE"];
    }
  } catch (e) {
    console.warn("Failed to retrieve store settings for invoice PDF:", e);
  }

  // Load logo buffer with robust fallback:
  // 1. Local public/logo.png (fastest, guaranteed available)
  // 2. Fetch remote logoUrl if specified
  // 3. Local public/logo.jpg
  let logoBuffer: Buffer | null = null;
  const localLogoPng = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(localLogoPng)) {
    try {
      logoBuffer = fs.readFileSync(localLogoPng);
    } catch (e) {
      console.warn("Failed to read public/logo.png", e);
    }
  }

  if (!logoBuffer && logoUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(logoUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        logoBuffer = Buffer.from(await res.arrayBuffer());
      }
    } catch (e) {
      console.warn("Failed to fetch remote invoice logo:", e);
    }
  }

  if (!logoBuffer) {
    const localLogoJpg = path.join(process.cwd(), "public", "logo.jpg");
    if (fs.existsSync(localLogoJpg)) {
      try {
        logoBuffer = fs.readFileSync(localLogoJpg);
      } catch (e) {}
    }
  }

  const storeDetails = {
    name: storeName,
    address: storeAddress,
    email: storeEmail,
  };

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Fetch customer details from order
      let customerName = "Cliente";
      let customerEmail = order.user?.email || "";
      let customerAddress = "";
      let shippingMethodName = "";

      if (order.destinationAddress) {
        try {
          const metadata =
            typeof order.destinationAddress === "string"
              ? JSON.parse(order.destinationAddress)
              : order.destinationAddress;
          shippingMethodName = metadata?.shippingMethodName || "";
          const billing = metadata?.billing || metadata?.shipping;
          if (billing) {
            customerName =
              `${billing.firstName || ""} ${billing.lastName || ""}`.trim();
            customerEmail = billing.email || customerEmail;
            customerAddress =
              `${billing.address1 || ""}\n${billing.postalCode || ""} ${billing.city || ""}\n${billing.country || ""}`.trim();
          }
        } catch (e) {
          // ignore
        }
      }

      // Generate content
      generateHeader(doc, logoBuffer, storeDetails);
      generateCustomerInformation(
        doc,
        order,
        customerName,
        customerEmail,
        customerAddress,
        shippingMethodName,
      );
      generateInvoiceTable(doc, order);
      generateFooter(doc, storeDetails);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function generateHeader(
  doc: typeof PDFDocument,
  logoBuffer: Buffer | null,
  storeDetails: { name: string; address: string; email: string },
) {
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, 50, 45, { width: 140 });
    } catch (e) {
      doc
        .fillColor("#ea580c")
        .font("Helvetica-Bold")
        .fontSize(20)
        .text(storeDetails.name, 50, 50);
    }
  } else {
    doc
      .fillColor("#ea580c")
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(storeDetails.name, 50, 50);
  }

  doc
    .fillColor("#111827")
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("FACTURA", 245, 45, { align: "right", width: 300 })
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#1f2937")
    .text(storeDetails.name, 245, 72, { align: "right", width: 300 })
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#4b5563")
    .text(storeDetails.address, 245, 87, { align: "right", width: 300 })
    .text(storeDetails.email, 245, 101, { align: "right", width: 300 });

  generateHr(doc, 130);
}

function generateCustomerInformation(
  doc: typeof PDFDocument,
  order: any,
  customerName: string,
  customerEmail: string,
  customerAddress: string,
  shippingMethodName: string,
) {
  doc
    .fillColor("#111827")
    .font("Helvetica-Bold")
    .fontSize(15)
    .text("Detalles de la factura", 50, 145);

  generateHr(doc, 168);

  const customerInformationTop = 182;

  let deliveryTime = "7 días hábiles"; // default standard/free
  if (shippingMethodName && shippingMethodName.toLowerCase().includes("exprés")) {
    deliveryTime = "3 días hábiles"; // max express
  } else if (order.deliveryDays) {
    deliveryTime = `${order.deliveryDays} días hábiles`;
  }

  let paymentMethodLabel = order.paymentMethod || "N/A";
  if (paymentMethodLabel === "BANK_TRANSFER") paymentMethodLabel = "Transferencia bancaria";
  if (paymentMethodLabel === "STRIPE") paymentMethodLabel = "Tarjeta de crédito";
  if (paymentMethodLabel === "PAYPAL") paymentMethodLabel = "PayPal";

  doc
    .fontSize(9.5)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text("Nº de Factura:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(order.id.slice(-6).toUpperCase(), 155, customerInformationTop)
    .font("Helvetica")
    .fillColor("#6b7280")
    .text("Fecha:", 50, customerInformationTop + 16)
    .fillColor("#111827")
    .text(
      formatDate(new Date(order.createdAt)),
      155,
      customerInformationTop + 16,
    )
    .fillColor("#6b7280")
    .text("Método de pago:", 50, customerInformationTop + 32)
    .fillColor("#111827")
    .text(paymentMethodLabel, 155, customerInformationTop + 32)
    .fillColor("#6b7280")
    .text("Tiempo de entrega:", 50, customerInformationTop + 48)
    .fillColor("#111827")
    .text(deliveryTime, 155, customerInformationTop + 48)

    .fillColor("#6b7280")
    .text("Cliente:", 320, customerInformationTop)
    .font("Helvetica-Bold")
    .fillColor("#111827")
    .text(customerName, 320, customerInformationTop + 16)
    .font("Helvetica")
    .fillColor("#4b5563")
    .text(customerEmail, 320, customerInformationTop + 32);

  if (customerAddress) {
    doc.text(
      customerAddress.replace(/\n/g, ", "),
      320,
      customerInformationTop + 48,
      { width: 225 },
    );
  }

  generateHr(doc, 265);
}

function generateInvoiceTable(doc: typeof PDFDocument, order: any) {
  const invoiceTableTop = 290;

  doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#111827");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Artículo",
    "Cantidad",
    "Precio unit.",
    "Total",
  );
  generateHr(doc, invoiceTableTop + 18);

  let position = invoiceTableTop + 28;
  doc.font("Helvetica").fontSize(9.5).fillColor("#374151");

  if (order.orderItems && order.orderItems.length > 0) {
    for (let i = 0; i < order.orderItems.length; i++) {
      const item = order.orderItems[i];
      const title = item.product?.title || "Producto";
      const quantity = item.quantity;
      const price = item.price;
      const lineTotal = quantity * price;

      generateTableRow(
        doc,
        position,
        title.length > 45 ? title.substring(0, 42) + "..." : title,
        quantity.toString(),
        formatPrice(price),
        formatPrice(lineTotal),
      );

      generateHr(doc, position + 20);
      position += 30;
    }
  }

  const subtotalPosition = position + 15;
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827");
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Total general",
    formatPrice(order.total),
  );
}

function generateFooter(
  doc: typeof PDFDocument,
  storeDetails: { name: string; address: string; email: string },
) {
  generateHr(doc, 740);
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#374151")
    .text(storeDetails.name, 50, 752, { align: "center", width: 495 })
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor("#6b7280")
    .text(
      `${storeDetails.address} • ${storeDetails.email}`,
      50,
      765,
      { align: "center", width: 495 },
    )
    .fontSize(8)
    .fillColor("#9ca3af")
    .text(
      "Gracias por su compra. Si tiene alguna pregunta sobre su pedido, contáctenos en nuestro email de atención al cliente.",
      50,
      778,
      { align: "center", width: 495 },
    );
}

function generateTableRow(
  doc: typeof PDFDocument,
  y: number,
  item: string,
  quantity: string,
  unitCost: string,
  lineTotal: string,
) {
  doc
    .fontSize(9.5)
    .text(item, 50, y, { width: 250 })
    .text(quantity, 310, y, { width: 60, align: "right" })
    .text(unitCost, 380, y, { width: 80, align: "right" })
    .text(lineTotal, 470, y, { width: 75, align: "right" });
}

function generateHr(doc: typeof PDFDocument, y: number) {
  doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(50, y).lineTo(545, y).stroke();
}
