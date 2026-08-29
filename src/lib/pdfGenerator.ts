import PDFDocument from 'pdfkit';

export function generateInvoicePDF(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('FACTURE', { align: 'center' });
      doc.moveDown();
      
      const orderId = order.id ? order.id.slice(-6).toUpperCase() : 'N/A';
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
      
      doc.fontSize(12).font('Helvetica-Bold').text(`Commande N° :`, { continued: true }).font('Helvetica').text(` ${orderId}`);
      doc.font('Helvetica-Bold').text(`Date :`, { continued: true }).font('Helvetica').text(` ${orderDate}`);
      doc.moveDown(2);

      // Customer Info
      const userName = order.user?.name || 'Client';
      const userEmail = order.user?.email || '';
      
      doc.fontSize(14).font('Helvetica-Bold').text('Facturé à :');
      doc.fontSize(12).font('Helvetica').text(userName);
      doc.text(userEmail);
      if (order.destinationAddress) {
        doc.text(order.destinationAddress);
      }
      doc.moveDown(2);

      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Produit', 50, tableTop);
      doc.text('Qté', 350, tableTop, { width: 50, align: 'center' });
      doc.text('Prix Unitaire', 400, tableTop, { width: 90, align: 'right' });
      doc.text('Total', 490, tableTop, { width: 50, align: 'right' });
      
      const hrY = doc.y + 5;
      doc.moveTo(50, hrY).lineTo(550, hrY).stroke();
      doc.moveDown(1.5);

      // Table Rows
      let currentY = doc.y;
      doc.font('Helvetica');
      
      let totalHT = 0;

      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach((item: any) => {
          const title = item.product?.title || 'Produit';
          const qty = item.quantity || 1;
          const price = item.price || 0;
          const lineTotal = qty * price;
          totalHT += lineTotal;

          doc.text(title, 50, currentY, { width: 290 });
          doc.text(qty.toString(), 350, currentY, { width: 50, align: 'center' });
          doc.text(`${price.toFixed(2)} €`, 400, currentY, { width: 90, align: 'right' });
          doc.text(`${lineTotal.toFixed(2)} €`, 490, currentY, { width: 50, align: 'right' });
          
          currentY = doc.y + 10;
        });
      }

      // Total Section
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 15;

      const total = order.total || totalHT;

      doc.font('Helvetica-Bold');
      doc.text('Total TTC :', 400, currentY, { width: 90, align: 'right' });
      doc.text(`${total.toFixed(2)} €`, 490, currentY, { width: 50, align: 'right' });

      doc.moveDown(4);
      doc.font('Helvetica').fontSize(10).fillColor('gray').text('Merci pour votre commande.', 50, doc.y, { align: 'center' });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
