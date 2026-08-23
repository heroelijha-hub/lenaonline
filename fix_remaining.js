const fs = require('fs');

const fixes = [
  // ProductForm.tsx
  {
    file: 'src/components/admin/ProductForm.tsx',
    replacements: [
      ["'Add un New Produit'", "'Add New Product'"],
      [">Title du produit *<", ">Product title *<"],
      // Base price -> Regular price
      ['t("base_price_req")', '"Regular price ($) *"'],
      // Gallery label
      [">Galerie d&apos;images (Cloudinary - max 20)<", ">Image Gallery (Cloudinary - max 20)<"],
      // Stock placeholder
      ['placeholder="En stock"', 'placeholder="In stock"'],
      // Attribute name label
      [">Name (ex: Couleur)<", ">Name (ex: Color)<"],
      ['placeholder="Couleur"', 'placeholder="Color"'],
      // Variation price label
      [">Price de la variation ($)<", ">Variation price ($)<"],
      // Attribute placeholder
      ['placeholder="Rouge | Bleu | Vert"', 'placeholder="Red | Blue | Green"'],
      // Attribute label fallback
      ["'Attribut'", "'Attribute'"],
      // Order display
      ["Ordre: {idx + 1}", "Order: {idx + 1}"],
      // Tag empty state
      ["Aucun tag pour le moment.", "No tags yet."],
      // Best Seller / Deal
      ['Mettre en &quot;Best Seller&quot;', 'Mark as "Best Seller"'],
      ['Mettre en &quot;Deal of the Day&quot;', 'Mark as "Deal of the Day"'],
      // Save button
      ["'Update le Produit'", "'Update Product'"],
      ["'Save le Produit'", "'Save Product'"],
      // add attribute/variation buttons (not using t() yet)
      ["> + Add un attribut", "> + Add attribute"],
      ["+ Add une variation", "+ Add variation"],
      // Comment
      ["{/* Type de produit */}", "{/* Product type */}"],
      ["{/* Price & Stock (Pour Simple Produit ou prix de base) */}", "{/* Price & Stock (for simple product or base price) */}"],
      ["{/* Description Courte & Longue */}", "{/* Short & Long Description */}"],
      ["{/* Attributs & Variations */}", "{/* Attributes & Variations */}"],
      ["{/* Flags / Labels */}", "{/* Flags / Labels */}"],
      ["{/* Actions */}", "{/* Actions */}"],
    ]
  },

  // ProductsTable.tsx
  {
    file: 'src/components/admin/ProductsTable.tsx',
    replacements: [
      [">Produit & Actions<", ">Product & Actions<"],
      ["Aucun produit dans le catalogue. Cliquez sur \"Add un produit\" pour commencer.", "No products in the catalog. Click \"Add a product\" to get started."],
      [">Price promo ($)<", ">Promo price ($)<"],
      ['t("base_price")', '"Regular price ($)"'],
      // Aucun from categories
      ["|| 'Uncategorized'", "|| 'Uncategorized'"],
    ]
  },

  // products/page.tsx
  {
    file: 'src/app/admin/(dashboard)/products/page.tsx',
    replacements: [
      [">Catalogue Products<", ">Product Catalog<"],
      ["+ Add un produit", "+ Add a product"],
    ]
  },

  // blogs/page.tsx
  {
    file: 'src/app/admin/(dashboard)/blogs/page.tsx',
    replacements: [
      [">Gestion du Blog<", ">Blog Management<"],
      ["Create un Article", "Create an Article"],
    ]
  },

  // pages/page.tsx
  {
    file: 'src/app/admin/(dashboard)/pages/page.tsx',
    replacements: [
      ["Create une page", "Create a page"],
      ["Erreur: {error}", "Error: {error}"],
      ["'Publishede'", "'Published'"],
      [">Voir<", ">View<"],
    ]
  },

  // coupons/page.tsx
  {
    file: 'src/app/admin/(dashboard)/coupons/page.tsx',
    replacements: [
      ["Create le Coupon", "Create Coupon"],
      ["{/* Colonne gauche: Formulaire */}", "{/* Left column: Form */}"],
      ["{/* Colonne droite: Liste */}", "{/* Right column: List */}"],
    ]
  },

  // AdminChatClient.tsx
  {
    file: 'src/app/admin/(dashboard)/chat/AdminChatClient.tsx',
    replacements: [
      [">Conversations en cours<", ">Active Conversations<"],
    ]
  },

  // ReviewTable.tsx
  {
    file: 'src/components/admin/ReviewTable.tsx',
    replacements: [
      [">Sauver<", ">Save<"],
    ]
  },

  // CategoryTable.tsx
  {
    file: 'src/components/admin/CategoryTable.tsx',
    replacements: [
      [">Sauver<", ">Save<"],
    ]
  },
];

let totalFiles = 0;
for (const { file, replacements } of fixes) {
  if (!require('fs').existsSync(file)) {
    console.log('NOT FOUND:', file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [search, replace] of replacements) {
    if (content.includes(search)) {
      content = content.replaceAll(search, replace);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
    totalFiles++;
  }
}
console.log(`\nDone! Updated ${totalFiles} files.`);
