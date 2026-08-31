export function generateInvoicePDF(order: any): Promise<Buffer> {
  return new Promise((resolve) => {
    // Temporary mock to prevent 'pdfkit' module resolution errors on Vercel
    // Replace with @react-pdf/renderer or another Next.js-friendly library later
    resolve(Buffer.from('PDF generation disabled temporarily due to build errors.'));
  });
}
