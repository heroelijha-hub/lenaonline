const fs = require('fs');
const frPath = 'messages/fr.json';
const enPath = 'messages/en.json';
const esPath = 'messages/es.json';

function updateJson(path, newAdminMedia, newAdminLayout, newAdminProducts) {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  
  if (!data.AdminMedia) data.AdminMedia = newAdminMedia;
  else Object.assign(data.AdminMedia, newAdminMedia);
  
  if (data.AdminLayout) Object.assign(data.AdminLayout, newAdminLayout);
  
  if (data.AdminProducts) Object.assign(data.AdminProducts, newAdminProducts);

  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

updateJson(frPath, 
  {
    "title": "Bibliothèque de médias",
    "add_media": "Ajouter un média",
    "uploading": "Upload en cours...",
    "search": "Rechercher (Titre, Texte alternatif)...",
    "loading": "Chargement...",
    "no_media": "Aucun média trouvé.",
    "details": "Détails du média",
    "file_url": "URL du fichier",
    "copy": "Copier",
    "copied": "Copié!",
    "media_title": "Titre",
    "alt_text": "Texte alternatif (SEO & Accessibilité)",
    "legend": "Légende",
    "description": "Description",
    "link": "Lien personnalisé",
    "delete": "Supprimer",
    "update": "Mettre à jour",
    "delete_confirm": "Voulez-vous vraiment supprimer ce média ?",
    "update_success": "Média mis à jour avec succès",
    "upload_error": "Erreur lors de l'upload",
    "previous": "Précédent",
    "next": "Suivant",
    "page": "Page {page}",
    "select_media": "Sélectionner un Média",
    "select": "Sélectionner",
    "close": "Fermer"
  },
  { "media": "Médias" },
  { "browse_library": "Parcourir la Bibliothèque" }
);

updateJson(enPath, 
  {
    "title": "Media Library",
    "add_media": "Add Media",
    "uploading": "Uploading...",
    "search": "Search (Title, Alt text)...",
    "loading": "Loading...",
    "no_media": "No media found.",
    "details": "Media Details",
    "file_url": "File URL",
    "copy": "Copy",
    "copied": "Copied!",
    "media_title": "Title",
    "alt_text": "Alt text (SEO & Accessibility)",
    "legend": "Caption",
    "description": "Description",
    "link": "Custom Link",
    "delete": "Delete",
    "update": "Update",
    "delete_confirm": "Are you sure you want to delete this media?",
    "update_success": "Media updated successfully",
    "upload_error": "Upload error",
    "previous": "Previous",
    "next": "Next",
    "page": "Page {page}",
    "select_media": "Select Media",
    "select": "Select",
    "close": "Close"
  },
  { "media": "Media" },
  { "browse_library": "Browse Library" }
);

updateJson(esPath, 
  {
    "title": "Biblioteca de Medios",
    "add_media": "Añadir Medio",
    "uploading": "Subiendo...",
    "search": "Buscar (Título, Texto alternativo)...",
    "loading": "Cargando...",
    "no_media": "No se encontraron medios.",
    "details": "Detalles del Medio",
    "file_url": "URL del Archivo",
    "copy": "Copiar",
    "copied": "¡Copiado!",
    "media_title": "Título",
    "alt_text": "Texto alternativo (SEO y Accesibilidad)",
    "legend": "Leyenda",
    "description": "Descripción",
    "link": "Enlace Personalizado",
    "delete": "Eliminar",
    "update": "Actualizar",
    "delete_confirm": "¿Estás seguro de que deseas eliminar este medio?",
    "update_success": "Medio actualizado con éxito",
    "upload_error": "Error de subida",
    "previous": "Anterior",
    "next": "Siguiente",
    "page": "Página {page}",
    "select_media": "Seleccionar Medio",
    "select": "Seleccionar",
    "close": "Cerrar"
  },
  { "media": "Medios" },
  { "browse_library": "Explorar Biblioteca" }
);
console.log('Translations updated.');
