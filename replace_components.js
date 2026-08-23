const fs = require('fs');

const filesToProcess = [
  'src/app/admin/(dashboard)/settings/page.tsx',
  'src/app/admin/(dashboard)/settings/SettingsForm.tsx',
  'src/app/admin/(dashboard)/page.tsx',
  'src/components/admin/ProductForm.tsx',
  'src/components/admin/ProductsTable.tsx',
  'src/app/admin/(dashboard)/categories/page.tsx',
  'src/components/admin/CategoryTable.tsx',
  'src/app/admin/(dashboard)/orders/page.tsx',
  'src/components/admin/OrderTable.tsx',
  'src/app/admin/(dashboard)/coupons/page.tsx',
  'src/components/admin/CouponTable.tsx',
  'src/app/admin/(dashboard)/landing/LandingForm.tsx',
  'src/app/admin/(dashboard)/landing/page.tsx',
];

const translations = [
  ['>Settings de la boutique<', '>{t("shop_settings")}<'],
  ["Configurez la devise, la langue et d'autres options globales.", '{t("shop_settings_desc")}'],
  ['>Settings Régionaux<', '>{t("regional_settings")}<'],
  ['>Devise principale<', '>{t("main_currency")}<'],
  ['>Position du symbole<', '>{t("symbol_position")}<'],
  ['>Droite (ex: 10$)<', '>{t("right_ex")}<'],
  ['>Gauche avec espace (ex: $ 10)<', '>{t("left_space_ex")}<'],
  ['>Droite avec espace (ex: 10 $)<', '>{t("right_space_ex")}<'],
  ['>Espace (ex: 1 000)<', '>{t("space_ex")}<'],
  ['>Aucun (ex: 1000)<', '>{t("none_ex")}<'],
  ['>Virgule (ex: 1,000)<', '>{t("comma_ex")}<'],
  ['>Point (ex: 1.000)<', '>{t("dot_ex_thousand")}<'],
  ['>Point (ex: 10.50)<', '>{t("dot_ex_decimal")}<'],
  ['>Virgule (ex: 10,50)<', '>{t("comma_ex_decimal")}<'],
  [">Save cette section<", '>{t("save_section")}<'],
  ['>Sales of the last 30 days<', '>{t("sales_last_30_days")}<'],
  ['>Total revenue<', '>{t("total_revenue")}<'],
  ['>Orders validées<', '>{t("validated_orders")}<'],
  ['>Dernières Orders<', '>{t("latest_orders")}<'],
  ['>Edit<', '>{t("product_edit")}<'],
  ['>Modification rapide<', '>{t("product_quick_edit")}<'],
  ['>Corbeille<', '>{t("product_trash")}<'],
  ['>Voir<', '>{t("product_view")}<'],
  ['>Dupliquer<', '>{t("product_duplicate")}<'],
  ['>En stock<', '>{t("in_stock")}<'],
  ['>Price de base ($)<', '>{t("base_price")}<'],
  ['>Price de base ($) *<', '>{t("base_price_req")}<'],
  ['>Price barré ($)<', '>{t("sale_price")}<'],
  ['>Attributs<', '>{t("attributes")}<'],
  ['>+ Add un attribut<', '>{t("add_attribute")}<'],
  ['>Aucun attribut. Ajoutez-en pour pouvoir créer des variations.<', '>{t("no_attributes")}<'],
  ['>Variations<', '>{t("variations")}<'],
  ['>+ Add une variation<', '>{t("add_variation")}<'],
  ['>Ajoutez des variations avec leurs propres prix.<', '>{t("add_variation_desc")}<'],
  [">Galerie d'images (Cloudinary - max 20)<", '>{t("image_gallery")}<'],
  ['>Glissez-déposez les images existantes pour modifier leur ordre. Cliquez sur la croix pour supprimer.<', '>{t("image_gallery_desc")}<'],
  ['>Aucun fichier choisi<', '>{t("no_file_chosen")}<'],
  ['>Description Courte<', '>{t("short_desc")}<'],
  ['>Description Longue<', '>{t("long_desc")}<'],
  ['>Tags (Mots-clés)<', '>{t("tags_label")}<'],
  ['placeholder="Ex: nouveauté, été, promotion... (Appuyez sur Entrée)"', 'placeholder={t("tags_placeholder")}'],
  ['>Mettre en "Best Seller"<', '>{t("set_best_seller")}<'],
  ['>Mettre en "Deal of the Day"<', '>{t("set_deal_of_day")}<'],
  [">Formulaire d'ajout de produit<", '>{t("add_product_form")}<'],
  ['>Type de Produit<', '>{t("product_type")}<'],
  ['>Produit Simple<', '>{t("simple_product")}<'],
  ['>Produit Variable<', '>{t("variable_product")}<'],
  ['>Title du produit<', '>{t("product_title")}<'],
  ['>Gestion des Categories<', '>{t("manage_categories")}<'],
  ['>Add une catégorie<', '>{t("add_category")}<'],
  ['>Name de la catégorie (ex: Smartphones)<', '>{t("category_name")}<'],
  ['>Slug (ex: smartphones)<', '>{t("category_slug")}<'],
  ['>Aucun parent (Catégorie Principale)<', '>{t("no_parent")}<'],
  ['>On a pour catégories<', '>{t("we_have_categories")}<'],
  ['>Parent<', '>{t("parent_col")}<'],
  ['>Principale<', '>{t("main_col")}<'],
  ['>Action<', '>{t("action_col")}<'],
  ['>Éditer<', '>{t("edit_col")}<'],
  ['>Gestion des Orders<', '>{t("manage_orders")}<'],
  ['>Commande<', '>{t("order_col")}<'],
  ['>Date<', '>{t("date_col")}<'],
  ['>Customer<', '>{t("customer_col")}<'],
  ['>Total<', '>{t("total_col")}<'],
  ['>Status<', '>{t("status_col")}<'],
  ['>Actions<', '>{t("actions_col")}<'],
  ['>Paiement reçu<', '>{t("status_paid")}<'],
  ['>En cours de préparation<', '>{t("status_processing")}<'],
  ['>Expédié<', '>{t("status_shipped")}<'],
  ['>En transit<', '>{t("status_in_transit")}<'],
  ['>Livré<', '>{t("status_delivered")}<'],
  ['>Déposé en point relais<', '>{t("status_pickup")}<'],
  ['>Annulé<', '>{t("status_cancelled")}<'],
  ['>Page coupon Admin<', '>{t("coupon_page")}<'],
  ['>New Coupon<', '>{t("new_coupon")}<'],
  ['>Code Promo *<', '>{t("promo_code")}<'],
  ['placeholder="ex: SOLDES20"', 'placeholder={t("promo_code_ex")}'],
  ['>Type de réduction *<', '>{t("discount_type")}<'],
  ['>Pourcentage (%)<', '>{t("percentage")}<'],
  ['>Montant fixe (€)<', '>{t("fixed_amount")}<'],
  ['>Valeur de la réduction *<', '>{t("discount_value")}<'],
  ['placeholder="ex: 20"', 'placeholder={t("discount_value_ex")}'],
  ['>Active immédiatement<', '>{t("active_immediately")}<'],
  ['>Create le coupon<', '>{t("create_coupon")}<'],
  ['>Gestion des Coupons<', '>{t("manage_coupons")}<'],
  ['>Code<', '>{t("code_col")}<'],
  ['>Réduction<', '>{t("discount_col")}<'],
  ['>Page Landing page dans Admin<', '>{t("landing_page_admin")}<'],
  ['>Settings Globaux<', '>{t("global_settings")}<'],
  ['>Police de Caractères<', '>{t("font_family")}<'],
  [">Cliquez sur une section dans l'aperçu ou sélectionnez-la ici.<", '>{t("click_section_preview")}<'],
  ['>En-tête Principal (Hero)<', '>{t("hero_section")}<'],
  ['>Nouvelle section (ProductGrid)<', '>{t("new_section_grid")}<'],
  ['>Promotions du Jour<', '>{t("promotions_of_day")}<'],
  ['>Bannières Promo<', '>{t("promo_banners")}<'],
  ['>Meilleures Ventes<', '>{t("best_sellers_section")}<'],
  ['>Derniers Articles de Blog<', '>{t("latest_blog_posts")}<'],
  ['>Inscription Newsletter<', '>{t("newsletter_signup")}<'],
  ['>Add un widget<', '>{t("add_widget")}<'],
  ['>Hero<', '>{t("hero")}<'],
  ['>Bannières<', '>{t("banners")}<'],
  ['>Promos<', '>{t("promos")}<'],
  ['>Grille<', '>{t("grid")}<'],
  ['>Blog<', '>{t("blog")}<'],
  ['>Newsletter<', '>{t("newsletter")}<']
];

for (const file of filesToProcess) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  let hasReplaced = false;
  for (const [search, replace] of translations) {
    if (content.includes(search)) {
      content = content.replaceAll(search, replace);
      hasReplaced = true;
    }
  }

  if (hasReplaced) {
    if (!content.includes('useTranslations')) {
      const importStmt = "import { useTranslations } from 'next-intl';\n";
      
      // Inject import
      if (content.includes("'use client'") || content.includes('"use client"')) {
        content = content.replace(/['"]use client['"];?\s*/, "'use client';\n" + importStmt);
      } else {
        content = importStmt + content;
      }
      
      // Inject hook inside component
      // Find the first default export function
      content = content.replace(/(export default function \w+\([^)]*\)(\s*:\s*[^{]+)?\s*{)/, "$1\n  const t = useTranslations('Admin');\n");
    }
    fs.writeFileSync(file, content);
    console.log("Updated " + file);
  }
}
