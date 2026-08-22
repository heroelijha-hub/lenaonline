# Récapitulatif du Projet : Shopelios

Ce document liste toutes les fonctionnalités et configurations qui ont été mises en place jusqu'à présent sur la boutique E-commerce **Shopelios**.

## 🛠 Stack Technique
- **Framework** : Next.js 16.3.1 (App Router)
- **Base de données** : PostgreSQL (hébergé sur Supabase)
- **ORM** : Prisma
- **Style** : Tailwind CSS (Responsive Mobile-First)

---

## 🛒 Côté Utilisateur (Storefront)

### 1. Navigation et Layout (Header & Footer)
- **En-tête dynamique** : 
  - Affichage intelligent des liens **New**, **Hot**, et **Sale** uniquement lorsque des produits correspondant à ces critères existent dans la base de données.
  - Espacement ajusté entre le logo et la barre de recherche pour un meilleur rendu visuel.
  - Correction de la taille du logo pour éviter qu'il ne masque la barre d'annonce.
- **Responsive Design** : 
  - Menu hamburger fonctionnel sur mobile.
  - Typographie adaptative via des variables CSS (`--sz-*`).
- **Footer optimisé** :
  - Design premium avec colonnes qui se transforment en accordéons (collapsibles) sur mobile.
  - Bouton dynamique "Back to top" (jaune, orange au survol) intégré avec le style du thème.

### 2. Pages de Produits Spécifiques
- **Page `/sale` (Promotions)** : N'affiche que les produits possédant un *prix de comparaison* renseigné.
- **Page `/hot` (Populaires)** : Filtre automatique affichant uniquement les produits les plus commandés par les clients (basé sur le nombre réel d'achats).
- **Page `/new` (Nouveautés)** : Affiche strictement les 12 derniers produits ajoutés au catalogue.

### 3. Panier et Paiement (Checkout)
- **Panier tiroir** : S'ouvre sur le côté (pleine largeur sur mobile).
- **Moyens de paiement dynamiques** : Le client ne voit que les moyens de paiement activés par l'administrateur (Stripe, PayPal, ou Virement Bancaire).
- **Virement Bancaire** : Affichage d'un message dynamique (configuré depuis l'admin) contenant les instructions bancaires (IBAN, etc.) lors du passage à la caisse.
- **Gestion des Zones d'Expédition** : Prise en compte de l'adresse de facturation/livraison pour le calcul des frais de livraison dynamiques.

### 4. Landing Page / Accueil
- **Section BestSeller & Promo** : 
  - Grille de produits dynamique avec fonctionnalités d'**Auto-Slider** si le nombre de produits défini dépasse une limite (1 sur Mobile, 3 sur Tablette, 5 sur Desktop).
  - Navigation améliorée avec les flèches directionnelles sur les grilles de produits.
  - Cartes produits premium avec couleurs de bordures configurables depuis l'admin.
- **Section BestDeals (Bannières promotionnelles)** : 
  - Images, textes d'accroche et boutons d'action (Call-to-Action) 100% éditables depuis le dashboard.
- **Section Avis Clients (Testimonials)** :
  - Alimentée dynamiquement depuis la base de données avec de vrais avis approuvés, remplaçant les placeholders par défaut.

### 5. Internationalisation et Langue
- **Projet strictement en Anglais** : L'ensemble de l'interface (Espace Admin, Espace Client, Landing Page, Messages d'erreur, Auth et Checkout) a été intégralement traduit de Français à Anglais pour correspondre au marché visé.

---

## ⚙️ Côté Administrateur (Dashboard)

### 1. Gestion des Paramètres (Settings)
- **Sauvegarde ultra-rapide** : Le formulaire des paramètres (qui contient plus de 50 champs) sauvegarde toutes les modifications en moins d'une seconde grâce à une mise à jour groupée (Batch Update avec transaction Prisma).
- **Personnalisation de la boutique** :
  - Couleurs (Thème, Top Bar, Bouton de recherche, Footer, etc.).
  - Textes et Liens (Annonces, Réseaux Sociaux, Menus de navigation).
  - Logos et Images (Logo principal, Icône de chat, Image de maintenance).
- **Modes de paiement (Toggles)** :
  - Possibilité d'activer/désactiver Stripe, PayPal, et le Virement Bancaire d'un simple clic.
  - Champs dédiés pour saisir l'IBAN, le titulaire du compte, et les instructions de virement.

### 2. Gestion des Produits
- Intégration d'un **Éditeur de Texte Riche (Rich Text Editor)** basé sur `react-quill` pour faciliter la rédaction des descriptions de produits avec du formatage (gras, italique, puces, etc.).
- Correction des conflits de versions liés à React 19 pour assurer des déploiements fluides sur Vercel.

### 3. Landing Page Builder (Éditeur)
- **Constructeur visuel (Drag & Drop / Reorder)** : Les sections de la page d'accueil peuvent être remontées ou descendues avec des flèches directionnelles intuitives (côte à côte).
- **Duplication de section** : Possibilité de cloner (dupliquer) une section en un clic via le bouton bleu.
- **Configuration Responsive** : Chaque section gère ses propres paramètres de colonnes/affichage pour Mobile, Tablette et Ordinateur de bureau.

---

## 🛡 Sécurité et Performances

### 1. Protection Anti-DDoS et Rate Limiting
- **Edge Middleware** : Mise en place d'un intercepteur de requêtes Next.js tournant à l'Edge (Cloudflare/Vercel).
- **Redis (Upstash)** : Limiteur de débit (`Ratelimit.slidingWindow`) configuré pour bloquer les tentatives de hacking (Brute force) ou envois massifs de requêtes qui chercheraient à faire tomber le site (shutdown).
- Retourne dynamiquement un écran HTML de blocage ("429 Too Many Requests") en cas d'abus.

### 2. Mesures futures prévues
- Intégration de Cloudflare côté nom de domaine (Gestion DNS et anti-bot layer 7).
- Intégration de Google reCAPTCHA sur les formulaires sensibles une fois les clés API générées.
- Outil de Live Supervision pour surveiller les visiteurs en temps réel.

---

## 🚀 DevOps et Déploiement
- Déploiement automatisé sur **Vercel**.
- Synchronisation continue avec **GitHub**.
- Fichier `.npmrc` configuré pour passer outre les erreurs de dépendances obsolètes (`legacy-peer-deps=true`) afin de garantir des builds stables sans interruption.
