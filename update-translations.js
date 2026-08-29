const fs = require('fs');
const path = require('path');

const locales = ['fr', 'en', 'es'];

const newTranslations = {
  fr: {
    AdminTrash: {
      "title": "Corbeille",
      "empty_trash": "Vider la corbeille",
      "empty_trash_confirm": "Voulez-vous vraiment VIDER TOUTE LA CORBEILLE ? Cette action est irréversible.",
      "empty_trash_success": "Corbeille vidée avec succès.",
      "tab_products": "Produits",
      "tab_media": "Médias",
      "no_products": "Aucun produit dans la corbeille.",
      "no_media": "Aucun média dans la corbeille.",
      "product": "Produit",
      "deleted_at": "Supprimé le",
      "actions": "Actions",
      "restore": "Restaurer",
      "restore_product_success": "Produit restauré avec succès.",
      "restore_media_success": "Média restauré avec succès.",
      "delete_permanently": "Supprimer définitivement",
      "delete": "Supprimer",
      "delete_product_confirm": "Voulez-vous vraiment supprimer ce produit DÉFINITIVEMENT ? Cette action est irréversible.",
      "delete_media_confirm": "Voulez-vous vraiment supprimer ce média DÉFINITIVEMENT ? Cette action est irréversible.",
      "na": "N/A"
    },
    AdminLayout: { trash: "Corbeille" }
  },
  en: {
    AdminTrash: {
      "title": "Trash",
      "empty_trash": "Empty trash",
      "empty_trash_confirm": "Do you really want to EMPTY THE TRASH? This action is irreversible.",
      "empty_trash_success": "Trash emptied successfully.",
      "tab_products": "Products",
      "tab_media": "Media",
      "no_products": "No products in the trash.",
      "no_media": "No media in the trash.",
      "product": "Product",
      "deleted_at": "Deleted at",
      "actions": "Actions",
      "restore": "Restore",
      "restore_product_success": "Product restored successfully.",
      "restore_media_success": "Media restored successfully.",
      "delete_permanently": "Delete permanently",
      "delete": "Delete",
      "delete_product_confirm": "Do you really want to PERMANENTLY delete this product? This action is irreversible.",
      "delete_media_confirm": "Do you really want to PERMANENTLY delete this media? This action is irreversible.",
      "na": "N/A"
    },
    AdminLayout: { trash: "Trash" }
  },
  es: {
    AdminTrash: {
      "title": "Papelera",
      "empty_trash": "Vaciar papelera",
      "empty_trash_confirm": "¿Realmente quieres VACIAR LA PAPELERA? Esta acción es irreversible.",
      "empty_trash_success": "Papelera vaciada con éxito.",
      "tab_products": "Productos",
      "tab_media": "Medios",
      "no_products": "No hay productos en la papelera.",
      "no_media": "No hay medios en la papelera.",
      "product": "Producto",
      "deleted_at": "Eliminado el",
      "actions": "Acciones",
      "restore": "Restaurar",
      "restore_product_success": "Producto restaurado con éxito.",
      "restore_media_success": "Medio restaurado con éxito.",
      "delete_permanently": "Eliminar definitivamente",
      "delete": "Eliminar",
      "delete_product_confirm": "¿Realmente quieres eliminar este producto DEFINITIVAMENTE? Esta acción es irreversible.",
      "delete_media_confirm": "¿Realmente quieres eliminar este medio DEFINITIVAMENTE? Esta acción es irreversible.",
      "na": "N/A"
    },
    AdminLayout: { trash: "Papelera" }
  }
};

locales.forEach(loc => {
  const file = path.join(__dirname, 'messages', `${loc}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  if (!data.AdminTrash) {
    data.AdminTrash = newTranslations[loc].AdminTrash;
  }
  
  if (data.AdminLayout && !data.AdminLayout.trash) {
    data.AdminLayout.trash = newTranslations[loc].AdminLayout.trash;
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
});
console.log('Translations updated!');
