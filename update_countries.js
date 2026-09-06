const fs = require('fs');
const path = require('path');

const COUNTRIES = [
  "Afghanistan", "South Africa", "Albania", "Algeria", "Germany", "Andorra", "Angola", "Antigua and Barbuda",
  "Saudi Arabia", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh",
  "Barbados", "Belgium", "Belize", "Benin", "Bhutan", "Belarus", "Myanmar", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
  "Chile", "China", "Cyprus", "Colombia", "Comoros", "Congo", "North Korea", "South Korea", "Costa Rica", "Ivory Coast",
  "Croatia", "Cuba", "Denmark", "Djibouti", "Dominica", "Egypt", "United Arab Emirates", "Ecuador", "Eritrea", "Spain",
  "Estonia", "Eswatini", "United States", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Equatorial Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "India", "Indonesia", "Iraq", "Iran", "Ireland", "Iceland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kyrgyzstan", "Kiribati", "Kuwait", "Laos", "Lesotho", "Latvia", "Lebanon", "Liberia", "Libya",
  "Liechtenstein", "Lithuania", "Luxembourg", "North Macedonia", "Madagascar", "Malaysia", "Malawi", "Maldives", "Mali",
  "Malta", "Morocco", "Mauritius", "Mauritania", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Mozambique", "Namibia", "Nauru", "Nepal", "Nicaragua", "Niger", "Nigeria", "Niue", "Norway", "New Zealand",
  "Oman", "Uganda", "Uzbekistan", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Netherlands",
  "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Central African Republic", "Democratic Republic of the Congo",
  "Dominican Republic", "Romania", "United Kingdom", "Russia", "Rwanda", "Saint Kitts and Nevis", "San Marino",
  "Saint Vincent and the Grenadines", "Saint Lucia", "Solomon Islands", "El Salvador", "Samoa", "Sao Tome and Principe", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Somalia", "Sudan", "South Sudan",
  "Sri Lanka", "Sweden", "Switzerland", "Suriname", "Syria", "Tajikistan", "Tanzania", "Chad", "Czech Republic", "Thailand",
  "East Timor", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkmenistan", "Turkey", "Tuvalu", "Ukraine",
  "Uruguay", "Vanuatu", "Vatican", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Map of common countries to their translations
const translations = {
  "Germany": { fr: "Allemagne", de: "Deutschland", es: "Alemania" },
  "France": { fr: "France", de: "Frankreich", es: "Francia" },
  "Austria": { fr: "Autriche", de: "Österreich", es: "Austria" },
  "Switzerland": { fr: "Suisse", de: "Schweiz", es: "Suiza" },
  "Belgium": { fr: "Belgique", de: "Belgien", es: "Bélgica" },
  "Netherlands": { fr: "Pays-Bas", de: "Niederlande", es: "Países Bajos" },
  "Italy": { fr: "Italie", de: "Italien", es: "Italia" },
  "Spain": { fr: "Espagne", de: "Spanien", es: "España" },
  "Luxembourg": { fr: "Luxembourg", de: "Luxemburg", es: "Luxemburgo" },
  "United Kingdom": { fr: "Royaume-Uni", de: "Vereinigtes Königreich", es: "Reino Unido" },
  "United States": { fr: "États-Unis", de: "Vereinigte Staaten", es: "Estados Unidos" },
  "Poland": { fr: "Pologne", de: "Polen", es: "Polonia" },
  "Czech Republic": { fr: "République tchèque", de: "Tschechien", es: "República Checa" },
  "Denmark": { fr: "Danemark", de: "Dänemark", es: "Dinamarca" },
  "Sweden": { fr: "Suède", de: "Schweden", es: "Suecia" },
  "Norway": { fr: "Norvège", de: "Norwegen", es: "Noruega" },
  "Finland": { fr: "Finlande", de: "Finnland", es: "Finlandia" },
  "Ireland": { fr: "Irlande", de: "Irland", es: "Irlanda" },
  "Portugal": { fr: "Portugal", de: "Portugal", es: "Portugal" },
  "Greece": { fr: "Grèce", de: "Griechenland", es: "Grecia" }
};

const locales = ['en', 'fr', 'de', 'es'];
const messagesDir = path.join(__dirname, 'messages');

locales.forEach(locale => {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const messages = JSON.parse(fileContent);

    if (!messages.Countries) {
      messages.Countries = {};
    }

    COUNTRIES.forEach(country => {
      if (locale === 'en') {
        messages.Countries[country] = country;
      } else {
        if (translations[country] && translations[country][locale]) {
          messages.Countries[country] = translations[country][locale];
        } else {
          // Fallback to English name if not translated
          messages.Countries[country] = country;
        }
      }
    });

    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');
    console.log(`Updated Countries in ${locale}.json`);
  }
});
