const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
console.log('new-comment:', html.includes('from kannada_500_words_hindi.json'));
console.log('old-pure-comment:', html.includes('500 pure-Kannada conversation reels'));
console.log('kacherige:', html.includes('kacherige'), 'chalanachitra:', html.includes('chalanachitra'));
const key = 'const QUESTIONS=[';
const occ = html.split(key).length - 1;
console.log('QUESTIONS occurrences:', occ);
const start = html.indexOf(key);
let depth = 0, qq = null, end = -1;
for (let i = start; i < html.length; i++) {
  const c = html[i];
  if (qq) { if (c === '\\') { i++; continue; } if (c === qq) qq = null; continue; }
  if (c === '"' || c === "'" || c === '`') { qq = c; continue; }
  if (c === '[') depth++;
  else if (c === ']') { depth--; if (!depth) { end = i; break; } }
}
const seg = html.slice(start, end + 1);
console.log('objects:', (seg.match(/\{"t":/g) || []).length);
const body = seg.slice(key.length - 1); // keep the opening '['
console.log('body starts:', JSON.stringify(body.slice(0, 40)));
console.log('body ends:', JSON.stringify(body.slice(-40)));
console.log('around-err:', JSON.stringify(body.slice(113440, 113620)));
try {
  const arr = JSON.parse(body);
  console.log('parsed entries:', arr.length);
  console.log('first q:', arr[0].q, '| m:', arr[0].m);
  console.log('last q:', arr[499].q, '| m:', arr[499].m);
} catch (e) { console.log('PARSE FAIL:', e.message); }
