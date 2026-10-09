import PDFDocument from "pdfkit";

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
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  let logoUrl = "";
  try {
    const s = await prisma.setting.findUnique({ where: { key: "HEADER_LOGO_IMAGE" } });
    if (s?.value) logoUrl = s.value;
  } catch (e) {}

  let logoBuffer: Buffer | null = null;
  if (logoUrl) {
    try {
      const res = await fetch(logoUrl);
      if (res.ok) {
        logoBuffer = Buffer.from(await res.arrayBuffer());
      }
    } catch (e) {}
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
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
      generateHeader(doc, logoBuffer);
      generateCustomerInformation(
        doc,
        order,
        customerName,
        customerEmail,
        customerAddress,
        shippingMethodName
      );
      generateInvoiceTable(doc, order);
      generateFooter(doc);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function generateHeader(doc: typeof PDFDocument, logoBuffer: Buffer | null) {
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, 50, 45, { height: 50 });
    } catch (e) {
      doc.fillColor("#444444").fontSize(20).text("LEÑA ONLINE SL", 50, 57);
    }
  } else {
    doc.fillColor("#444444").fontSize(20).text("LEÑA ONLINE SL", 50, 57);
  }

  doc
    .fillColor("#444444")
    .fontSize(24)
    .text("FACTURA", 200, 50, { align: "right" })
    .fontSize(10)
    .text("LEÑA ONLINE SL", 200, 80, { align: "right" })
    .text("info@toplenaolline.com", 200, 95, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(
  doc: typeof PDFDocument,
  order: any,
  customerName: string,
  customerEmail: string,
  customerAddress: string,
  shippingMethodName: string
) {
  doc.fillColor("#444444").fontSize(20).text("Detalles de la factura", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  let deliveryTime = "7 días hábiles"; // default standard/free
  if (shippingMethodName && shippingMethodName.toLowerCase().includes("exprés")) {
    deliveryTime = "3 días hábiles"; // max express
  } else if (order.deliveryDays) {
    deliveryTime = `${order.deliveryDays} días hábiles`;
  }

  doc
    .fontSize(10)
    .text("Nº de Factura:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(order.id.slice(-6).toUpperCase(), 150, customerInformationTop)
    .font("Helvetica")
    .text("Fecha:", 50, customerInformationTop + 15)
    .text(
      formatDate(new Date(order.createdAt)),
      150,
      customerInformationTop + 15,
    )
    .text("Método de pago:", 50, customerInformationTop + 30)
    .text(order.paymentMethod || "N/A", 150, customerInformationTop + 30)
    .text("Tiempo de entrega:", 50, customerInformationTop + 45)
    .text(deliveryTime, 150, customerInformationTop + 45)

    .text("Cliente:", 300, customerInformationTop)
    .font("Helvetica-Bold")
    .text(customerName, 300, customerInformationTop + 15)
    .font("Helvetica")
    .text(customerEmail, 300, customerInformationTop + 30);

  if (customerAddress) {
    doc.text(
      customerAddress.replace(/\n/g, ", "),
      300,
      customerInformationTop + 45,
    );
  }

  generateHr(doc, 267);
}

function generateInvoiceTable(doc: typeof PDFDocument, order: any) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Artículo",
    "Cantidad",
    "Precio unit.",
    "Total",
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  let position = invoiceTableTop + 30;

  if (order.orderItems && order.orderItems.length > 0) {
    for (i = 0; i < order.orderItems.length; i++) {
      const item = order.orderItems[i];
      const title = item.product?.title || "Producto";
      const quantity = item.quantity;
      const price = item.price;
      const lineTotal = quantity * price;

      generateTableRow(
        doc,
        position,
        title.substring(0, 40) + (title.length > 40 ? "..." : ""),
        quantity.toString(),
        formatPrice(price),
        formatPrice(lineTotal),
      );

      generateHr(doc, position + 20);
      position += 30;
    }
  }

  const subtotalPosition = position + 20;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Total general",
    formatPrice(order.total),
  );
  doc.font("Helvetica");
}

function generateFooter(doc: typeof PDFDocument) {
  doc
    .fontSize(10)
    .text(
      "Gracias por su compra. Si tiene alguna pregunta, contáctenos.",
      50,
      700,
      { align: "center", width: 500 },
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
    .fontSize(10)
    .text(item, 50, y)
    .text(quantity, 330, y, { width: 90, align: "right" })
    .text(unitCost, 400, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc: typeof PDFDocument, y: number) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}
