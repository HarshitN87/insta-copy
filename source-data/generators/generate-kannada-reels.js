// DEPRECATED: the app now uses 500 pure-Kannada reels built by build-500-pure.js
// from source-data/kannada-500-pure-conversation.md. Kept for history only.
// (Original: generated 800 Kannada movie-vocabulary reels from kannada-800-movie-vocabulary.md
// and patched them into index.html (QUESTIONS + TOPICS + PERSONA + questionToReel).)
const fs = require('fs');
const path = require('path');

const DIR = __dirname + '/../..';
const VOCAB = 'C:/Users/negih/kannada-800-movie-vocabulary.md';
const INDEX = path.join(DIR, 'index.html');

function topicFor(n) {
  if (n <= 65) return 'vb';
  if (n <= 365) return 'nn';
  if (n <= 505) return 'aj';
  if (n <= 555) return 'pr';
  if (n <= 625) return 'av';
  if (n <= 690) return 'fl';
  return 'ex';
}

const lines = fs.readFileSync(VOCAB, 'utf8').split('\n');
const entries = [];
const bad = [];
for (const ln of lines) {
  const m = ln.match(/^(\d+)\.\s+(?:⭐\s*)?\*\*(.+?)\*\*\s*$/);
  if (!m) continue;
  const num = +m[1];
  const star = ln.includes('⭐');
  const parts = m[2].split(' | ');
  if (parts.length !== 4) { bad.push(num); continue; }
  let [word, meaning, ex, tr] = parts.map(s => s.trim());
  word = word.replace(/⭐/g, '').trim();
  entries.push({ num, t: topicFor(num), q: (star ? '★ ' : '') + word, m: meaning,
    a: meaning + '\n📝 ' + ex + '\n💬 ' + tr });
}
entries.sort((a, b) => a.num - b.num);
if (entries.length !== 800) throw new Error('parsed ' + entries.length + ', bad: ' + bad.join(','));
const missing = entries.map(e => e.num).filter((n, i) => n !== i + 1);
if (missing.length) throw new Error('missing nums: ' + missing.join(','));
console.log('parsed 800 entries OK');

// string-aware matcher: from openIdx (index of '{' or '[') find matching close
function matchBracket(src, openIdx) {
  const open = src[openIdx], close = open === '{' ? '}' : ']';
  let depth = 0, q = null;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '\\') { i++; continue; }
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (!depth) return i; }
  }
  throw new Error('no match for bracket at ' + openIdx);
}

let html = fs.readFileSync(INDEX, 'utf8');

// 1. Replace QUESTIONS array
const qKey = 'const QUESTIONS=[';
let qi = html.indexOf(qKey);
if (qi < 0) throw new Error('QUESTIONS not found');
const qOpen = qi + qKey.length - 1;
const qClose = matchBracket(html, qOpen);
if (html[qClose + 1] !== ';') throw new Error('QUESTIONS not followed by ;');
const arr = entries.map(e => JSON.stringify({ t: e.t, q: e.q, m: e.m, a: e.a })).join(',');
html = html.slice(0, qi) + '/* ---- 800 Kannada movie-vocabulary reels (1-65 verb roots+suffixes, 66-365 nouns, 366-505 adjectives, 506-555 pronouns, 556-625 adverbs, 626-690 fillers, 691-800 phrases) ---- */\nconst QUESTIONS=[' + arr + '];' + html.slice(qClose + 2);
console.log('QUESTIONS replaced');

// 2. Replace TOPICS object
const tKey = 'const TOPICS={';
let ti = html.indexOf(tKey);
if (ti < 0) throw new Error('TOPICS not found');
const tOpen = ti + tKey.length - 1;
const tClose = matchBracket(html, tOpen);
const NEW_TOPICS = "const TOPICS={\n" +
" vb:{label:'Kannada Verbs',e:'\\uD83D\\uDDE3\\uFE0F',h:['#ee2a7b','#6228d7'],persona:'kannada.verbs',tag:'#kannada #verbs #spokenkannada'},\n" +
" nn:{label:'Kannada Nouns',e:'\\uD83C\\uDFE0',h:['#0095F6','#6228d7'],persona:'kannada.nouns',tag:'#kannada #nouns #kannadamovies'},\n" +
" aj:{label:'Kannada Adjectives',e:'\\u2728',h:['#f9ce34','#ee2a7b'],persona:'kannada.adjectives',tag:'#kannada #adjectives #learnkannada'},\n" +
" pr:{label:'Kannada Pronouns',e:'\\uD83D\\uDC48',h:['#22c55e','#0b3d2e'],persona:'kannada.pronouns',tag:'#kannada #pronouns #learnkannada'},\n" +
" av:{label:'Kannada Adverbs',e:'\\u23F0',h:['#00e5ff','#0095F6'],persona:'kannada.adverbs',tag:'#kannada #adverbs #spokenkannada'},\n" +
" fl:{label:'Kannada Fillers',e:'\\uD83D\\uDCAC',h:['#7b2ff7','#ee2a7b'],persona:'kannada.fillers',tag:'#kannada #fillers #kannadamovies'},\n" +
" ex:{label:'Kannada Phrases',e:'\\uD83D\\uDD25',h:['#f9ce34','#ee2a7b'],persona:'kannada.phrases',tag:'#kannada #phrases #kannadamovies'}};";
html = html.slice(0, ti) + NEW_TOPICS + html.slice(tClose + 2);
console.log('TOPICS replaced');

// 3. Add Kannada personas (idempotent: skip if already present)
if (html.includes("'kannada.verbs':")) { console.log('PERSONA already extended, skipping'); }
else {
const anchor = "img:'portraits/sd.jpg'}};";
if (!html.includes(anchor)) throw new Error('PERSONA anchor not found');
const NEW_PERSONAS =
"img:'portraits/sd.jpg'},\n" +
" 'kannada.verbs':{u:'kannada.verbs',n:'Kannada Verbs',e:'\\uD83D\\uDDE3\\uFE0F',v:1,h:'#ee2a7b,#6228d7',img:'portraits/chai.jpg'},\n" +
" 'kannada.nouns':{u:'kannada.nouns',n:'Kannada Nouns',e:'\\uD83C\\uDFE0',v:1,h:'#0095F6,#6228d7',img:'portraits/meera.jpg'},\n" +
" 'kannada.adjectives':{u:'kannada.adjectives',n:'Kannada Adjectives',e:'\\u2728',v:0,h:'#f9ce34,#ee2a7b',img:'portraits/zoya.jpg'},\n" +
" 'kannada.pronouns':{u:'kannada.pronouns',n:'Kannada Pronouns',e:'\\uD83D\\uDC48',v:0,h:'#22c55e,#0b3d2e',img:'portraits/kabir.jpg'},\n" +
" 'kannada.adverbs':{u:'kannada.adverbs',n:'Kannada Adverbs',e:'\\u23F0',v:0,h:'#00e5ff,#0095F6',img:'portraits/ira.jpg'},\n" +
" 'kannada.fillers':{u:'kannada.fillers',n:'Kannada Fillers',e:'\\uD83D\\uDCAC',v:0,h:'#7b2ff7,#ee2a7b',img:'portraits/noor.jpg'},\n" +
" 'kannada.phrases':{u:'kannada.phrases',n:'Kannada Phrases',e:'\\uD83D\\uDD25',v:1,h:'#f9ce34,#ee2a7b',img:'portraits/aarav.jpg'}};";
html = html.replace(anchor, NEW_PERSONAS);
console.log('PERSONA extended');
}

// 4. Replace questionToReel (idempotent: skip if already new)
if (html.includes('TOPICS[qo.t]||TOPICS.vb')) { console.log('questionToReel already new, skipping'); }
else {
const fKey = 'function questionToReel(qo,i){';
let fi = html.indexOf(fKey);
if (fi < 0) throw new Error('questionToReel not found');
const fOpen = fi + fKey.length - 1;
const fClose = matchBracket(html, fOpen);
const NEW_FN = "function questionToReel(qo,i){\n" +
" const t=TOPICS[qo.t]||TOPICS.vb;\n" +
" const lc=9000+((i*7919)%380000), cm=120+((i*1049)%9000);\n" +
" return {u:t.persona,n:t.label,e:t.e,v:i%9===0,cap:'Kannada #'+(i+1)+': '+qo.q+' = '+qo.m+' '+t.tag,audio:'original audio - '+t.persona,\n" +
"  likes:fmtN(lc),lc,cm,vw:fmtN(lc*7+3000),emoji:t.e,sc:scene(t.h[0],t.h[1]),tag:t.label.toLowerCase(),\n" +
"  q:qo.q,a:qo.a,topic:t.label,num:i+1};\n" +
"}";
html = html.slice(0, fi) + NEW_FN + html.slice(fClose + 1);
console.log('questionToReel replaced');
}

// 5. Fix stale comment about aesthetic fallback (no longer the source)
html = html.replace('/* ---- aesthetic fallback reels (used until questions land) ---- */',
  '/* ---- aesthetic fallback reels (used only if QUESTIONS drops below 100) ---- */');

fs.writeFileSync(INDEX, html);
console.log('index.html written, new size:', html.length);
