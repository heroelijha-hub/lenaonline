const fs = require('fs');

// Second pass - remaining strings not caught by first script
const replacements2 = [
  // LandingForm.tsx
  [">Catégorie des produits<", ">Product category<"],
  [">Toutes les catégories<", ">All categories<"],
  [">Les plus récents<", ">Most recent<"],
  [">En promotion (Price réduit)<", ">On sale (Reduced price)<"],
  [">Nombre total de produits à afficher<", ">Total number of products to display<"],
  ["Note : Si le nombre total de produits dépasse le nombre de colonnes", "Note: If the total number of products exceeds the number of columns"],
  ["Sélectionnez les blocs que vous souhaitez <strong>afficher</strong>", "Select the blocks you want to <strong>display</strong>"],
  ["L'en-tête principal contient 4 blocs. Modifiez les textes principaux ci-dessous.", "The main header contains 4 blocks. Edit the main texts below."],
  [">Plus Récents d'abord<", ">Newest first<"],
  [">Sélection Manuelle (par ID)<", ">Manual selection (by ID)<"],

  // SettingsForm.tsx remaining
  ["Configurez le menu latéral (Drawer) qui s'ouvre sur téléphone.", "Configure the side menu (Drawer) that opens on mobile."],
  ["Section \"À propos\"", "\"About\" Section"],
  [">Étoile<", ">Star<"],
  [">Icône du Chat (Upload)<", ">Chat Icon (Upload)<"],
  ["Taille recommandée: 64x64 pixels (Carré).", "Recommended size: 64x64 pixels (Square)."],
  [">Réseaux Sociaux (URL)<", ">Social Networks (URL)<"],
  ["Activer le mode maintenance (Bloque l'accès public au site)", "Enable maintenance mode (Blocks public access to the site)"],

  // ShippingManager.tsx remaining
  ["`Dès $${method.minOrderAmount.toFixed(2)}`", "`From $${method.minOrderAmount.toFixed(2)}`"],
  [">Aucune méthode définie pour cette zone.<", ">No method defined for this zone.<"],
  ["editingMethod ? 'Edit la méthode' : 'Add une méthode'", "editingMethod ? 'Edit method' : 'Add method'"],
  ["+ Add une méthode pour ${zone.name}", "+ Add a method for ${zone.name}"],

  // CheckoutClient.tsx remaining
  ["{/* Colonne de Droite : Récapitulatif et Paiement */}", "{/* Right Column: Summary and Payment */}"],
  ["{/* Accordéon de méthodes de paiement */}", "{/* Payment method accordion */}"],

  // contact/page.tsx remaining
  [">Téléphone<", ">Phone<"],

  // ChatWidget.tsx remaining
  ["Démarrer le chat", "Start chat"],
  ["Envoyez-nous un message et nous vous répondrons dès que possible !", "Send us a message and we will reply as soon as possible!"],

  // orders/[id]/page.tsx
  [">Qté:<", ">Qty:<"],

  // pages/page.tsx
  ["Éditer", "Edit"],

  // store-locator/page.tsx
  ["Itinéraire", "Directions"],

  // WishlistClient.tsx
  ["Découvrir les produits", "Discover products"],

  // BlogTable.tsx
  [">Aucun article trouvé.<", ">No articles found.<"],

  // DashboardChart.tsx
  ["Pas de données disponibles", "No data available"],

  // OrderTable.tsx remaining - needs exact match
  ["bg-orange-50 px-3 py-1.5 rounded font-medium text-sm\">Détails<", "bg-orange-50 px-3 py-1.5 rounded font-medium text-sm\">Details<"],

  // CommentForm.tsx
  ["Votre adresse e-mail ne sera pas publiée. Les champs obligatoires sont indiqués avec", "Your email address will not be published. Required fields are marked with"],

  // NotificationBell.tsx
  ["Voir les détails &rarr;", "View details &rarr;"],

  // MaintenanceView.tsx
  ["Rafraîchir la page", "Refresh page"],

  // mailer.ts remaining
  ['let title = "Mise à jour de votre commande"', 'let title = "Your order has been updated"'],
  ["Le statut de votre commande <strong>#${order.id.slice(-6).toUpperCase()}</strong> a été mis à jour.", "The status of your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> has been updated."],
  ["Votre commande <strong>#${order.id.slice(-6).toUpperCase()}</strong> a été expédiée. Vous pouvez suivre la livraison avec le numéro de suivi :", "Your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> has been shipped. You can track the delivery with the tracking number:"],
  ["Nous vous informons que votre commande <strong>#${order.id.slice(-6).toUpperCase()}</strong> a malheureusement été annulée.", "We inform you that your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> has unfortunately been cancelled."],
  ['title = "Votre commande a été livrée !"', 'title = "Your order has been delivered!"'],
  ["Votre commande <strong>#${order.id.slice(-6).toUpperCase()}</strong> est marquée comme livrée. Nous espérons", "Your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> is marked as delivered. We hope"],
  ["N'hésitez pas à nous contacter pour toute question supplémentaire.", "Do not hesitate to contact us for any additional questions."],
  ["L'équipe de votre boutique.", "Your store team."],

  // Remaining × symbols (false positives - they contain × sign which is a Latin Extended-A char)
  // Leave those alone - they are quantity display

  // Stray French in SettingsForm
  ["Séparateur des milliers", "Thousands separator"],
  ["Séparateur décimal", "Decimal separator"],

  // LandingForm more strings
  ["Couleur des bordures", "Border color"],
  ["Texte du bouton", "Button text"],
  ["Lien du bouton", "Button link"],
  ["Image de fond", "Background image"],
  ["Couleur de fond de la section", "Section background color"],
  ["Titre du bloc", "Block title"],
  ["Sous-titre du bloc", "Block subtitle"],
];

const extensions = ['.ts', '.tsx'];
const path = require('path');

function processDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let total = 0;
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      total += processDir(fullPath);
    } else if (extensions.includes(path.extname(item.name))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      let changed = false;
      for (const [fr, en] of replacements2) {
        if (content.includes(fr)) {
          content = content.replaceAll(fr, en);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        total++;
        console.log('Updated:', fullPath);
      }
    }
  }
  return total;
}

console.log('Processing second pass...');
const count = processDir('src');
console.log(`Done! Updated ${count} files.`);
