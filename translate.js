const fs = require('fs');
const path = require('path');

const enPath = 'messages/en.json';
const frPath = 'messages/fr.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

if (!en.Admin) en.Admin = {};
if (!fr.Admin) fr.Admin = {};

function addT(key, frText, enText) {
  fr.Admin[key] = frText;
  en.Admin[key] = enText;
}

// Global settings
addT('shop_settings', 'Settings de la boutique', 'Shop Settings');
addT('shop_settings_desc', "Configurez la devise, la langue et d'autres options globales.", 'Configure currency, language and other global options.');
addT('regional_settings', 'Settings Régionaux', 'Regional Settings');
addT('main_currency', 'Devise principale', 'Main Currency');
addT('symbol_position', 'Position du symbole', 'Symbol Position');
addT('right_ex', 'Droite (ex: 10$)', 'Right (ex: 10$)');
addT('left_space_ex', 'Gauche avec espace (ex: $ 10)', 'Left with space (ex: $ 10)');
addT('right_space_ex', 'Droite avec espace (ex: 10 $)', 'Right with space (ex: 10 $)');
addT('space_ex', 'Espace (ex: 1 000)', 'Space (ex: 1 000)');
addT('none_ex', 'Aucun (ex: 1000)', 'None (ex: 1000)');
addT('comma_ex', 'Virgule (ex: 1,000)', 'Comma (ex: 1,000)');
addT('dot_ex_thousand', 'Point (ex: 1.000)', 'Dot (ex: 1.000)');
addT('dot_ex_decimal', 'Point (ex: 10.50)', 'Dot (ex: 10.50)');
addT('comma_ex_decimal', 'Virgule (ex: 10,50)', 'Comma (ex: 10,50)');
addT('save_section', 'Save cette section', 'Save this section');

// Dashboard
addT('sales_last_30_days', 'Ventes des 30 derniers jours', 'Sales of the last 30 days');
addT('total_revenue', 'Total revenue', 'Total revenue');
addT('validated_orders', 'Orders validées', 'Validated orders');
addT('latest_orders', 'Dernières Orders', 'Latest Orders');
addT('month_jan', 'Jan', 'Jan');
addT('month_feb', 'Fév', 'Feb');
addT('month_mar', 'Mar', 'Mar');
addT('month_apr', 'Avr', 'Apr');
addT('month_may', 'Mai', 'May');
addT('month_jun', 'Juin', 'Jun');
addT('month_jul', 'Juil', 'Jul');
addT('month_aug', 'Août', 'Aug');
addT('month_sep', 'Sep', 'Sep');
addT('month_oct', 'Oct', 'Oct');
addT('month_nov', 'Nov', 'Nov');
addT('month_dec', 'Déc', 'Dec');

// Products
addT('product_edit', 'Edit', 'Edit');
addT('product_quick_edit', 'Modification rapide', 'Quick edit');
addT('product_trash', 'Corbeille', 'Trash');
addT('product_view', 'Voir', 'View');
addT('product_duplicate', 'Dupliquer', 'Duplicate');
addT('in_stock', 'En stock', 'In stock');
addT('base_price', 'Price de base ($)', 'Base price ($)');
addT('base_price_req', 'Price de base ($) *', 'Base price ($) *');
addT('sale_price', 'Price barré ($)', 'Sale price ($)');
addT('attributes', 'Attributs', 'Attributes');
addT('add_attribute', '+ Add un attribut', '+ Add attribute');
addT('no_attributes', 'Aucun attribut. Ajoutez-en pour pouvoir créer des variations.', 'No attributes. Add some to create variations.');
addT('variations', 'Variations', 'Variations');
addT('add_variation', '+ Add une variation', '+ Add variation');
addT('add_variation_desc', 'Ajoutez des variations avec leurs propres prix.', 'Add variations with their own prices.');
addT('image_gallery', "Galerie d'images (Cloudinary - max 20)", 'Image Gallery (Cloudinary - max 20)');
addT('image_gallery_desc', 'Glissez-déposez les images existantes pour modifier leur ordre. Cliquez sur la croix pour supprimer.', 'Drag and drop existing images to change their order. Click the cross to remove.');
addT('no_file_chosen', 'Aucun fichier choisi', 'No file chosen');
addT('short_desc', 'Description Courte', 'Short Description');
addT('long_desc', 'Description Longue', 'Long Description');
addT('tags_label', 'Tags (Mots-clés)', 'Tags');
addT('tags_placeholder', 'Ex: nouveauté, été, promotion... (Appuyez sur Entrée)', 'Ex: new, summer, sale... (Press Enter)');
addT('set_best_seller', 'Mettre en "Best Seller"', 'Set as "Best Seller"');
addT('set_deal_of_day', 'Mettre en "Deal of the Day"', 'Set as "Deal of the Day"');
addT('add_product_form', "Formulaire d'ajout de produit", 'Add Product Form');
addT('product_type', 'Type de Produit', 'Product Type');
addT('simple_product', 'Produit Simple', 'Simple Product');
addT('variable_product', 'Produit Variable', 'Variable Product');
addT('product_title', 'Title du produit', 'Product Title');

// Categories
addT('manage_categories', 'Gestion des Categories', 'Manage Categories');
addT('add_category', 'Add une catégorie', 'Add Category');
addT('category_name', 'Name de la catégorie (ex: Smartphones)', 'Category Name (ex: Smartphones)');
addT('category_slug', 'Slug (ex: smartphones)', 'Slug (ex: smartphones)');
addT('no_parent', 'Aucun parent (Catégorie Principale)', 'No parent (Main Category)');
addT('we_have_categories', 'On a pour catégories', 'We have categories');
addT('parent_col', 'Parent', 'Parent');
addT('main_col', 'Principale', 'Main');
addT('action_col', 'Action', 'Action');
addT('edit_col', 'Éditer', 'Edit');

// Orders
addT('manage_orders', 'Gestion des Orders', 'Manage Orders');
addT('order_col', 'Commande', 'Order');
addT('date_col', 'Date', 'Date');
addT('customer_col', 'Customer', 'Customer');
addT('total_col', 'Total', 'Total');
addT('status_col', 'Status', 'Status');
addT('actions_col', 'Actions', 'Actions');
addT('status_paid', 'Paiement reçu', 'Payment received');
addT('status_processing', 'En cours de préparation', 'Processing');
addT('status_shipped', 'Expédié', 'Shipped');
addT('status_in_transit', 'En transit', 'In transit');
addT('status_delivered', 'Livré', 'Delivered');
addT('status_pickup', 'Déposé en point relais', 'Ready for pickup');
addT('status_cancelled', 'Annulé', 'Cancelled');

// Coupons
addT('coupon_page', 'Page coupon Admin', 'Admin Coupon Page');
addT('new_coupon', 'New Coupon', 'New Coupon');
addT('promo_code', 'Code Promo *', 'Promo Code *');
addT('promo_code_ex', 'ex: SOLDES20', 'ex: SUMMER20');
addT('discount_type', 'Type de réduction *', 'Discount Type *');
addT('percentage', 'Pourcentage (%)', 'Percentage (%)');
addT('fixed_amount', 'Montant fixe (€)', 'Fixed Amount ($)');
addT('discount_value', 'Valeur de la réduction *', 'Discount Value *');
addT('discount_value_ex', 'ex: 20', 'ex: 20');
addT('active_immediately', 'Active immédiatement', 'Active immediately');
addT('create_coupon', 'Create le coupon', 'Create Coupon');
addT('manage_coupons', 'Gestion des Coupons', 'Manage Coupons');
addT('code_col', 'Code', 'Code');
addT('discount_col', 'Réduction', 'Discount');

// Landing Page
addT('landing_page_admin', 'Page Landing page dans Admin', 'Admin Landing Page');
addT('global_settings', 'Settings Globaux', 'Global Settings');
addT('font_family', 'Police de Caractères', 'Font Family');
addT('click_section_preview', "Cliquez sur une section dans l'aperçu ou sélectionnez-la ici.", 'Click a section in the preview or select it here.');
addT('hero_section', 'En-tête Principal (Hero)', 'Main Header (Hero)');
addT('new_section_grid', 'Nouvelle section (ProductGrid)', 'New Section (ProductGrid)');
addT('promotions_of_day', 'Promotions du Jour', 'Promotions of the Day');
addT('promo_banners', 'Bannières Promo', 'Promo Banners');
addT('best_sellers_section', 'Meilleures Ventes', 'Best Sellers');
addT('latest_blog_posts', 'Derniers Articles de Blog', 'Latest Blog Posts');
addT('newsletter_signup', 'Inscription Newsletter', 'Newsletter Signup');
addT('add_widget', 'Add un widget', 'Add a widget');
addT('hero', 'Hero', 'Hero');
addT('banners', 'Bannières', 'Banners');
addT('promos', 'Promos', 'Promos');
addT('grid', 'Grille', 'Grid');
addT('blog', 'Blog', 'Blog');
addT('newsletter', 'Newsletter', 'Newsletter');

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2) + '\n');

console.log('Translations added to JSON files.');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }
    
    if (content !== original) {
        // Automatically inject next-intl hook if it doesn't exist but we made replacements
        if (!content.includes('useTranslations') && content.includes('t(')) {
            // Very naive import injection
            if (content.includes('\"use client\";') || content.includes('\'use client\';')) {
                content = content.replace(/(['"]use client['"];?)/, '$1\nimport { useTranslations } from "next-intl";');
            } else {
                content = 'import { useTranslations } from "next-intl";\n' + content;
            }
            
            // Try to inject const t = useTranslations('Admin'); inside the default export component
            // We look for export default function XYZ() {
            content = content.replace(/(export default function \w+\([^)]*\)\s*{)/, '$1\n  const t = useTranslations("Admin");');
        }
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}
