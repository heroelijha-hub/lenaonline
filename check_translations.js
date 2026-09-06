const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');
const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));

const translations = {};

// Helper to flatten object
function flattenObj(obj, prefix = '') {
  let result = {};
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObj(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

files.forEach(file => {
  const content = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8'));
  translations[file] = flattenObj(content);
});

const allKeys = new Set();
for (const file in translations) {
  for (const key in translations[file]) {
    allKeys.add(key);
  }
}

const missing = {};
files.forEach(file => {
  missing[file] = [];
  for (const key of allKeys) {
    if (!(key in translations[file])) {
      missing[file].push(key);
    }
  }
});

console.log('--- Missing Translation Keys ---');
let totalMissing = 0;
for (const file in missing) {
  if (missing[file].length > 0) {
    console.log(`\n[${file}] is missing ${missing[file].length} keys:`);
    console.log(missing[file].slice(0, 20).join('\n'));
    if (missing[file].length > 20) {
      console.log(`...and ${missing[file].length - 20} more`);
    }
    totalMissing += missing[file].length;
  } else {
    console.log(`\n[${file}] is fully translated! (0 missing)`);
  }
}

if (totalMissing === 0) {
  console.log('\nAll good! No missing translations found across all files.');
}
