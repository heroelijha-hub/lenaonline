const fs = require('fs');

const file = 'src/app/admin/(dashboard)/settings/SettingsForm.tsx';
let c = fs.readFileSync(file, 'utf8');

const replacements = [
  ["Texte de l'input (Placeholder)", "Input text (Placeholder)"],
  ["Liens de Navigation (Menu)", "Navigation Links (Menu)"],
  ["Save cette section", "Save this section"],
  ["Couleur de fond du bouton", "Button background color"],
  ["Couleur du texte (bouton)", "Text color (button)"],
  ["Name du lien", "Link name"],
  ["URL / Lien", "URL / Link"],
  ["Delete ce lien", "Delete this link"],
  ["+ Add un lien", "+ Add a link"],
  ["Navigation Mobile (Hamburger)", "Mobile Navigation (Hamburger)"],
  ["+ Add un lien mobile", "+ Add mobile link"],
  ["Settings du Chat", "Chat Settings"],
  ["Activer le module de Chat pour les clients", "Enable Chat module for customers"],
  ["Section Contact", "Contact Section"],
  ["Couleur de bordure (Header Mobile)", "Border color (Mobile Header)"],
  ["Site Web (sans https://)", "Website (without https://)"],
  ["Liens et Couleurs de la Top Bar", "Top Bar Links and Colors"],
  ["Couleur de fond (Top Bar)", "Background color (Top Bar)"],
  ["Couleur du texte (Top Bar)", "Text color (Top Bar)"],
  ["Camion de livraison", "Delivery truck"],
  ["+ Add un lien Top Bar", "+ Add Top Bar link"],
  ["Localisation", "Location"],
  ["Name de la boutique (Chat)", "Store Name (Chat)"],
  ["Pied de Page (Footer)", "Footer"],
  ["Couleur de Fond du Footer", "Footer Background Color"],
  ["Couleur du Texte Principal", "Main Text Color"],
  ["Adresse 1 (Store 1)", "Address 1 (Store 1)"],
  ["Adresse 2 (Store 2 - Optionnel)", "Address 2 (Store 2 - Optional)"],
  ["Texte de la Newsletter", "Newsletter Text"],
  ["Textes d'interface (Titres et Labels)", "Interface Texts (Titles and Labels)"],
  ["Title Adresses (ex: Our Locations)", "Addresses Title (ex: Our Locations)"],
  ["Title Newsletter (ex: Newsletter)", "Newsletter Title (ex: Newsletter)"],
  ["Texte Placeholder Email (ex: Enter your email...)", "Email Placeholder Text (ex: Enter your email...)"],
  ["Texte \"Appelez-nous\" (ex: Call Us Now)", "\"Call Us\" Text (ex: Call Us Now)"],
  ["Texte du Copyright (ex: © 2026 Shopelios)", "Copyright Text (ex: © 2026 Shopelios)"],
  ["Colonnes de liens du Footer", "Footer Link Columns"],
  ["+ Add une colonne", "+ Add a column"],
  ["Title de la page", "Page Title"],
  ["Message d'explication", "Explanation Message"],
  ["Image d'illustration (Upload)", "Illustration Image (Upload)"],
  ["Choisir un fichier", "Choose a file"],
  ["Aucun fichier choisi", "No file chosen"],
  ["Page 404 (Introuvable)", "404 Page (Not Found)"],
  ["Texte d'explication", "Explanation Text"],
  ["Button text retour (CTA)", "Return button text (CTA)"],
  ["Couleur de fond (Si pas d'image)", "Background color (If no image)"],
];

for (const [search, replace] of replacements) {
  c = c.replaceAll(search, replace);
}

fs.writeFileSync(file, c);
console.log('Updated SettingsForm.tsx');
