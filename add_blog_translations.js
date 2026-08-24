const fs = require('fs');
const path = require('path');

const locales = ['en', 'fr', 'es'];

const translations = {
  en: {
    "title": "Our Blog",
    "no_articles": "No articles found",
    "for": "for",
    "comments_count": "{count} Comments",
    "read_more": "Read More",
    "search_placeholder": "Search...",
    "search_btn": "Search",
    "recent_articles": "Recent Articles",
    "no_recent_articles": "No recent articles.",
    "recent_comments": "Recent Comments",
    "no_comments": "No comments to display.",
    "on": "on",
    "article_not_found": "Article not found",
    "by": "By",
    "share": "Share:",
    "next_article": "Next Article \u2192",
    "related_post": "Related Post",
    "write_review": "Write a review",
    "review_desc": "Your email address will not be published. Required fields are marked with *",
    "comment_placeholder": "Comment *",
    "name_placeholder": "Name *",
    "email_placeholder": "Email *",
    "submit_comment": "Leave a comment",
    "submitting": "Submitting...",
    "comment_success": "Your comment was submitted successfully!",
    "comment_error": "Error submitting your comment."
  },
  fr: {
    "title": "Notre Blog",
    "no_articles": "Aucun article trouvé",
    "for": "pour",
    "comments_count": "{count} Commentaires",
    "read_more": "Lire la suite",
    "search_placeholder": "Rechercher...",
    "search_btn": "Rechercher",
    "recent_articles": "Articles récents",
    "no_recent_articles": "Aucun article récent.",
    "recent_comments": "Commentaires récents",
    "no_comments": "Aucun commentaire à afficher.",
    "on": "sur",
    "article_not_found": "Article introuvable",
    "by": "Par",
    "share": "Partager:",
    "next_article": "Article Suivant \u2192",
    "related_post": "Article Similaire",
    "write_review": "Laisser un commentaire",
    "review_desc": "Votre adresse e-mail ne sera pas publiée. Les champs obligatoires sont indiqués avec *",
    "comment_placeholder": "Commentaire *",
    "name_placeholder": "Nom *",
    "email_placeholder": "Email *",
    "submit_comment": "Laisser un commentaire",
    "submitting": "Envoi...",
    "comment_success": "Votre commentaire a été envoyé avec succès !",
    "comment_error": "Erreur lors de l'envoi du commentaire."
  },
  es: {
    "title": "Nuestro Blog",
    "no_articles": "No se encontraron artículos",
    "for": "para",
    "comments_count": "{count} Comentarios",
    "read_more": "Leer más",
    "search_placeholder": "Buscar...",
    "search_btn": "Buscar",
    "recent_articles": "Artículos recientes",
    "no_recent_articles": "No hay artículos recientes.",
    "recent_comments": "Comentarios recientes",
    "no_comments": "No hay comentarios para mostrar.",
    "on": "en",
    "article_not_found": "Artículo no encontrado",
    "by": "Por",
    "share": "Compartir:",
    "next_article": "Siguiente artículo \u2192",
    "related_post": "Artículo relacionado",
    "write_review": "Escribir un comentario",
    "review_desc": "Su dirección de correo electrónico no será publicada. Los campos obligatorios están marcados con *",
    "comment_placeholder": "Comentario *",
    "name_placeholder": "Nombre *",
    "email_placeholder": "Correo electrónico *",
    "submit_comment": "Dejar un comentario",
    "submitting": "Enviando...",
    "comment_success": "¡Su comentario fue enviado con éxito!",
    "comment_error": "Error al enviar el comentario."
  }
};

for (const locale of locales) {
  const filePath = path.join(__dirname, 'messages', `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.Blog = translations[locale];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${locale}.json`);
  }
}
