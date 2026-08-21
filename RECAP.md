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
  - Grille de produits s'adaptant automatiquement (2 colonnes sur mobile, jusqu'à 5 sur ordinateur).

### 2. Pages de Produits Spécifiques
- **Page `/sale` (Promotions)** : N'affiche que les produits possédant un *prix de comparaison* renseigné.
- **Page `/hot` (Populaires)** : Filtre automatique affichant uniquement les produits les plus commandés par les clients (basé sur le nombre réel d'achats).
- **Page `/new` (Nouveautés)** : Affiche strictement les 12 derniers produits ajoutés au catalogue.

### 3. Panier et Paiement (Checkout)
- **Panier tiroir** : S'ouvre sur le côté (pleine largeur sur mobile).
- **Moyens de paiement dynamiques** : Le client ne voit que les moyens de paiement activés par l'administrateur (Stripe, PayPal, ou Virement Bancaire).
- **Virement Bancaire** : Affichage d'un message dynamique (configuré depuis l'admin) contenant les instructions bancaires (IBAN, etc.) lors du passage à la caisse.

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

---

## 🚀 DevOps et Déploiement
- Déploiement automatisé sur **Vercel**.
- Synchronisation continue avec **GitHub**.
- Fichier `.npmrc` configuré pour passer outre les erreurs de dépendances obsolètes (`legacy-peer-deps=true`) afin de garantir des builds stables sans interruption.
