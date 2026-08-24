const fs = require('fs');
const path = require('path');

const locales = ['en', 'fr', 'es'];

const translations = {
  en: {
    AdminReviews: {
      title: "Customer Reviews",
      confirm_delete: "Are you sure you want to delete this review?",
      col_product: "Product",
      col_customer: "Customer",
      col_rating_comment: "Rating & Comment",
      col_date: "Date",
      col_status: "Status",
      col_actions: "Actions",
      approved: "Approved",
      pending: "Pending",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      no_reviews: "No reviews yet."
    }
  },
  fr: {
    AdminReviews: {
      title: "Avis Clients",
      confirm_delete: "Voulez-vous vraiment supprimer cet avis ?",
      col_product: "Produit",
      col_customer: "Client",
      col_rating_comment: "Note & Commentaire",
      col_date: "Date",
      col_status: "Statut",
      col_actions: "Actions",
      approved: "Approuvé",
      pending: "En attente",
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier",
      delete: "Supprimer",
      no_reviews: "Aucun avis pour le moment."
    }
  },
  es: {
    AdminReviews: {
      title: "Reseñas de Clientes",
      confirm_delete: "¿Estás seguro de que deseas eliminar esta reseña?",
      col_product: "Producto",
      col_customer: "Cliente",
      col_rating_comment: "Calificación y Comentario",
      col_date: "Fecha",
      col_status: "Estado",
      col_actions: "Acciones",
      approved: "Aprobado",
      pending: "Pendiente",
      save: "Guardar",
      cancel: "Cancelar",
      edit: "Editar",
      delete: "Eliminar",
      no_reviews: "Aún no hay reseñas."
    }
  }
};

for (const locale of locales) {
  const filePath = path.join(__dirname, 'messages', `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.AdminReviews = translations[locale].AdminReviews;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${locale}.json with AdminReviews translations`);
  }
}
