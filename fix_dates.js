const fs = require('fs');

const dateFiles = [
  'src/lib/mailer.ts',
  'src/app/cart/page.tsx',
  'src/app/checkout/success/page.tsx',
  'src/app/blog/[slug]/page.tsx',
  'src/app/admin/(dashboard)/page.tsx',
  'src/app/blog/page.tsx',
  'src/components/admin/BlogTable.tsx',
  'src/components/admin/DashboardChart.tsx',
  'src/actions/dashboard.ts'
];

for (const file of dateFiles) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replaceAll("'fr-FR'", "'en-US'");
    content = content.replaceAll("currency: 'EUR'", "currency: 'USD'");
    fs.writeFileSync(file, content);
    console.log('Updated dates/currency in:', file);
  }
}

// Also fix formatPrice.ts TTC/HT comments and string
const formatFile = 'src/lib/formatPrice.ts';
if (fs.existsSync(formatFile)) {
  let content = fs.readFileSync(formatFile, 'utf8');
  content = content.replace("S'il est faux : le prix en base est HT, on affiche \"Prix HT (Prix TTC TTC)\" (ex: 100€ HT (120€ TTC))", "If false: the base price is tax exclusive, we display \"Price excl. tax (Price incl. tax)\" (ex: 100$ excl. tax (120$ incl. tax))");
  content = content.replaceAll(" TTC", " incl. tax");
  content = content.replaceAll(" HT ", " excl. tax ");
  fs.writeFileSync(formatFile, content);
  console.log('Updated formatPrice.ts');
}

console.log('Done!');
