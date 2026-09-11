const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync(path.join(__dirname, 'messages/en.json'), 'utf-8'));
const fr = JSON.parse(fs.readFileSync(path.join(__dirname, 'messages/fr.json'), 'utf-8'));

let count = 0;
const identicalKeys = [];

function checkTranslations(objEn, objFr, prefix = '') {
  for (const key in objEn) {
    if (typeof objEn[key] === 'object' && objEn[key] !== null) {
      if (objFr[key]) {
        checkTranslations(objEn[key], objFr[key], prefix + key + '.');
      }
    } else {
      if (objEn[key] === objFr[key] && isNaN(Number(objEn[key]))) {
        // Exclude simple things like brands or acronyms if needed
        // but for now let's just collect all strings that are exactly the same
        identicalKeys.push(prefix + key + ' => ' + objEn[key]);
        count++;
      }
    }
  }
}

checkTranslations(en, fr);
console.log(`Found ${count} identical translations.`);
console.log(identicalKeys.slice(0, 50).join('\n'));
