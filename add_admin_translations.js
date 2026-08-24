const fs = require('fs');
const path = require('path');

const locales = ['en', 'fr', 'es'];

const translations = {
  en: {
    AdminSetup: {
      "welcome": "Welcome!",
      "description": "Configure your main administrator account to start managing your store.",
      "email_label": "Administrator Email",
      "password_label": "Password",
      "email_placeholder": "admin@yourstore.com",
      "password_placeholder": "Secure password",
      "creating": "Creating...",
      "create_btn": "Create Administrator Account"
    },
    AdminLogin: {
      "title": "Admin Space",
      "description": "Sign in to manage your store",
      "email_label": "Administrator Email",
      "password_label": "Password",
      "email_placeholder": "admin@yourstore.com",
      "password_placeholder": "••••••••",
      "login_btn": "Login",
      "logging_in": "Logging in..."
    },
    AdminLayout: {
      "title": "Shopelios Admin",
      "dashboard": "Dashboard",
      "products": "Products",
      "categories": "Categories",
      "orders": "Orders",
      "abandoned_carts": "Abandoned Carts",
      "coupons": "Coupons",
      "landing_page": "Landing Page",
      "customer_chat": "Customer Chat",
      "blog": "Blog",
      "pages": "Pages",
      "settings": "Settings",
      "shipping": "Shipping",
      "sign_out": "Sign out"
    },
    AdminDashboard: {
      "title": "Dashboard",
      "subtitle": "Global overview of your store performance.",
      "revenue": "Revenue",
      "total_revenue": "Total generated revenue",
      "orders": "Orders",
      "validated_orders": "Total validated orders",
      "customers": "Customers",
      "registered_customers": "Registered on the store",
      "aov": "Average Order Value",
      "avg_spend": "Average spend per customer",
      "sales_last_30_days": "Sales (Last 30 Days)",
      "latest_orders": "Latest Orders",
      "view_all": "View all",
      "no_recent_orders": "No recent orders.",
      "articles": "item(s)"
    }
  },
  fr: {
    AdminSetup: {
      "welcome": "Bienvenue !",
      "description": "Configurez votre compte administrateur principal pour commencer à gérer votre boutique.",
      "email_label": "Email Administrateur",
      "password_label": "Mot de passe",
      "email_placeholder": "admin@votreboutique.com",
      "password_placeholder": "Mot de passe sécurisé",
      "creating": "Création en cours...",
      "create_btn": "Créer le compte administrateur"
    },
    AdminLogin: {
      "title": "Espace Admin",
      "description": "Connectez-vous pour gérer votre boutique",
      "email_label": "Email Administrateur",
      "password_label": "Mot de passe",
      "email_placeholder": "admin@votreboutique.com",
      "password_placeholder": "••••••••",
      "login_btn": "Connexion",
      "logging_in": "Connexion en cours..."
    },
    AdminLayout: {
      "title": "Shopelios Admin",
      "dashboard": "Tableau de bord",
      "products": "Produits",
      "categories": "Catégories",
      "orders": "Commandes",
      "abandoned_carts": "Paniers abandonnés",
      "coupons": "Codes Promo",
      "landing_page": "Page d'accueil",
      "customer_chat": "Chat Client",
      "blog": "Blog",
      "pages": "Pages",
      "settings": "Paramètres",
      "shipping": "Livraison",
      "sign_out": "Déconnexion"
    },
    AdminDashboard: {
      "title": "Tableau de bord",
      "subtitle": "Aperçu global des performances de votre boutique.",
      "revenue": "Revenus",
      "total_revenue": "Total des revenus générés",
      "orders": "Commandes",
      "validated_orders": "Commandes validées",
      "customers": "Clients",
      "registered_customers": "Inscrits sur la boutique",
      "aov": "Panier Moyen",
      "avg_spend": "Dépense moyenne par client",
      "sales_last_30_days": "Ventes (30 derniers jours)",
      "latest_orders": "Dernières commandes",
      "view_all": "Voir tout",
      "no_recent_orders": "Aucune commande récente.",
      "articles": "article(s)"
    }
  },
  es: {
    AdminSetup: {
      "welcome": "¡Bienvenido!",
      "description": "Configure su cuenta de administrador principal para comenzar a administrar su tienda.",
      "email_label": "Correo del administrador",
      "password_label": "Contraseña",
      "email_placeholder": "admin@sutienda.com",
      "password_placeholder": "Contraseña segura",
      "creating": "Creando...",
      "create_btn": "Crear cuenta de administrador"
    },
    AdminLogin: {
      "title": "Espacio Admin",
      "description": "Inicie sesión para administrar su tienda",
      "email_label": "Correo del administrador",
      "password_label": "Contraseña",
      "email_placeholder": "admin@sutienda.com",
      "password_placeholder": "••••••••",
      "login_btn": "Iniciar sesión",
      "logging_in": "Iniciando sesión..."
    },
    AdminLayout: {
      "title": "Shopelios Admin",
      "dashboard": "Panel de control",
      "products": "Productos",
      "categories": "Categorías",
      "orders": "Pedidos",
      "abandoned_carts": "Carritos abandonados",
      "coupons": "Cupones",
      "landing_page": "Página de inicio",
      "customer_chat": "Chat de clientes",
      "blog": "Blog",
      "pages": "Páginas",
      "settings": "Configuración",
      "shipping": "Envío",
      "sign_out": "Cerrar sesión"
    },
    AdminDashboard: {
      "title": "Panel de control",
      "subtitle": "Descripción general del rendimiento de su tienda.",
      "revenue": "Ingresos",
      "total_revenue": "Ingresos totales generados",
      "orders": "Pedidos",
      "validated_orders": "Total de pedidos validados",
      "customers": "Clientes",
      "registered_customers": "Registrados en la tienda",
      "aov": "Valor promedio del pedido",
      "avg_spend": "Gasto promedio por cliente",
      "sales_last_30_days": "Ventas (Últimos 30 días)",
      "latest_orders": "Últimos pedidos",
      "view_all": "Ver todo",
      "no_recent_orders": "No hay pedidos recientes.",
      "articles": "artículo(s)"
    }
  }
};

for (const locale of locales) {
  const filePath = path.join(__dirname, 'messages', `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.AdminSetup = translations[locale].AdminSetup;
    data.AdminLogin = translations[locale].AdminLogin;
    data.AdminLayout = translations[locale].AdminLayout;
    data.AdminDashboard = translations[locale].AdminDashboard;
    
    // Also remove the old "Admin" namespace we saw in AdminDashboard if it exists
    if (data.Admin) {
      delete data.Admin;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${locale}.json with Admin Phase 1 translations`);
  }
}
