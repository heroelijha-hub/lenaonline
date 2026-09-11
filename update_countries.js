const fs = require('fs');
const path = require('path');

// Simple map of some English names to ISO-3166-1 alpha-2 codes to use with Intl
// We only need this to translate the English keys into other languages
const enToCode = {
  "Afghanistan": "AF", "South Africa": "ZA", "Albania": "AL", "Algeria": "DZ", "Germany": "DE", 
  "Andorra": "AD", "Angola": "AO", "Antigua and Barbuda": "AG", "Saudi Arabia": "SA", "Argentina": "AR", 
  "Armenia": "AM", "Australia": "AU", "Austria": "AT", "Azerbaijan": "AZ", "Bahamas": "BS", 
  "Bahrain": "BH", "Bangladesh": "BD", "Barbados": "BB", "Belgium": "BE", "Belize": "BZ", 
  "Benin": "BJ", "Bhutan": "BT", "Belarus": "BY", "Myanmar": "MM", "Bolivia": "BO", 
  "Bosnia and Herzegovina": "BA", "Botswana": "BW", "Brazil": "BR", "Brunei": "BN", "Bulgaria": "BG", 
  "Burkina Faso": "BF", "Burundi": "BI", "Cambodia": "KH", "Cameroon": "CM", "Canada": "CA", 
  "Cape Verde": "CV", "Chile": "CL", "China": "CN", "Cyprus": "CY", "Colombia": "CO", 
  "Comoros": "KM", "Congo": "CG", "North Korea": "KP", "South Korea": "KR", "Costa Rica": "CR", 
  "Ivory Coast": "CI", "Croatia": "HR", "Cuba": "CU", "Denmark": "DK", "Djibouti": "DJ", 
  "Dominica": "DM", "Egypt": "EG", "United Arab Emirates": "AE", "Ecuador": "EC", "Eritrea": "ER", 
  "Spain": "ES", "Estonia": "EE", "Eswatini": "SZ", "United States": "US", "Ethiopia": "ET", 
  "Fiji": "FJ", "Finland": "FI", "France": "FR", "Gabon": "GA", "Gambia": "GM", 
  "Georgia": "GE", "Ghana": "GH", "Greece": "GR", "Grenada": "GD", "Guatemala": "GT", 
  "Guinea": "GN", "Equatorial Guinea": "GQ", "Guinea-Bissau": "GW", "Guyana": "GY", "Haiti": "HT", 
  "Honduras": "HN", "Hungary": "HU", "India": "IN", "Indonesia": "ID", "Iraq": "IQ", 
  "Iran": "IR", "Ireland": "IE", "Iceland": "IS", "Israel": "IL", "Italy": "IT", 
  "Jamaica": "JM", "Japan": "JP", "Jordan": "JO", "Kazakhstan": "KZ", "Kenya": "KE", 
  "Kyrgyzstan": "KG", "Kiribati": "KI", "Kuwait": "KW", "Laos": "LA", "Lesotho": "LS", 
  "Latvia": "LV", "Lebanon": "LB", "Liberia": "LR", "Libya": "LY", "Liechtenstein": "LI", 
  "Lithuania": "LT", "Luxembourg": "LU", "Madagascar": "MG", "Malaysia": "MY", "Malawi": "MW", 
  "Maldives": "MV", "Mali": "ML", "Malta": "MT", "Morocco": "MA", "Mauritius": "MU", 
  "Mauritania": "MR", "Mexico": "MX", "Micronesia": "FM", "Moldova": "MD", "Monaco": "MC", 
  "Mongolia": "MN", "Montenegro": "ME", "Mozambique": "MZ", "Namibia": "NA", "Nauru": "NR", 
  "Nepal": "NP", "Nicaragua": "NI", "Niger": "NE", "Nigeria": "NG", "Norway": "NO", 
  "New Zealand": "NZ", "Oman": "OM", "Uganda": "UG", "Uzbekistan": "UZ", "Pakistan": "PK", 
  "Palau": "PW", "Panama": "PA", "Papua New Guinea": "PG", "Paraguay": "PY", "Netherlands": "NL", 
  "Peru": "PE", "Philippines": "PH", "Poland": "PL", "Portugal": "PT", "Qatar": "QA", 
  "Central African Republic": "CF", "DR Congo": "CD", "Dominican Republic": "DO", "Czech Republic": "CZ", "Romania": "RO", 
  "United Kingdom": "GB", "Russia": "RU", "Rwanda": "RW", "Saint Kitts and Nevis": "KN", "Saint Vincent and the Grenadines": "VC", 
  "Saint Lucia": "LC", "San Marino": "SM", "El Salvador": "SV", "Samoa": "WS", "Sao Tome and Principe": "ST", 
  "Senegal": "SN", "Serbia": "RS", "Seychelles": "SC", "Sierra Leone": "SL", "Singapore": "SG", 
  "Slovakia": "SK", "Slovenia": "SI", "Somalia": "SO", "Sudan": "SD", "South Sudan": "SS", 
  "Sri Lanka": "LK", "Sweden": "SE", "Switzerland": "CH", "Suriname": "SR", "Syria": "SY", 
  "Tajikistan": "TJ", "Tanzania": "TZ", "Chad": "TD", "Czechia": "CZ", "Thailand": "TH", 
  "East Timor": "TL", "Togo": "TG", "Tonga": "TO", "Trinidad and Tobago": "TT", "Tunisia": "TN", 
  "Turkmenistan": "TM", "Turkey": "TR", "Tuvalu": "TV", "Ukraine": "UA", "Uruguay": "UY", 
  "Vanuatu": "VU", "Vatican": "VA", "Venezuela": "VE", "Vietnam": "VN", "Yemen": "YE", 
  "Zambia": "ZM", "Zimbabwe": "ZW"
};

const locales = ['fr', 'de', 'es'];

locales.forEach(locale => {
  const filePath = path.join(__dirname, 'messages', `${locale}.json`);
  let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (data.Countries) {
    let translator;
    try {
      translator = new Intl.DisplayNames([locale], { type: 'region' });
    } catch (e) {
      console.log('Intl not fully supported, skipping automated translation');
      return;
    }
    
    for (const enName in data.Countries) {
      const code = enToCode[enName];
      if (code) {
        // Only update if it's currently identical to the English name (meaning it's untranslated)
        if (data.Countries[enName] === enName) {
          try {
            data.Countries[enName] = translator.of(code);
          } catch (e) {}
        }
      }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log(`Updated countries in ${locale}.json`);
  }
});
