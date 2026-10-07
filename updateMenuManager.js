const fs = require('fs');
let content = fs.readFileSync('src/components/admin/settings/MenuManager.tsx', 'utf8');

content = content.replace(/import \{ useRouter \} from 'next\/navigation';/, "import { useRouter } from 'next/navigation';\nimport { useTranslations } from 'next-intl';");
content = content.replace(/const router = useRouter\(\);/, "const router = useRouter();\n  const t = useTranslations('Admin');");

content = content.replace(/'Êtes-vous sûr de vouloir supprimer ce menu \?'/g, "t('confirm_delete_menu')");
content = content.replace(/'Erreur lors de la création du menu'/g, "t('menu_creation_error')");
content = content.replace(/'Erreur lors de la suppression'/g, "t('delete_error')");
content = content.replace(/'Menu sauvegardé avec succès !'/g, "t('menu_saved_success')");
content = content.replace(/'Erreur lors de la sauvegarde'/g, "t('save_error')");

content = content.replace(/>Vos Menus</g, ">{t('menu_manager_title')}<");
content = content.replace(/placeholder="Nom du nouveau menu..."/g, "placeholder={t('new_menu_placeholder')}");
content = content.replace(/>Aucun menu créé\.</g, ">{t('no_menu_created')}<");
content = content.replace(/title="Supprimer ce menu"/g, "title={t('delete_menu_title')}");
content = content.replace(/>Sélectionnez ou créez un menu pour le gérer\.</g, ">{t('select_or_create_menu')}<");
content = content.replace(/>Gérer les liens : /g, ">{t('manage_links')} ");
content = content.replace(/'Enregistrement\.\.\.' : 'Enregistrer le menu'/g, "t('saving') : t('save_menu')");

content = content.replace(/>Ajouter un lien</g, ">{t('add_link')}<");
content = content.replace(/>Pages Système</g, ">{t('system_pages')}<");
content = content.replace(/>Vos Pages</g, ">{t('custom_pages')}<");
content = content.replace(/>Lien personnalisé</g, ">{t('custom_link')}<");
content = content.replace(/>Sélectionner une page</g, ">{t('select_page')}<");
content = content.replace(/>-- Choisir --</g, ">{t('choose')}<");
content = content.replace(/>Aucune page créée</g, ">{t('no_page_created')}<");
content = content.replace(/>URL \/ Lien</g, ">{t('url_link')}<");
content = content.replace(/placeholder="https:\/\/\.\.\. ou \/ma-page"/g, "placeholder={t('url_placeholder')}");
content = content.replace(/>Texte du lien \(modifiable\)</g, ">{t('link_text_editable')}<");
content = content.replace(/>Texte du lien</g, ">{t('link_text')}<");
content = content.replace(/placeholder="Ex: Mon Lien"/g, "placeholder={t('link_text_placeholder')}");
content = content.replace(/>Ajouter au menu</g, ">{t('add_to_menu')}<");

content = content.replace(/>Structure du menu</g, ">{t('menu_structure')}<");
content = content.replace(/>Ce menu est vide\. Ajoutez des liens depuis le panneau de gauche\.</g, ">{t('menu_empty_warning')}<");
content = content.replace(/>Note:<\/span> N'oubliez pas de cliquer sur "Enregistrer le menu" pour sauvegarder l'ordre et les liens de ce menu\./g, ">{t('note_save_menu')}");

fs.writeFileSync('src/components/admin/settings/MenuManager.tsx', content);
