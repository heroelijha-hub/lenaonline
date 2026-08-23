const fs = require('fs');
const path = require('path');

// Map of French strings to English replacements
// Format: [exactFrench, exactEnglish]
const replacements = [

  // === SettingsForm.tsx ===
  ["'Merci pour votre inscription à notre newsletter !'", "'Thank you for subscribing to our newsletter!'"],
  ["'Votre commande sera traitée dès réception du paiement.'", "'Your order will be processed upon payment receipt.'"],
  ["'À propos de nous'", "'About Us'"],
  ["'Nous sommes une boutique passionnée par la qualité et l\\'excellence.'", "'We are a store passionate about quality and excellence.'"],
  ["'Il semble que nous ne puissions pas trouver la page que vous cherchez. Elle a peut-être été déplacée ou supprimée.'", "'It seems we cannot find the page you are looking for. It may have been moved or deleted.'"],
  ["'Retour à l\\'accueil'", "'Back to Home'"],
  ["'Nous mettons actuellement à jour notre boutique. Revenez très bientôt !'", "'We are currently updating our store. Come back very soon!'"],
  ["setMessage('Settings mis à jour avec succès.')", "setMessage('Settings updated successfully.')"],
  [">C'est la devise par défaut utilisée pour afficher les prix.<", ">This is the default currency used to display prices.<"],
  [">Séparateur des milliers<", ">Thousands separator<"],
  [">Séparateur décimal<", ">Decimal separator<"],
  [">Langues & Traduction<", ">Languages & Translation<"],
  [">Langue active (Site)<", ">Active Language (Site)<"],
  [">Anglais (English)<", ">English<"],
  [">Français (French)<", ">French (Français)<"],
  [">Portée de la traduction<", ">Translation scope<"],
  [">Option 1: Seulement Espace Client (Admin reste en Anglais)<", ">Option 1: Client side only (Admin stays in English)<"],
  [">Option 2: Seulement Admin (Client reste en Anglais)<", ">Option 2: Admin only (Client stays in English)<"],
  [">Option 3: Tout est traduit<", ">Option 3: Everything is translated<"],
  [">Taxes & TVA<", ">Taxes & VAT<"],
  ["Les prix saisis dans le catalogue sont Toutes Taxes Comprises (TTC)", "Catalog prices include all taxes (VAT-inclusive)"],
  ["Appliquer la TVA dynamique selon les pays de l&apos;Union Européenne (à venir au Checkout)", "Apply dynamic VAT based on EU country (coming soon at Checkout)"],
  [">Taux de TVA par défaut (%)<", ">Default VAT rate (%)<"],
  ["Taux appliqué si la TVA dynamique est désactivée ou si le pays du client est inconnu.", "Rate applied if dynamic VAT is disabled or client country is unknown."],
  [">Fonctionnalités Boutique<", ">Store Features<"],
  ['Activer le bouton "Buy Now" (Achat rapide) sur les pages produits', 'Enable the "Buy Now" button (Quick purchase) on product pages'],
  [">Email de réception (Contact & Newsletter)<", ">Receiving Email (Contact & Newsletter)<"],
  ["L'adresse e-mail qui recevra les messages du formulaire de contact et les notifications d'inscription.", "The e-mail address that will receive contact form messages and registration notifications."],
  [">Message de succès (Newsletter)<", ">Success Message (Newsletter)<"],
  ["placeholder=\"Merci pour votre inscription !\"", 'placeholder="Thank you for subscribing!"'],
  ["Message affiché à l'utilisateur après une inscription réussie.", "Message displayed to the user after a successful subscription."],
  [">Serveur E-mail (SMTP) - E-mails Transactionnels<", ">Email Server (SMTP) - Transactional Emails<"],
  ["Configurez ces paramètres pour que la boutique puisse envoyer automatiquement des e-mails (Confirmation de commande, Expédition, Annulation).", "Configure these settings so the store can automatically send emails (Order confirmation, Shipping, Cancellation)."],
  [">Hôte SMTP (ex: smtp.gmail.com)<", ">SMTP Host (ex: smtp.gmail.com)<"],
  [">Port SMTP (ex: 587 ou 465)<", ">SMTP Port (ex: 587 or 465)<"],
  [">Utilisateur (Email de connexion)<", ">Username (Login Email)<"],
  ["placeholder=\"votre-email@gmail.com\"", 'placeholder="your-email@gmail.com"'],
  [">Mot de passe (App Password)<", ">Password (App Password)<"],
  [">Email d'expédition (De : ...)<", ">Sender Email (From: ...)<"],
  [">Paiements (Stripe, PayPal & Virement)<", ">Payments (Stripe, PayPal & Bank Transfer)<"],
  ["Cochez \"Activer ce mode\" pour rendre la méthode de paiement visible lors du passage en caisse.", "Check \"Enable this mode\" to make the payment method visible at checkout."],
  [">Configuration Stripe (Cartes Bancaires)<", ">Stripe Configuration (Credit Cards)<"],
  [">Activer ce mode<", ">Enable this mode<"],
  [">Clé Publique (Publishable Key)<", ">Public Key (Publishable Key)<"],
  [">Clé Secrète (Secret Key)<", ">Secret Key<"],
  [">Configuration PayPal<", ">PayPal Configuration<"],
  [">Customer ID PayPal<", ">PayPal Client ID<"],
  [">Secret PayPal<", ">PayPal Secret<"],
  [">Configuration Virement Bancaire<", ">Bank Transfer Configuration<"],
  [">Titulaire du compte<", ">Account Holder<"],
  ["placeholder=\"Name de l'entreprise ou personne\"", 'placeholder="Company or person name"'],
  [">Name de la banque<", ">Bank Name<"],
  [">Message à afficher sur le checkout<", ">Message to display at checkout<"],
  ["placeholder=\"Veuillez effectuer le virement sur le compte ci-dessous.\"", 'placeholder="Please make the transfer to the account below."'],
  [">Instructions (envoyées au client)<", ">Instructions (sent to the client)<"],
  ["placeholder=\"Votre commande sera traitée dès réception du paiement...\"", 'placeholder="Your order will be processed upon payment receipt..."'],
  [">Design & En-tête (Header)<", ">Design & Header<"],
  [">Couleur principale de la boutique (Thème)<", ">Main Store Color (Theme)<"],
  [">Message du bandeau supérieur<", ">Top Banner Message<"],
  [">Logo de la Boutique (Upload)<", ">Store Logo (Upload)<"],
  ["Taille recommandée: 150x50 pixels (PNG transparent).", "Recommended size: 150x50 pixels (transparent PNG)."],
  [">Delete le logo<", ">Remove logo<"],
  [">New fichier :<", ">New file:<"],
  [">Téléphone Support (En-tête)<", ">Support Phone (Header)<"],
  [">Email Support (En-tête)<", ">Support Email (Header)<"],
  [">Barre de Recherche (Ajax)<", ">Search Bar (Ajax)<"],
  [">Couleur de la bordure<", ">Border color<"],
  [">Menu Principal (Navigation)<", ">Main Menu (Navigation)<"],
  [">Lien<", ">Link<"],
  [">Libellé<", ">Label<"],
  [">Ajouter un lien<", ">Add a link<"],
  [">Menu Mobile<", ">Mobile Menu<"],
  [">Titre du bloc \"À propos\"<", ">\"About\" block title<"],
  ["placeholder=\"À propos de nous\"", 'placeholder="About Us"'],
  [">Texte de présentation<", ">Presentation text<"],
  ["placeholder=\"Nous sommes une boutique...\"", 'placeholder="We are a store..."'],
  [">Liens du menu mobile<", ">Mobile menu links<"],
  [">Adresse de contact<", ">Contact address<"],
  [">Téléphone de contact<", ">Contact phone<"],
  [">Email de contact<", ">Contact email<"],
  [">Site web<", ">Website<"],
  [">Couleur de la bordure supérieure<", ">Top border color<"],
  [">Barre de liens rapides (Top Bar)<", ">Quick links bar (Top Bar)<"],
  [">Couleur de fond<", ">Background color<"],
  [">Couleur du texte<", ">Text color<"],
  [">Icône<", ">Icon<"],
  [">Pied de page (Footer)<", ">Footer<"],
  [">Couleur de fond Footer<", ">Footer background color<"],
  [">Couleur de texte Footer<", ">Footer text color<"],
  [">Adresse 1<", ">Address 1<"],
  [">Adresse 2<", ">Address 2<"],
  [">Titre section localisation<", ">Location section title<"],
  [">Titre Newsletter Footer<", ">Footer Newsletter title<"],
  [">Texte Newsletter Footer<", ">Footer Newsletter text<"],
  [">Placeholder Newsletter Footer<", ">Footer Newsletter placeholder<"],
  [">Texte bouton appel<", ">Call button text<"],
  [">Copyright<", ">Copyright<"],
  [">Réseaux Sociaux<", ">Social Networks<"],
  [">Colonnes de liens Footer<", ">Footer link columns<"],
  [">Titre de colonne<", ">Column title<"],
  [">Lien 1<", ">Link 1<"],
  [">Page 404<", ">404 Page<"],
  [">Titre de la page 404<", ">404 page title<"],
  [">Texte de la page 404<", ">404 page text<"],
  [">Texte du bouton de retour<", ">Back button text<"],
  [">Couleur de fond<", ">Background color<"],
  [">Image de fond (optionnelle)<", ">Background image (optional)<"],
  [">Mode Maintenance<", ">Maintenance Mode<"],
  [">Activer le mode maintenance<", ">Enable maintenance mode<"],
  [">Titre de la page de maintenance<", ">Maintenance page title<"],
  [">Message de maintenance<", ">Maintenance message<"],
  [">Image de maintenance (optionnelle)<", ">Maintenance image (optional)<"],
  ["Chat en direct (Widget)", "Live Chat (Widget)"],
  [">Activer le chat en direct<", ">Enable live chat<"],
  [">Nom de la boutique (Chat)<", ">Store name (Chat)<"],
  [">Icône de la boutique (Chat)<", ">Store icon (Chat)<"],
  ["'Enregistrement...'", "'Saving...'"],

  // === LandingForm.tsx ===
  ["name: 'En-tête Principal (Hero)'", "name: 'Main Header (Hero)'"],
  ["name: 'Bannières Promo'", "name: 'Promo Banners'"],
  ["setMessage('Mise à jour réussie !')", "setMessage('Update successful!')"],
  ["setMessage('Erreur lors de la mise à jour.')", "setMessage('Update failed.')"],
  [">Design, Liens & Médias<", ">Design, Links & Media<"],
  [">Design & Médias<", ">Design & Media<"],
  ["title: \"Tondeuses Autoportées\"", "title: \"Ride-on Mowers\""],
  ["Les paramètres de cette section sont gérés ailleurs. Vous pouvez cependant la déplacer ou la désactiver.", "The settings for this section are managed elsewhere. You can however move or disable it."],
  [">Affiche une grille de produits personnalisée (bordures et boutons modifiables).<", ">Displays a customized product grid (editable borders and buttons).<"],
  ["'Title de la section', 'title', 'ex: Tondeuses Autoportées'", "'Section Title', 'title', 'ex: Ride-on Mowers'"],
  ["'ex: Tondeuses Autoportées'", "'ex: Ride-on Mowers'"],
  ["'Titre principal (HTML possible)'", "'Main title (HTML supported)'"],
  ["'Sous-titre'", "'Subtitle'"],
  ["'Texte du bouton 1'", "'Button 1 text'"],
  ["'Lien du bouton 1'", "'Button 1 link'"],
  ["'Texte du bouton 2'", "'Button 2 text'"],
  ["'Lien du bouton 2'", "'Button 2 link'"],
  ["'Image de fond (URL Cloudinary)'", "'Background image (Cloudinary URL)'"],
  ["Aucun paramètre disponible pour cette section.", "No settings available for this section."],
  [">Aperçu de la Page<", ">Page Preview<"],
  [">Éditeur de Section<", ">Section Editor<"],

  // === countries.ts - Replace full list with English ===

  // === mailer.ts ===
  ["Nous avons bien reçu votre commande", "We have received your order"],
  ["Elle est actuellement en attente jusqu'à confirmation du traitement de votre paiement (si applicable) ou sera expédiée très prochainement.", "It is currently pending confirmation of your payment processing (if applicable) or will be shipped very soon."],
  ["Résumé de la commande", "Order Summary"],
  ["Vous avez reçu une nouvelle commande de", "You have received a new order from"],
  ["un client", "a customer"],
  ["Bestellübersicht (Résumé)", "Order Summary"],
  ["Numéro de commande", "Order number"],
  [">Quantité<", ">Quantity<"],
  [">Produit<", ">Product<"],
  [">Prix<", ">Price<"],
  ["Méthode :", "Payment Method:"],
  ["Total payé:", "Amount paid:"],
  ["Adresse de livraison:", "Shipping address:"],
  ["Toutes les informations nécessaires à la préparation de votre commande figurent ci-dessus.", "All information needed to prepare your order is listed above."],
  ["Détails de livraison", "Shipping details"],

  // === ShippingManager.tsx ===
  ["return setError('Veuillez sélectionner un pays.')", "return setError('Please select a country.')"],
  ["setError(res.error || 'Erreur lors de la création de la zone.')", "setError(res.error || 'Error creating shipping zone.')"],
  ["if (!confirm('Voulez-vous supprimer cette zone et toutes ses méthodes ?')) return", "if (!confirm('Delete this zone and all its methods?')) return"],
  ["return setError('Le tarif est requis pour cette méthode.')", "return setError('Rate is required for this method.')"],
  ["if (!confirm('Delete cette méthode ?')) return", "if (!confirm('Delete this method?')) return"],
  [">Sélectionnez un pays...<", ">Select a country...<"],
  [">Aucune zone d'expédition définie.<", ">No shipping zone defined.<"],
  ["zone.isActive ? 'Désactiver' : 'Activer'", "zone.isActive ? 'Disable' : 'Enable'"],
  [">Méthodes d'expédition<", ">Shipping Methods<"],
  [">Intitulé<", ">Label<"],
  [">Tarif<", ">Rate<"],
  [">Gratuite<", ">Free<"],
  [">Ajouter une méthode<", ">Add a method<"],
  [">Nom de la zone<", ">Zone name<"],

  // === admin.ts actions ===
  ['return { error: "Erreur lors de la création de la catégorie" }', 'return { error: "Error creating category" }'],
  ['return { error: "Erreur lors de la mise à jour." }', 'return { error: "Error updating." }'],
  ['return { error: "Erreur: Cette catégorie contient peut-être des produits." }', 'return { error: "Error: This category may contain products." }'],
  ['return { error: "Le titre, le prix et au moins une catégorie sont obligatoires." }', 'return { error: "Title, price and at least one category are required." }'],
  ['return { error: error.message || "Impossible de créer le produit." }', 'return { error: error.message || "Unable to create product." }'],
  ["return { error: \"L'ID, le titre, le prix et au moins une catégorie sont obligatoires.\" }", 'return { error: "ID, title, price and at least one category are required." }'],
  ['return { error: error.message || "Erreur lors de la mise à jour." }', 'return { error: error.message || "Error updating." }'],
  ['return { error: "Erreur lors de la modification rapide. Vérifiez que le slug est unique." }', 'return { error: "Error during quick edit. Make sure the slug is unique." }'],
  ['return { error: "Erreur lors de la mise à jour du statut." }', 'return { error: "Error updating status." }'],
  ['return { error: "Erreur lors de la création (le code existe peut-être déjà)." }', 'return { error: "Error creating coupon (the code may already exist)." }'],

  // === contact.tsx page ===
  [">Responsabilité relative au contenu<", ">Content Responsibility<"],
  ["Contenus Sur Ces Pages Conformément À L'article 7, Paragraphe 1, De La Loi", "Content on these pages in accordance with Section 7, Paragraph 1 of the"],
  ["Allemande Sur La Protection Des Données (DDG).", "German Telemedia Act (TMG)."],
  ["Cependant, Conformément Aux Articles 8 À 10 De La DDG, Nous Ne Sommes Pas", "However, under Sections 8 to 10 of the TMG, we are not"],
  ["Tenus De Surveiller Les Informations Transmises Ou Stockées Par Des Tiers Ni De", "obligated to monitor transmitted or stored third-party information or"],
  ["Rechercher Des Faits Ou Circonstances Révélant Une Activité Illégale.", "investigate circumstances indicating illegal activity."],
  ["Des Lois Générales Restent Inchangées.", "General legal obligations remain unchanged."],
  [">Téléphone<", ">Phone<"],

  // === DeliveryTracker.tsx ===
  ["alert('Informations de livraison enregistrées.')", "alert('Delivery information saved.')"],
  [">Informations d'Expédition<", ">Shipping Information<"],
  [">Numéro de suivi (Tracking Number)<", ">Tracking Number<"],
  [">Origine (Départ)<", ">Origin (Departure)<"],
  [">Destination (Arrivée)<", ">Destination (Arrival)<"],
  [">Aucune position enregistrée.<", ">No position recorded.<"],
  ['placeholder="Note"', 'placeholder="Note"'],
  [">Ajouter une position<", ">Add position<"],
  [">Historique des positions<", ">Position history<"],

  // === account.ts ===
  ["return { error: 'Vous devez être connecté.' }", "return { error: 'You must be logged in.' }"],
  ["// Note: Pour des raisons de sécurité, une vérification du mot de passe actuel", "// Note: For security reasons, current password verification"],
  ["// peut être requise côté API selon la config Supabase. Mais updateUser()", "// may be required on the API side depending on the Supabase config. But updateUser()"],
  ["return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }", "return { error: 'Password must be at least 6 characters long.' }"],
  ["return { success: true, message: 'Détails du compte mis à jour avec succès.' }", "return { success: true, message: 'Account details updated successfully.' }"],

  // === delivery.ts ===
  ["// Helper pour géocoder (Ville, Pays) -> Lat, Lng via Nominatim", "// Helper to geocode (City, Country) -> Lat, Lng via Nominatim"],
  ['console.error("Erreur géocodage:", error)', 'console.error("Geocoding error:", error)'],
  ["// Mettre à jour les informations de base de livraison (Origine, Destination, Tracking)", "// Update basic delivery information (Origin, Destination, Tracking)"],
  ["// Ajouter une nouvelle position de livraison à l'historique", "// Add a new delivery position to the history"],
  ["throw new Error(`Impossible de trouver les coordonnées pour ${city}, ${country}`)", "throw new Error(`Unable to find coordinates for ${city}, ${country}`)"],

  // === reviews.ts ===
  ['return { error: "Vous devez être connecté pour laisser un avis." }', 'return { error: "You must be logged in to leave a review." }'],
  ['return { error: "La note doit être comprise entre 1 et 5." }', 'return { error: "Rating must be between 1 and 5." }'],
  ['throw new Error("Non autorisé.")', 'throw new Error("Unauthorized.")'],

  // === pages/[id]/page.tsx ===
  ["isNew ? 'Create une page' : 'Éditer la page'", "isNew ? 'Create a page' : 'Edit page'"],
  [">Informations Générales<", ">General Information<"],
  [">Ce contenu s'affichera sur les écrans larges.<", ">This content will be displayed on large screens.<"],
  [">Ce contenu s'affichera uniquement sur les petits écrans.<", ">This content will be displayed only on small screens.<"],
  ['placeholder="Saisissez le contenu spécifique pour mobile..."', 'placeholder="Enter mobile-specific content..."'],

  // === store-locator/page.tsx ===
  ["status: 'Fermé bientôt'", "status: 'Closing soon'"],
  ["Découvrez nos boutiques physiques et venez tester nos produits en direct.", "Discover our physical stores and come test our products in person."],
  ["Notre équipe se fera un plaisir de vous conseiller.", "Our team will be happy to advise you."],
  [">Itinéraire<", ">Directions<"],
  ["Embed Google Maps générique (Paris par défaut)", "Generic Google Maps embed (Paris by default)"],

  // === BlogForm.tsx ===
  [">Extrait (Résumé pour les grilles)<", ">Excerpt (Summary for grids)<"],
  [">Organisation & Visibilité<", ">Organization & Visibility<"],
  ["L&apos;article est publié (visible)", "Article is published (visible)"],
  [">Catégorie<", ">Category<"],
  [">Mots-clés (séparés par virgule)<", ">Keywords (comma-separated)<"],

  // === ProductForm.tsx ===
  [">Stock (Laisser vide = illimité)<", ">Stock (Leave empty = unlimited)<"],
  [">Valeurs (séparées par des |)<", ">Values (separated by |)<"],
  [">Sélectionnez...<", ">Select...<"],
  ['placeholder="Laisser vide = illimité"', 'placeholder="Leave empty = unlimited"'],
  ["{imageFiles.length} nouveau(x) fichier(s) sélectionné(s)", "{imageFiles.length} new file(s) selected"],

  // === ChatWidget.tsx ===
  ['alert("Erreur de connexion au chat. Veuillez vérifier que la base de données est à jour.")', 'alert("Chat connection error. Please ensure the database is up to date.")'],
  [">Nous vous répondons rapidement<", ">We reply quickly<"],
  [">Veuillez renseigner votre nom et adresse e-mail pour démarrer la conversation.<", ">Please enter your name and email address to start the conversation.<"],
  [">Démarrer le chat<", ">Start chat<"],
  [">Envoyez-nous un message et nous vous répondrons dès que possible !<", ">Send us a message and we will reply as soon as possible!<"],

  // === auth.ts ===
  ["// On ne retourne pas d'erreur critique ici, l'utilisateur est quand même créé dans Supabase Auth", "// We don't return a critical error here, the user is still created in Supabase Auth"],
  ["// Vérifier qu'il n'y a pas déjà d'admin", "// Check that there is no existing admin"],
  ["return { error: 'Un administrateur existe déjà. Configuration verrouillée.' }", "return { error: 'An administrator already exists. Setup is locked.' }"],
  ["return { error: 'Accès refusé. Vous n\\'êtes pas administrateur.' }", "return { error: 'Access denied. You are not an administrator.' }"],

  // === checkout.ts ===
  ["return { error: \"Le paiement par carte (Stripe) n'est pas encore configuré par l'administrateur.\" }", 'return { error: "Card payment (Stripe) has not been configured by the administrator yet." }'],
  ["return { error: \"Le paiement PayPal n'est pas encore configuré par l'administrateur.\" }", 'return { error: "PayPal payment has not been configured by the administrator yet." }'],
  ["return { error: \"Erreur d'authentification avec PayPal. Vérifiez les clés dans l'Admin.\" }", 'return { error: "PayPal authentication error. Check the keys in Admin." }'],
  ["return { error: \"Impossible de créer la session de paiement PayPal.\" }", 'return { error: "Unable to create PayPal payment session." }'],

  // === new/page.tsx ===
  [">Nouveautés<", ">New Arrivals<"],
  ["Découvrez nos tous derniers produits fraîchement arrivés.", "Discover our latest freshly arrived products."],
  [">Aucun produit récent<", ">No recent products<"],
  [">Retour à l'accueil<", ">Back to Home<"],

  // === BlogTable.tsx ===
  ["if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return", "if (!confirm('Are you sure you want to delete this article?')) return"],
  [">Catégorie<", ">Category<"],
  [">Aucun article trouvé.<", ">No articles found.<"],
  ["article.isPublished ? 'Publié' : 'Draft'", "article.isPublished ? 'Published' : 'Draft'"],

  // === ProductsTable.tsx ===
  ['if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?"))', 'if (confirm("Are you sure you want to delete this product?"))'],
  ["'Sans catégorie'", "'Uncategorized'"],
  [">Épuisé<", ">Out of stock<"],
  ["Astuce CSS pour afficher les actions au survol de la ligne entière", "CSS trick to show actions on full row hover"],

  // === BlogSidebar.tsx ===
  [">Articles Récents<", ">Recent Articles<"],
  [">Aucun article récent.<", ">No recent articles.<"],
  [">Commentaires Récents<", ">Recent Comments<"],
  [">Aucun commentaire à afficher.<", ">No comments to display.<"],

  // === CommentForm.tsx ===
  ["setMessage('Votre commentaire a été envoyé avec succès !')", "setMessage('Your comment was submitted successfully!')"],
  [">Écrire un avis<", ">Write a review<"],
  [">Votre adresse e-mail ne sera pas publiée. Les champs obligatoires sont indiqués avec<", ">Your email address will not be published. Required fields are marked with<"],
  ["message.includes('succès')", "message.includes('successfully')"],

  // === ShopSort.tsx ===
  ["Affichage de {currentRange} sur {totalResults} résultats", "Showing {currentRange} of {totalResults} results"],
  [">Tri Par Défaut<", ">Default Sort<"],
  [">Prix décroissant<", ">Price: High to Low<"],
  [">Nouveautés<", ">Newest<"],

  // === AdminChatClient.tsx ===
  ['if (confirm("Êtes-vous sûr de vouloir fermer cette conversation ?"))', 'if (confirm("Are you sure you want to close this conversation?"))'],
  ['placeholder="Écrire une réponse..."', 'placeholder="Write a reply..."'],
  [">Sélectionnez une conversation pour commencer<", ">Select a conversation to start<"],

  // === pages/page.tsx ===
  [">Pages Personnalisées<", ">Custom Pages<"],
  [">Éditer<", ">Edit<"],
  ['Aucune page trouvée. Cliquez sur "Create une page" pour commencer.', 'No page found. Click "Create a page" to get started.'],

  // === shipping/page.tsx ===
  ["title: 'Settings d\\'expédition | Shopelios Admin'", "title: 'Shipping Settings | Shopelios Admin'"],
  [">Settings d'expédition<", ">Shipping Settings<"],
  [">Configurez les zones desservies (pays) et les coûts de livraison.<", ">Configure the zones served (countries) and shipping costs.<"],

  // === setup/page.tsx ===
  ["Configurez votre compte administrateur principal pour commencer à gérer votre boutique.", "Configure your main administrator account to start managing your store."],
  ['placeholder="Password sécurisé"', 'placeholder="Secure password"'],
  ["isPending ? 'Création en cours...' : 'Create le compte Administrateur'", "isPending ? 'Creating...' : 'Create Administrator Account'"],

  // === layout.tsx ===
  ["maintenanceMessage: settingsMap.MAINTENANCE_MESSAGE || 'Nous mettons actuellement à jour notre boutique. Revenez très bientôt !'", "maintenanceMessage: settingsMap.MAINTENANCE_MESSAGE || 'We are currently updating our store. Come back soon!'"],
  ["mobileAboutTitle: settingsMap.MOBILE_ABOUT_TITLE || 'À propos de nous'", "mobileAboutTitle: settingsMap.MOBILE_ABOUT_TITLE || 'About Us'"],
  ["mobileAboutDesc: settingsMap.MOBILE_ABOUT_DESC || 'Nous sommes une boutique passionnée par la qualité et l\\'excellence.'", "mobileAboutDesc: settingsMap.MOBILE_ABOUT_DESC || 'We are a store passionate about quality and excellence.'"],

  // === robots.ts ===
  ["// À remplacer par le vrai domaine", "// Replace with the real domain"],
  ["// On interdit à Google d'indexer les pages privées", "// Blocking Google from indexing private pages"],
  ["// On indique à Google où trouver le sitemap", "// Tell Google where to find the sitemap"],

  // === sitemap.ts ===
  ["// À remplacer par le vrai domaine", "// Replace with the real domain"],
  ["// 4. Catégories dynamiques", "// 4. Dynamic categories"],

  // === wishlist ===
  ["Explorez notre catalogue et ajoutez des produits à vos favoris.", "Explore our catalog and add products to your wishlist."],
  [">Découvrir les produits<", ">Discover products<"],

  // === ProductCard.tsx ===
  ['title="Aperçu rapide"', 'title="Quick view"'],
  ["'Général'", "'General'"],

  // === contact.ts ===
  ["return { success: true, message: 'Votre message a été envoyé avec succès !' }", "return { success: true, message: 'Your message has been sent successfully!' }"],
  ["const successMsg = settings.NEWSLETTER_SUCCESS_MESSAGE || 'Merci pour votre inscription à notre newsletter !'", "const successMsg = settings.NEWSLETTER_SUCCESS_MESSAGE || 'Thank you for subscribing to our newsletter!'"],

  // === account/addresses/page.tsx ===
  ["// Pour l'instant, les adresses ne sont pas gérées dans la base de données.", "// For now, addresses are not managed in the database."],
  ["// Nous affichons l'interface par défaut (vide).", "// We display the default (empty) interface."],

  // === account/downloads/page.tsx ===
  ["// Pour le moment, nous n'avons pas de modèle de téléchargement dans la base de données.", "// For now, we have no download model in the database."],
  ["// Quand la fonctionnalité sera ajoutée, il suffira de requêter les produits téléchargeables achetés par l'utilisateur.", "// When the feature is added, it will be enough to query downloadable products purchased by the user."],

  // === orders/[id]/page.tsx ===
  ["{/* Détails Commande */}", "{/* Order Details */}"],
  [">Qté:<", ">Qty:<"],

  // === hot/page.tsx ===
  ["Les produits les plus appréciés et les plus vendus de notre boutique.", "The most appreciated and best-selling products in our store."],
  ["Retour à l'accueil", "Back to Home"],

  // === not-found.tsx ===
  ["\"Il semble que nous ne puissions pas trouver la page que vous cherchez. Elle a peut-être été déplacée ou supprimée.\"", '"It seems we cannot find the page you are looking for. It may have been moved or deleted."'],
  ["\"Retour à l'accueil\"", '"Back to Home"'],

  // === sale/page.tsx ===
  ["Profitez de nos meilleures offres et réductions exclusives.", "Enjoy our best deals and exclusive discounts."],

  // === shop/page.tsx ===
  ["description: 'Découvrez notre catalogue de produits'", "description: 'Discover our product catalog'"],
  [">Aucun produit trouvé<", ">No products found<"],

  // === CategoryCreateForm.tsx ===
  ['placeholder="Name de la catégorie (ex: Smartphones)"', 'placeholder="Category name (ex: Smartphones)"'],
  [">Aucun parent (Catégorie Principale)<", ">No parent (Main Category)<"],

  // === CategoryTable.tsx ===
  ["if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return", "if (!confirm('Are you sure you want to delete this category?')) return"],
  [">Aucune catégorie existante.<", ">No existing categories.<"],

  // === OrderTable.tsx ===
  ["if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return", "if (!confirm('Are you sure you want to delete this order?')) return"],
  ["text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1.5 rounded font-medium text-sm\">Détails<", "text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1.5 rounded font-medium text-sm\">Details<"],

  // === MaintenanceView.tsx ===
  [">Rafraîchir la page<", ">Refresh page<"],
  ["Tous droits réservés.", "All rights reserved."],

  // === TrackingMap.tsx ===
  ["Départ : ${originName}", "Departure: ${originName}"],
  ["Arrivée : ${destinationName}", "Arrival: ${destinationName}"],

  // === formatPrice.ts ===
  ["* Calcule le prix TTC si le prix de base est HT, et formate la chaîne complète.", "* Calculates the tax-inclusive price if the base price is tax-exclusive, and formats the complete string."],
  ["* Si le paramètre 'taxIncludedInPrice' est vrai : affiche simplement \"Prix TTC\" (ex: 120€ TTC)", "* If 'taxIncludedInPrice' is true: simply displays the price (ex: 120€ incl. tax)"],

  // === chat/page.tsx admin ===
  [">Répondez aux questions de vos clients en direct.<", ">Reply to your customers' questions live.<"],

  // === admin/login/page.tsx ===
  ["Connectez-vous pour gérer votre boutique Shopelios", "Sign in to manage your Shopelios store"],

  // === blog/page.tsx ===
  ["Aucun article trouvé{query ? ` pour \"${query}\"` : ''}.", "No articles found{query ? ` for \"${query}\"` : ''}."],

  // === checkout/page.tsx ===
  ["// N'envoyer au client QUE les paramètres nécessaires, pour des raisons de sécurité", "// Send to the client ONLY the necessary settings, for security reasons"],

  // === ContactForm.tsx ===
  ["res.success ? (res.message || 'Message envoyé avec succès.')", "res.success ? (res.message || 'Message sent successfully.')"],

  // === product/[slug]/page.tsx ===
  ["// Composant interne pour l'étoile", "// Internal star component"],

  // === wishlist/page.tsx ===
  ["description: 'Gérez vos produits favoris sur Shopelios'", "description: 'Manage your favorite products on Shopelios'"],

  // === [slug]/page.tsx ===
  ["{/* En-tête basique de page si nécessaire, ou on laisse le contenu libre */}", "{/* Basic page header if needed, otherwise leave content free */}"],

  // === DashboardChart.tsx ===
  [">Pas de données disponibles<", ">No data available<"],

  // === ReviewTable.tsx ===
  ["review.isApproved ? 'Approuvé' : 'Pending'", "review.isApproved ? 'Approved' : 'Pending'"],

  // === LogoutLink.tsx ===
  ["isPending ? 'Déconnexion...' : 'Déconnexion'", "isPending ? 'Logging out...' : 'Log out'"],

  // === LatestBlogs.tsx ===
  ["// Réordonner selon l'ordre manuel", "// Reorder according to manual order"],

  // === Header.tsx ===
  ["// Helper pour rendre les icônes", "// Helper to render icons"],

  // === NotificationBell.tsx ===
  [">Voir les détails &rarr;<", ">View details &rarr;<"],

  // === StoreLayout.tsx ===
  ["settings.maintenanceMessage || 'Nous mettons actuellement à jour notre boutique. Revenez très bientôt !'", "settings.maintenanceMessage || 'We are currently updating our store. Come back soon!'"],

  // === ProductActions.tsx ===
  ["// Pour les produits variables, on vérifie si une variation correspond aux attributs sélectionnés", "// For variable products, we check if a variation matches the selected attributes"],

  // === ShopFilters.tsx ===
  [">Filtrer les catégories<", ">Filter categories<"],

  // === middleware.ts ===
  ["// 30 requêtes max par 10 secondes par IP", "// 30 max requests per 10 seconds per IP"],

  // === blog/page.tsx ===
  [">Aucun article trouvé<", ">No articles found<"],

  // === Billing detail etc ===
  ["Enregistrement...", "Saving..."],
];

const extensions = ['.ts', '.tsx'];

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
      for (const [fr, en] of replacements) {
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

console.log('Processing all source files...');
const count = processDir('src');
console.log(`\nDone! Updated ${count} files.`);
