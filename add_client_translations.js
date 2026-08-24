const fs = require('fs');
const path = require('path');

const locales = ['en', 'fr', 'es'];

const translations = {
  en: {
    ChatWidget: {
      "we_reply_quickly": "We reply quickly",
      "welcome": "Welcome!",
      "please_enter_details": "Please enter your name and email address to start the conversation.",
      "your_name": "Your name",
      "your_email": "Your email",
      "start_chat": "Start chat",
      "connection_error": "Chat connection error. Please ensure the database is up to date.",
      "send_message_prompt": "Send us a message and we will reply as soon as possible!",
      "your_message": "Your message..."
    }
  },
  fr: {
    ChatWidget: {
      "we_reply_quickly": "Nous répondons rapidement",
      "welcome": "Bienvenue !",
      "please_enter_details": "Veuillez entrer votre nom et adresse e-mail pour commencer la conversation.",
      "your_name": "Votre nom",
      "your_email": "Votre e-mail",
      "start_chat": "Démarrer le chat",
      "connection_error": "Erreur de connexion au chat. Veuillez réessayer.",
      "send_message_prompt": "Envoyez-nous un message et nous vous répondrons dès que possible !",
      "your_message": "Votre message..."
    }
  },
  es: {
    ChatWidget: {
      "we_reply_quickly": "Respondemos rápidamente",
      "welcome": "¡Bienvenido!",
      "please_enter_details": "Por favor, introduce tu nombre y correo electrónico para iniciar la conversación.",
      "your_name": "Tu nombre",
      "your_email": "Tu correo electrónico",
      "start_chat": "Iniciar chat",
      "connection_error": "Error de conexión al chat. Por favor, inténtalo de nuevo.",
      "send_message_prompt": "¡Envíanos un mensaje y responderemos lo antes posible!",
      "your_message": "Tu mensaje..."
    }
  }
};

for (const locale of locales) {
  const filePath = path.join(__dirname, 'messages', `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.ChatWidget = translations[locale].ChatWidget;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${locale}.json with ChatWidget translations`);
  }
}
