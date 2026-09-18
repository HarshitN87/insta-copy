const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
console.log('new comment present:', html.includes('500 pure-Kannada conversation reels'));
console.log('old 800 comment present:', html.includes('800 Kannada movie-vocabulary reels'));
const start = html.indexOf('const QUESTIONS=[');
let depth = 0, q = null, end = -1;
for (let i = start; i < html.length; i++) {
  const c = html[i];
  if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
  if (c === '"' || c === "'" || c === '`') { q = c; continue; }
  if (c === '[') depth++;
  else if (c === ']') { depth--; if (!depth) { end = i; break; } }
}
const seg = html.slice(start, end);
console.log('question objects:', (seg.match(/\{"t":/g) || []).length);
const counts = {};
for (const m of seg.matchAll(/"t":"([a-z]+)"/g)) counts[m[1]] = (counts[m[1]] || 0) + 1;
console.log('per-topic:', JSON.stringify(counts));
// residual standalone saar check
const md = fs.readFileSync('source-data/kannada-500-pure-conversation.md', 'utf8');
const exLines = md.split('\n').filter(l => /^\d+\. \*\*/.test(l));
let saarHits = [];
exLines.forEach((l, i) => {
  const parts = l.split(' | ');
  const ex = parts[2] || '';
  if (/(^|\s)saar([,\s.!?]|$)/i.test(ex)) saarHits.push((i + 1) + ': ' + ex.slice(0, 80));
});
console.log('standalone saar in examples:', saarHits.length, saarHits.slice(0, 5));
// avg example length
let total = 0;
exLines.forEach(l => { total += (l.split(' | ')[2] || '').split(/\s+/).length; });
console.log('entries:', exLines.length, 'avg kannada words:', (total / exLines.length).toFixed(1));
// sample 3
exLines.slice(0, 3).forEach(l => console.log(l.slice(0, 280)));
