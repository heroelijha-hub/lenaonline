const fs = require('fs');
const path = require('path');

const locales = ['en', 'fr', 'es'];

const extras = {
  en: { add_widget: "Add Widget" },
  fr: { add_widget: "Ajouter un widget" },
  es: { add_widget: "Añadir widget" }
};

for (const locale of locales) {
  const filePath = path.join(__dirname, 'messages', `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.AdminLanding) {
      data.AdminLanding.add_widget = extras[locale].add_widget;
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${locale}.json with AdminLanding.add_widget`);
  }
}
