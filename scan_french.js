const fs = require('fs');
const path = require('path');

const extensions = ['.ts', '.tsx'];

function scanDir(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...scanDir(fullPath));
    } else if (extensions.includes(path.extname(item.name))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      const frLines = [];
      lines.forEach((line, i) => {
        // Look for accented characters (French specific)
        if (/[\u00C0-\u00FF]/.test(line)) {
          frLines.push({ line: i + 1, content: line.trim().slice(0, 120) });
        }
      });
      if (frLines.length > 0) {
        results.push({
          file: fullPath,
          count: frLines.length,
          lines: frLines
        });
      }
    }
  }
  return results;
}

const result = scanDir('src');
result.sort((a, b) => b.count - a.count);

let output = '';
for (const r of result) {
  output += `\n=== ${r.file} (${r.count} lines) ===\n`;
  for (const l of r.lines.slice(0, 10)) {
    output += `  L${l.line}: ${l.content}\n`;
  }
  if (r.lines.length > 10) output += `  ... and ${r.lines.length - 10} more\n`;
}

fs.writeFileSync('audit_french.txt', output);
console.log('Done! Files with French text:', result.length);
console.log('Total occurrences:', result.reduce((a, r) => a + r.count, 0));
console.log('Output written to audit_french.txt');
