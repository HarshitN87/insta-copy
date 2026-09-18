// Builds reels from kannada_500_words_hindi.json (user-supplied source of truth)
// and patches them into index.html QUESTIONS. Content is used verbatim:
// q = kannada_word, m = hindi_meaning,
// a = hindi_meaning + example Kannada sentence + Hindi sentence.
const fs = require('fs');
const path = require('path');

const DIR = __dirname + '/../..';
const SRC = path.join(DIR, 'kannada_500_words_hindi.json');
const INDEX = path.join(DIR, 'index.html');

const TOPIC_FOR_CATEGORY = {
  Verbs: 'vb', Work: 'vb',
  Family: 'nn', People: 'nn', Education: 'nn', Health: 'nn', Money: 'nn',
  Food: 'nn', Shopping: 'nn', House: 'nn', Objects: 'nn', Clothing: 'nn',
  Tech: 'nn', Nature: 'nn', Places: 'nn', Travel: 'nn', Weather: 'nn',
  Numbers: 'nn', Body: 'nn',
  Adjectives: 'aj', Colors: 'aj', Emotions: 'aj',
  Pronouns: 'pr', Question: 'pr',
  Time: 'av', Quantity: 'av', Directions: 'av',
  Connectors: 'fl',
  Basics: 'ex', Politeness: 'ex',
};

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const words = data.words;
if (!Array.isArray(words) || words.length !== 500) throw new Error('expected 500 words, got ' + (words && words.length));
const bad = words.filter(w => !w.kannada_word || !w.hindi_meaning || !w.kannada_sentence || !w.hindi_sentence || !w.category);
if (bad.length) throw new Error('incomplete entries: ' + bad.map(w => w.id).join(','));
const unmapped = [...new Set(words.map(w => w.category))].filter(c => !TOPIC_FOR_CATEGORY[c]);
if (unmapped.length) throw new Error('unmapped categories: ' + unmapped.join(','));

const entries = words.map(w => ({
  t: TOPIC_FOR_CATEGORY[w.category],
  q: String(w.kannada_word).trim(),
  m: String(w.hindi_meaning).trim(),
  a: String(w.hindi_meaning).trim() + '\n📝 ' + String(w.kannada_sentence).trim() + '\n💬 ' + String(w.hindi_sentence).trim(),
}));
const counts = {};
entries.forEach(e => counts[e.t] = (counts[e.t] || 0) + 1);
console.log('mapped 500 entries, per-topic:', JSON.stringify(counts));

function matchBracket(src, openIdx) {
  const open = src[openIdx], close = open === '{' ? '}' : ']';
  let depth = 0, q = null;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (!depth) return i; }
  }
  throw new Error('no match for bracket at ' + openIdx);
}

let html = fs.readFileSync(INDEX, 'utf8');
const qKey = 'const QUESTIONS=[';
const qi = html.indexOf(qKey);
if (qi < 0) throw new Error('QUESTIONS not found');
const qOpen = qi + qKey.length - 1;
const qClose = matchBracket(html, qOpen);
if (html[qClose + 1] !== ';') throw new Error('QUESTIONS not followed by ;');
const arr = entries.map(e => JSON.stringify({ t: e.t, q: e.q, m: e.m, a: e.a })).join(',');
html = html.slice(0, qi) + '/* ---- 500 Kannada-Hindi reels from kannada_500_words_hindi.json (ids 1-500, 30 categories -> vb/nn/aj/pr/av/fl/ex) ---- */\nconst QUESTIONS=[' + arr + '];' + html.slice(qClose + 2);
fs.writeFileSync(INDEX, html);
console.log('index.html written, new size:', html.length);
