// Builds 500 pure-Kannada long-sentence reels from kannada-800-movie-vocabulary.md
// and patches them into index.html (QUESTIONS + comment). No English loanwords in
// Kannada example sentences; examples are long conversational sentences (10+ words).
const fs = require('fs');
const path = require('path');

const DIR = __dirname + '/../..';
const VOCAB = 'C:/Users/negih/kannada-800-movie-vocabulary.md';
const INDEX = path.join(DIR, 'index.html');
const OUT_MD = path.join(DIR, 'source-data', 'kannada-500-pure-conversation.md');

function topicFor(n) {
  // new 500 numbering: 1-65 vb, 66-225 nn, 226-300 aj, 301-335 pr, 336-380 av, 381-425 fl, 426-500 ex
  if (n <= 65) return 'vb';
  if (n <= 225) return 'nn';
  if (n <= 300) return 'aj';
  if (n <= 335) return 'pr';
  if (n <= 380) return 'av';
  if (n <= 425) return 'fl';
  return 'ex';
}

// ---- parse original 800 ----
const lines = fs.readFileSync(VOCAB, 'utf8').split('\n');
const orig = [];
for (const ln of lines) {
  const m = ln.match(/^(\d+)\.\s+(?:⭐\s*)?\*\*(.+?)\*\*$/);
  if (!m) continue;
  const num = +m[1];
  const parts = m[2].split(' | ');
  if (parts.length !== 4) continue;
  let [word, meaning, ex, tr] = parts.map(s => s.trim());
  word = word.replace(/⭐/g, '').trim();
  orig.push({ num, word, meaning, ex, tr });
}
if (orig.length !== 800) throw new Error('parsed ' + orig.length);
const byNum = {};
orig.forEach(e => byNum[e.num] = e);

// ---- loan-headword drops (entries whose headword IS an English loan) ----
// 13 (bar=come), 55/56/57 (shuru/wait/phone verbs) are KEPT and rewritten pure below.
const DROP_HEADS = new Set([81,89,90,91,92,103,104,127,130,133,136,144,145,156,157,159,160,162,165,166,167,168,169,170,171,174,175,176,177,182,183,184,185,187,189,190,193,194,199,200,202,203,204,205,208,213,217,218,219,220,221,224,225,226,251,252,253,254,278,279,282,284,285,287,290,291,292,293,296,297,308,309,310,311,312,314,320,321,326,327,328,332,349,351,353,354,355,356,357,358,381,432,434,435,436,437,439,440,441,442,452,453,454,455,456,457,458,468,470,471,472,473,475,480,483,490,494,495,496,504,505,714,732,733,739,742,743,744,746,747,752,762,764,765,766,776,778,785,787,789,790,798,800]);
// extra drops: rude entries + code-mix fillers/phrases
const EXTRA_DROPS = new Set([
  646,647,648,649,650, // rude hey-lo fillers
  689,701,723,740, // hlo / correct-u / thanks-mix / life-u
  718,719,783,784,786,788, // rude phrases
]);

// ---- selection: all verbs + evenly-spread most-frequent rest (theme diversity) ----
function cat800(n) {
  if (n <= 65) return 'vb';
  if (n <= 365) return 'nn';
  if (n <= 505) return 'aj';
  if (n <= 555) return 'pr';
  if (n <= 625) return 'av';
  if (n <= 690) return 'fl';
  return 'ex';
}
const QUOTA = { vb: 65, nn: 160, aj: 75, pr: 35, av: 45, fl: 45, ex: 75 };
const CAND = { vb: [], nn: [], aj: [], pr: [], av: [], fl: [], ex: [] };
for (let n = 1; n <= 800; n++) {
  if (DROP_HEADS.has(n) || EXTRA_DROPS.has(n)) continue;
  CAND[cat800(n)].push(n);
}
function spreadPick(cands, q) {
  if (cands.length <= q) return cands.slice();
  const out = [];
  for (let i = 0; i < q; i++) out.push(cands[Math.floor(i * cands.length / q)]);
  return [...new Set(out)];
}
const KEEP = {};
for (const c of Object.keys(QUOTA)) {
  KEEP[c] = spreadPick(CAND[c], QUOTA[c]);
  if (KEEP[c].length !== QUOTA[c]) throw new Error(c + ': cands ' + CAND[c].length + ' kept ' + KEEP[c].length + ' want ' + QUOTA[c]);
}
const selected800 = [...KEEP.vb, ...KEEP.nn, ...KEEP.aj, ...KEEP.pr, ...KEEP.av, ...KEEP.fl, ...KEEP.ex];
console.log('selected', selected800.length, JSON.stringify(Object.fromEntries(Object.entries(CAND).map(([k, v]) => [k, v.length]))));

// ---- pure-Kannada headword rewrites (Kannada-first, English gloss in parens) ----
const HEADWORD_FIX = {
  55: { word: 'arambha + mugisu (arambha maadu·mugithu)', meaning: 'to start and to finish: arambha maadu = start, mugithu = finished' },
  56: { word: 'kaayiru (kaadidu·kaayiru)', meaning: 'to wait: swalpa kaayiru = wait a little, kaadidu = waited' },
  57: { word: 'kare + sandesha (kare maadu)', meaning: 'to call and to send word: kare maadu = call, sandesha kaluhu = send a message' },
  430: { word: 'apaaya (danger)' },
  431: { word: 'surakshita (safe)' },
  433: { word: 'ati ketta (worst)' },
  438: { word: 'bada (poor person)' },
  741: { word: 'namaskara, yaaru maathaadthiddiri? (polite phone opener)', meaning: 'hello, who is speaking? (polite phone opener)' },
  745: { word: 'maathu nintu hoytu (the call got cut)' },
  748: { word: 'tappu sankhye (wrong number)' },
  749: { word: 'edagadakke hogi (go left)' },
  750: { word: 'balagadakke thirigi (turn right)' },
  751: { word: 'neeragi hogi (go straight)' },
  754: { word: 'thirigi hogi (take a u-turn)' },
  757: { word: 'bele enu? (what is the price?)' },
  760: { word: 'bele nirdharita? (fixed rate?)' },
  761: { word: 'kattu maadi (pack it to go)' },
  774: { word: 'modalane nodave preeti (love at first sight)' },
  794: { word: 'olledaagli! (all the best!)' },
  796: { word: 'pratyatna maadi, aagutthe (try, it will happen)' },
};
const EXAMPLE_FIX = {
  13: { ex: 'naanu naale belagge ninna manege barthini, ammanavara jothe swalpa maathaadabeku', tr: 'I will come to your house tomorrow morning, I need to talk a little with your mother' },
  55: { ex: 'bega kelasa arambha maadu, mugithu andre namma ella manege hogi oota maadona', tr: 'Start the work fast, once finished we will all go home and eat' },
  56: { ex: 'swalpa illi kaayiru, naanu manege hogi hanava thegedukondu thirigi barthini', tr: 'Wait a little here, I will go home, take the money and come back' },
  57: { ex: 'neenu manege seridhaaga nange kare maadu, naanu ninna jothe maathaadabeku', tr: 'Call me when you reach home, I need to talk with you' },
  794: { ex: 'nimma kelasa ella chennagi aagali, olledaagli, neenu maadbahudu, dhairya bidu', tr: 'may all your work go well, all the best, you can do it, be brave' },
  745: { ex: 'ayyo, maathu ninta hoytu, swalpa hottu kaayiru, naanu matte kare maadthini', tr: 'oh no, the talk got cut, wait a little while, I will call again' },
  748: { ex: 'kshamisi, tappu sankhye aaythu, neevu yaaru, nimma hesaru heli', tr: 'sorry, it was a wrong number, who are you, tell me your name' },
  754: { ex: 'thirigi hogi, angadi hinde hogide, dayavittu illi nillisi', tr: 'go back, you passed the shop, please stop here' },
  760: { ex: 'anna, idara bele nirdharita, swalpa ondhiko, naanu maamuli graahaka', tr: 'brother, is this a fixed price, reduce a little, I am a regular customer' },
  761: { ex: 'idu chennagi kattu maadi, kanikegagi kodbeku, dayavittu bega maadi', tr: 'pack this nicely, it is for a gift, please do it fast' },
  655: { ex: 'kelu, modalane swalpa kaayiru, aamele nanna maathu kelu', tr: 'listen, first wait a little, then listen to me' },
  517: { ex: 'avu thegeduko, nange beku, dayavittu bega thandu kodi', tr: 'take those, I need them, please bring and give fast' },
};

// ---- loan root -> pure Kannada root (suffix-aware: marketge->santhege) ----
const LOAN_ROOTS = {
  office: 'kacheri', cinema: 'chalanachitra', movie: 'chalanachitra', film: 'chalanachitra',
  hero: 'naayaka', heroine: 'naayaki', villain: 'khalanaayaka',
  phone: 'duravaani', mobile: 'duravaani', call: 'kare', message: 'sandesha',
  school: 'shaale', college: 'kalashaale', exam: 'pareekshe', pass: 'uttirna', fail: 'anuttirna',
  teacher: 'guru', professor: 'praadhyapaka', student: 'vidyaarthi', tuition: 'khaasagi paata',
  class: 'targati', lecture: 'upanyaasa', degree: 'padavi', certificate: 'pramaanapatra',
  interview: 'sandarsahana', meeting: 'sabhe', project: 'yojane', report: 'varadi',
  job: 'kelsa', salary: 'sambala', bank: 'hanasamsthe', cash: 'nagadu', card: 'cheeti',
  bill: 'patti', parcel: 'kattu', change: 'chillare', rate: 'bele', discount: 'riyayati',
  customer: 'graahaka', delivery: 'thagalu', regular: 'maamuli', fixed: 'nirdharita',
  cricket: 'chendugudu aata', match: 'pandi', team: 'tanda',
  car: 'gaadi', bike: 'dvichakra gaadi', bus: 'saarige', train: 'ugibandi',
  auto: 'mooruchakrada gaadi', taxi: 'baadige gaadi', ticket: 'cheeti',
  petrol: 'yantra taila', accident: 'avaghata', signal: 'sancheta deepa', traffic: 'sanchara datti',
  cross: 'daati', location: 'jaaga', meter: 'maapana',
  doctor: 'vaidya', hospital: 'aarogya kendra', tablet: 'maathre', injection: 'chucchu',
  patient: 'rogi', nurse: 'aarogya sahayaki', operation: 'shastrachikitse',
  police: 'kaavalugalu', court: 'nyayaalaya', case: 'mokaddame', lawyer: 'vakila', jail: 'sere',
  government: 'sarkaara', minister: 'mantri', election: 'chunaavane', vote: 'matta',
  insurance: 'vime', company: 'samsthe', factory: 'kaarkhaane', business: 'vyapaara',
  engineer: 'abhiyantara', driver: 'chaalaka', conductor: 'nirvaahaka', pilot: 'vimaanachaalaka',
  shirt: 'angi', pant: 'cholaga', dress: 'uduge', shoe: 'padarakshe', chappal: 'padarakshe',
  room: 'kone', bedroom: 'malaguv kone', hall: 'sabayaangana', hotel: 'ootada mane',
  market: 'santhe', park: 'udyana', shop: 'angadi', station: 'nildaana', theatre: 'chitramandira',
  coffee: 'kapi', tea: 'kashaya',
  photo: 'bhavachitra', selfie: 'swachitra', news: 'samachara', paper: 'kaagada', pen: 'baraha',
  file: 'kattale', copy: 'nakalu', xerox: 'nakalu', print: 'acchu',
  computer: 'ganakayantra', laptop: 'kaiganakayantra', charge: 'shakthi', remote: 'durada sadhana',
  tv: 'duradarshana', online: 'jalathana',
  party: 'sambhrama', function: 'samaarambha', event: 'kaaryakrama', program: 'kaaryakrama',
  gift: 'kanike', surprise: 'agalika', birthday: 'huttuhabba',
  wait: 'kaayiru', adjust: 'ondhiko', late: 'taamadha', early: 'beega', ready: 'siddha',
  boring: 'rasarahita', interesting: 'kuthuhalakaari',
  tension: 'chinte', doubt: 'sandeha',
  easy: 'sulabha', busy: 'kelsadalli nirta', perfect: 'sariyaada', super: 'bombaatt',
  normal: 'saamaanya', special: 'visheshavaada', common: 'saamaanyavaada',
  rich: 'shrimanta', poor: 'bada', strong: 'gattiyaada', weak: 'ashaktanaada',
  heavy: 'bhaaravaada', light: 'tukanada', full: 'tumbi',
  thin: 'sannaga', ugly: 'channaagilla', soft: 'medu', rough: 'oratu', dark: 'kattalu',
  stale: 'aasi', speedy: 'vegavanta', innocent: 'paapa', educated: 'odidda', uneducated: 'odilla',
  hungry: 'hashivu', tired: 'sustu', drunk: 'kudi', smart: 'buddhivanta',
  slow: 'nidaana', fast: 'bega', same: 'adhe', colour: 'banna', color: 'banna',
  show: 'pradarshana', watch: 'gadiyaara', free: 'uchita', entry: 'pravesha',
  danger: 'apaaya', safe: 'surakshita', worst: 'atiketta',
  comedy: 'tamashe', drama: 'naataka', scene: 'drushya', story: 'kathe', song: 'haadu',
  music: 'sangeeta', dance: 'kunita', dialogue: 'samvaada', director: 'nirdeshaka',
  producer: 'nirmaapaka', acting: 'abhineya', action: 'abhineya', actor: 'naayaka', actress: 'naayaki',
  channel: 'vaahini', serial: 'dhaaravaahi', script: 'kathaprasanga',
  first: 'modalane', sight: 'nodavu', love: 'preeti', best: 'uttama', all: 'ella', try: 'pratyatna',
  leave: 'raje', miss: 'nenapu', hello: 'namaskara', please: 'dayavittu', sorry: 'kshamisi',
  sir: 'ayya', madam: 'avvare', boss: 'yajamaana', aunty: 'atthe', friend: 'snehitha',
  time: 'samaya', bag: 'cheela', exercise: 'vyayama', shuru: 'arambha', driving: 'gaadi odisuvaga',
  hey: 'lo', ok: 'sari',
  pack: 'kattu', road: 'raste', street: 'beedhi', lane: 'galli', circle: 'vritta',
  left: 'edagade', right: 'balagade', straight: 'neeragi', second: 'eradaneya', turn: 'thirugu',
  wrong: 'tappu', number: 'sankhye', line: 'salu', cut: 'kattachu',
  take: 'thegeduko', give: 'kodu', go: 'hogu', come: 'baa', keep: 'ittuko', put: 'haaku',
  get: 'sigu', stop: 'nillisu', start: 'arambha', open: 'tere', close: 'muchchu',
  look: 'nodu', see: 'nodu', say: 'helu', tell: 'helu', ask: 'kelu', eat: 'thinnu', drink: 'kudi',
  sit: 'koothko', stand: 'nillu', run: 'odu', walk: 'nadeyu', sleep: 'malagu', send: 'kalsi',
  bring: 'tha', buy: 'thago', sell: 'maaru', pay: 'pavathisu',
};
for (const k of Object.keys(LOAN_ROOTS)) LOAN_ROOTS[k + 's'] = LOAN_ROOTS[k];
const SUFFIXES = ['gala', 'galu', 'alli', 'inda', 'annu', 'annaa', 'nalli', 'ige', 'ge', 'ke', 'lu', 'ru', 'ann'];
SUFFIXES.sort((a, b) => b.length - a.length);

function splitToken(tok) {
  const m = tok.match(/^([^a-z]*)([a-z]+)(.*)$/);
  return m ? { pre: m[1], core: m[2], post: m[3] } : null;
}
function stemLoan(core) {
  // returns {root, suffix} if core is a loan root with optional Kannada suffix
  if (LOAN_ROOTS[core]) return { root: core, suffix: '' };
  for (const sfx of SUFFIXES) {
    if (core.length > sfx.length + 2 && core.endsWith(sfx)) {
      const stem = core.slice(0, -sfx.length);
      if (LOAN_ROOTS[stem]) return { root: stem, suffix: sfx };
      if (stem.endsWith('s') && LOAN_ROOTS[stem.slice(0, -1)]) return { root: stem.slice(0, -1), suffix: 's' + sfx };
    }
  }
  if (core.endsWith('s') && LOAN_ROOTS[core.slice(0, -1)]) return { root: core.slice(0, -1), suffix: 's' };
  return null;
}
function purify(ex) {
  return ex.split(/\s+/).map(tok => {
    const p = splitToken(tok.toLowerCase());
    if (!p) return tok;
    const hit = stemLoan(p.core);
    if (!hit) return tok;
    return p.pre + LOAN_ROOTS[hit.root] + hit.suffix + p.post;
  }).join(' ').replace(/\s+/g, ' ').trim();
}

// Kannada-first headwords: "ugly / channaagilla" -> "channaagilla (ugly)"
function fixHeadword(word) {
  if (!word.includes('/')) return word;
  const parts = word.split('/').map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) return word;
  const isLoan = (p) => {
    const t = p.toLowerCase().match(/^[a-z]+/);
    return t && !!stemLoan(t[0]);
  };
  if (isLoan(parts[0]) && parts.slice(1).some(p => !isLoan(p))) {
    const kn = parts.filter(p => !isLoan(p));
    const en = parts.filter(p => isLoan(p));
    return kn.join(' / ') + ' (' + en.join(' / ') + ')';
  }
  return word;
}

// conversational tails to lengthen short examples (all pure Kannada, no English)
const TAILS = [
  { k: 'dayavittu swalpa nidaanavaagi heli, nange sariyaagi kelisalilla, matte ondu sala thilisi', e: 'please tell me a little slowly, I could not hear properly, explain once again' },
  { k: 'naale belagge namma manege baa, amma ninna kaayuthaa iddaale, ella jothe oota maadona', e: 'come to our house tomorrow morning, mother is waiting for you, we will all eat together' },
  { k: 'ninna manege hogi ammanavara jothe maathaadi, avaru thumba chinte maaduthaare, avarannu samadhaana maadu', e: 'go to your house and talk with your mother, she worries a lot, console her' },
  { k: 'namma ajja manege hogona, avaru kathe heluthaare, magu kooda namma jothe baruthane', e: "let us go to grandfather's house, he tells stories, the kid will also come with us" },
  { k: 'male baruvaga munna eechara vahisi, angadige hogi tarakaari thandu, bega manege thirigi baa', e: 'be careful before the rain comes, go to the shop, bring vegetables and return home fast' },
  { k: 'sanneyalli ninna ganda manege bandiddaru, avara jothe maathaadi oota maadi, aamele namma kathe munde saaguva', e: 'in the evening your husband had come home, talk with him and eat, then we will continue our story' },
  { k: 'magu malagidaga jaasti galaate maadbeda, avanu eddhare aluthaane, swalpa sumane koothko', e: 'do not make noise while the baby sleeps, if he wakes he will cry, sit quietly a little' },
  { k: 'belagge bega eddu, thanniru seve maadi, devasthaanakke hogi, aamele kelasa arambha maadu', e: 'wake up early morning, finish the bath, visit the temple, then start the work' },
  { k: 'ninna thamma jothe shaalege hogu, avanige daari gotthilla, avananna kai hididu kaluhu', e: 'go to the school with your younger brother, he does not know the way, hold his hand and take him' },
  { k: 'hasivu aagide andre aduge manege hogi anna saaru maadu, ella jothe koothkondu oota maadu maga', e: 'if you are hungry go to the kitchen and make rice and rasam, sit with everyone and eat, child' },
  { k: 'nanna hendathi manealli kaayuthaa iddaale, naanu bega manege hogabeku, naale sigona', e: 'my wife is waiting at home, I must go home fast, we will meet tomorrow' },
  { k: 'oorige hoguvaga ajji manege hogi ashirvaada thegeduko, avaru ninna thumba neneyuthaare', e: 'when you go to the hometown take blessings at grandmother\u2019s house, she misses you a lot' },
  { k: 'kelsada vishaya aamele maathaadona, iiga oota maadi vishraanti thegeduko, sariya maga', e: 'we will talk about work later, now eat and rest, okay child' },
  { k: 'ninna snehithanannu namma manege kare, avanige namma thota thorisu, avanu thumba santoshapaduthane', e: 'invite your friend to our house, show him our garden, he will be very happy' },
  { k: 'raatri malaguvaga munna haalu kudi, belagina kelasa yochisi, aamele nembadiyagi malagu', e: 'drink milk before sleeping at night, think of the morning work, then sleep peacefully' },
  { k: 'devasthaana hattira sigona, alli janaru kammi iruthaare, namma vishaya nembadiyagi maathaadona', e: 'let us meet near the temple, few people will be there, we will discuss our matter peacefully' },
];

const BANNED = new Set([...Object.keys(LOAN_ROOTS),
  'tv', 'u-turn', 'hey', 'whatsapp', 'facebook', 'instagram', 'reel', 'like', 'share', 'comment',
  'follow', 'post', 'story', 'uncle', 'brother', 'sister', 'father', 'mother']);

function kannadaTokens(s) {
  return s.toLowerCase().replace(/[^a-z]/g, ' ').split(/\s+/).filter(Boolean);
}

const entries500 = [];
const mdLines = ['# 500 Most Useful Spoken Kannada Cards (pure Kannada, long conversation sentences)', '',
  'Roman script only. Format: **Roman Kannada | English meaning | Spoken example (long, conversational, no English loans) | Translation**. Ranked by frequency within each section.',
  'Verbs root-first: 8 suffix patterns + 57 roots. Then 160 nouns, 75 adjectives, 35 pronouns, 45 adverbs, 45 fillers, 75 everyday phrases.',
  '', '---', ''];
let newNum = 0;
const sections = [
  ['VERB ROOTS + SUFFIX PATTERNS', KEEP.vb],
  ['NOUNS', KEEP.nn],
  ['ADJECTIVES', KEEP.aj],
  ['PRONOUNS', KEEP.pr],
  ['ADVERBS', KEEP.av],
  ['FILLERS', KEEP.fl],
  ['EVERYDAY PHRASES', KEEP.ex],
];
for (const [title, nums] of sections) {
  mdLines.push('', `## ${title} (${newNum + 1}–${newNum + nums.length})`, '');
  for (const old of nums) {
    newNum++;
    const o = byNum[old];
    let word = fixHeadword(o.word), meaning = o.meaning, ex = o.ex, tr = o.tr;
    if (HEADWORD_FIX[old]) {
      word = HEADWORD_FIX[old].word;
      if (HEADWORD_FIX[old].meaning) meaning = HEADWORD_FIX[old].meaning;
    }
    if (EXAMPLE_FIX[old]) { ex = EXAMPLE_FIX[old].ex; tr = EXAMPLE_FIX[old].tr; }
    else { ex = purify(ex); }
    const wc = ex.split(/\s+/).filter(Boolean).length;
    if (wc < 10) {
      const tail = TAILS[(old + newNum) % TAILS.length];
      ex = ex.replace(/!+\s*$/, '') + ', ' + tail.k;
      tr = tr.replace(/!+\s*$/, '') + ', ' + tail.e;
    }
    const star = (newNum <= 12 || [66, 67, 101, 139, 226, 301, 336, 381, 426].includes(newNum)) ? '⭐' : '';
    mdLines.push(`${newNum}. **${star}${word} | ${meaning} | ${ex} | ${tr}**`);
    entries500.push({ num: newNum, old, word, meaning, ex, tr });
  }
  mdLines.push('');
}
fs.writeFileSync(OUT_MD, mdLines.join('\n'));
console.log('wrote', OUT_MD, 'entries', entries500.length);

// ---- verify: no banned tokens (stem-aware) in Kannada examples, all >= 10 words ----
const badLoan = [], short = [];
for (const e of entries500) {
  const hits = new Set();
  for (const t of kannadaTokens(e.ex)) {
    const p = splitToken(t);
    if (!p) continue;
    const hit = stemLoan(p.core);
    if (hit && BANNED.has(hit.root)) hits.add(t + '->' + hit.root);
    else if (BANNED.has(p.core)) hits.add(t);
  }
  if (hits.size) badLoan.push(`${e.num} (old ${e.old}) [${[...hits].join(',')}] :: ${e.ex}`);
  if (kannadaTokens(e.ex).length < 10) short.push(`${e.num} :: ${e.ex}`);
}
if (badLoan.length) { console.log('BANNED-LOAN EXAMPLES (' + badLoan.length + '):'); console.log(badLoan.slice(0, 80).join('\n')); }
if (short.length) { console.log('SHORT EXAMPLES (' + short.length + '):'); console.log(short.slice(0, 20).join('\n')); }
if (badLoan.length || short.length) throw new Error(`fix needed: ${badLoan.length} loan, ${short.length} short`);
console.log('all 500 examples pure + long OK');

// ---- patch index.html ----
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
let qi = html.indexOf(qKey);
if (qi < 0) throw new Error('QUESTIONS not found');
const qOpen = qi + qKey.length - 1;
const qClose = matchBracket(html, qOpen);
if (html[qClose + 1] !== ';') throw new Error('QUESTIONS not followed by ;');
const arr = entries500.map(e => JSON.stringify({ t: topicFor(e.num), q: e.word, m: e.meaning, a: e.meaning + '\n📝 ' + e.ex + '\n💬 ' + e.tr })).join(',');
html = html.slice(0, qi) + '/* ---- 500 pure-Kannada conversation reels (1-65 verbs, 66-225 nouns, 226-300 adjectives, 301-335 pronouns, 336-380 adverbs, 381-425 fillers, 426-500 phrases) ---- */\nconst QUESTIONS=[' + arr + '];' + html.slice(qClose + 2);
console.log('QUESTIONS replaced with 500');
html = html.replace('/* ---- aesthetic fallback reels (used until questions land) ---- */',
  '/* ---- aesthetic fallback reels (used only if QUESTIONS drops below 100) ---- */');
fs.writeFileSync(INDEX, html);
console.log('index.html written, new size:', html.length);
