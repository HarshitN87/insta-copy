// Swaps remaining placement-themed feed content to Kannada learning content:
// POSTS (home), HLS+HLTIPS (highlights), profile bio defaults, THREADS+NOTES (chats).
const fs = require('fs');
const INDEX = './index.html';

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
  throw new Error('no match at ' + openIdx);
}
// replace `const NAME=` ... up to its terminating `];` or `};`
function replaceConst(src, name, replacement) {
  const key = 'const ' + name + '=';
  const i = src.indexOf(key);
  if (i < 0) throw new Error(name + ' not found');
  let p = i + key.length;
  while (src[p] !== '{' && src[p] !== '[') p++;
  const close = matchBracket(src, p);
  if (src[close + 1] !== ';') throw new Error(name + ' not followed by ;');
  return src.slice(0, i) + replacement + src.slice(close + 2);
}

let html = fs.readFileSync(INDEX, 'utf8');

// 0. drop stale interview comment left from the reels swap
html = html.replace('/* ---- 500 interview reels (filled by generator; aesthetic fallback below) ---- */\n', '');
console.log('stale comment removed');

// 1. POSTS -> Kannada word-spotlight + tips posts
const P = (u, cap, e, h, likes, time) => ({ u, cap, e, h, likes, time, cm: [] });
const POSTS = [
  P('aarav.mehta', 'Word #1: iru = to be, exist 🗣️ naanu mane alli iddini = I am at home. Day 1 of 800, lets gooo #kannada #learnkannada', '🗣️', ['#ee2a7b', '#6228d7'], 5421, '3 HOURS AGO'),
  P('meera.kapoor', 'baa = come! banni = come (polite) 🙏 One word, two vibes. Movies use baa 10x more #kannada #spokenkannada', '🙏', ['#0f2027', '#203a43'], 7834, '5 HOURS AGO'),
  P('kabir.jpeg', 'oota aayta? = had food? 🍛 In Karnataka this MEANS how are you. Correct answer: aaytu! #kannadavibes', '🍛', ['#141e30', '#243b55'], 3210, '7 HOURS AGO'),
  P('zoya.exe', 'maadbeda = dont do ❌ jaasti maathaadbeda = dont talk too much. Every mom ever 😭 #kannada', '❌', ['#232526', '#414345'], 1876, '9 HOURS AGO'),
  P('dev.builds', 'gothilla = I dont know 🤷 nange gothilla. Most useful phrase of week 1, trust me #learnkannada', '🤷', ['#0f3443', '#34e89e'], 6543, '12 HOURS AGO'),
  P('chai.sutta', 'coffee kudiyona? = shall we have coffee? ☕ The real Karnataka greeting #filtercoffee #kannada', '☕', ['#0f172a', '#1e3a8a'], 8420, '5 HOURS AGO'),
  P('delhi.foodie', 'sakkath = awesome, super 🔥 sakkath movie guru! Bengaluru slang 101 #kannadaslang', '🔥', ['#111827', '#4c1d95'], 6230, '8 HOURS AGO'),
  P('zoya.exe', 'sumne = just, simply ✨ sumne bandenu = I just came like that. The chillest word ever #kannada', '✨', ['#0b1120', '#7c2d12'], 4150, '12 HOURS AGO'),
  P('ira.jpg', 'ayyo! = oh no! 😱 ayyo paapa = oh no, poor thing. You will hear this 50x per movie #kannadamovies', '😱', ['#020617', '#312e81'], 11200, '1 DAY AGO'),
  P('noor.jpg', 'hogona = lets go! 🚶 hogona macha! Every plan starts with this word #kannada', '🚶', ['#0f172a', '#78350f'], 7850, '1 DAY AGO'),
  P('arjun.wav', 'illa vs alla 🤔 illa = not there, alla = is not. avanu illa (hes not here) vs avanu thief alla (hes not a thief) #kannadagrammar', '🤔', ['#111827', '#065f46'], 5310, '2 DAYS AGO'),
  P('os.concepts', 'beku = want, beda = dont want ⚖️ nange coffee beku! One vowel flips everything #kannada', '⚖️', ['#1a1a2e', '#16213e'], 7112, '20 HOURS AGO'),
  P('system.design', 'alva? = right? isnt it? chennagide alva? = its good, right? Instant local tag question 🇮🇳 #spokenkannada', '🇮🇳', ['#0b1026', '#1e40af'], 9680, '2 DAYS AGO'),
  P('ml.interview', 'thumba = very, a lot 📈 thumba chennagide = its really nice. Use it everywhere #kannada', '📈', ['#0f172a', '#9a3412'], 3420, '3 DAYS AGO'),
  P('networks.ninja', 'swalpa adjust maadi = please adjust a little 🙏 Bengalurus official motto 😌 #swalpaadjust #kannada', '🙏', ['#090746', '#002d62'], 4087, '4 DAYS AGO'),
  P('aarav.mehta', 'Pro tip: watch Kannada movies WITH subtitles first 🎬 Pause on the ★ words — those run daily dialogue #learnkannada', '🎬', ['#1f1c2c', '#928dab'], 8950, '1 DAY AGO'),
  P('meera.kapoor', 'nange ninna thumba ishta = I love you a lot ❤️ The dialogue that launched 1000 films #kannadamovies', '❤️', ['#0b486b', '#3b8686'], 1564, '1 DAY AGO'),
  P('zoya.exe', 'parvagilla = its okay, no problem 😌 Missed the bus? parvagilla. Bad day? parvagilla ✨ #kannada', '😌', ['#0f172a', '#134e4a'], 2870, '5 DAYS AGO'),
  P('kabir.jpeg', 'macha = dude, buddy 🤙 yegiddiya macha = whats up dude. Friends only! #kannadaslang', '🤙', ['#090746', '#002d62'], 4087, '4 DAYS AGO'),
  P('dev.builds', 'arthave aagtha illa = I dont understand at all 😅 Me in every Kannada class, sorry 😅 #learnkannada', '😅', ['#020617', '#0e7490'], 6940, '3 DAYS AGO'),
  P('chai.sutta', 'tension beda = dont worry 💆 tension beda, naan iddini = dont worry, I am here #kannada', '💆', ['#111827', '#831843'], 8120, '4 DAYS AGO'),
  P('delhi.foodie', 'en samachara? = whats new? 🗞️ lo, en samachara? Best convo starter ever #spokenkannada', '🗞️', ['#1c1917', '#92400e'], 10540, '6 DAYS AGO'),
  P('ira.jpg', 'chennagide! = its good! 👍 cinema chennagide = the movie is good. Review any film in one word #kannadamovies', '👍', ['#1a1a24', '#0b0b10'], 7695, '2 DAYS AGO'),
  P('noor.jpg', 'Day 30: I now catch 40% of movie dialogues 🥹 800 words beats grammar books. Trust the process #kannada', '🥹', ['#020617', '#14532d'], 11900, '1 WEEK AGO'),
  P('arjun.wav', 'sigona = see you! 👋 sari, sigona! Plus hogi barthini = Ill go and come (taking leave) #spokenkannada', '👋', ['#0b1120', '#4c1d95'], 4780, '1 WEEK AGO'),
  P('rohan.jpeg', 'baayi muchko = shut your mouth 🤫 [rude] — movie villains only, do NOT try at home 😭 #kannadamovies', '🤫', ['#0f172a', '#1e3a8a'], 8420, '5 HOURS AGO'),
  P('sneha.jpg', 'hegiddiya? = how are you? 💛 hegiddira? = polite version. Respect matters! #learnkannada', '💛', ['#111827', '#4c1d95'], 6230, '8 HOURS AGO'),
  P('os.concepts', '-beku = must, -beda = dont, -bahudu = can 📚 barbeku (must come) vs barbeda (dont come) vs barbahudu (can come) #kannadagrammar', '📚', ['#090909', '#434343'], 5128, '3 DAYS AGO'),
  P('dbms.simplified', 'matte = again AND and/then 🔁 matte helu = say again. matte en aaytu = and then what happened #kannada', '🔁', ['#000428', '#004e92'], 2895, '18 HOURS AGO'),
  P('system.design', '800 words. 7 categories. Infinite movies 🎬⭐ iru hogu baaru nodu kelu — verbs first, always #kannada800', '🎬', ['#020617', '#7c2d12'], 11650, '1 WEEK AGO')
];
html = replaceConst(html, 'POSTS', 'const POSTS=' + JSON.stringify(POSTS) + ';');
console.log('POSTS replaced:', POSTS.length);

// 2. HLS + HLTIPS -> Kannada highlights
html = replaceConst(html, 'HLS', "const HLS=[{t:'Verbs',e:'\\uD83D\\uDDE3\\uFE0F'},{t:'Nouns',e:'\\uD83C\\uDFE0'},{t:'Phrases',e:'\\uD83D\\uDD25'},{t:'Movies',e:'\\uD83C\\uDFAC'}];");
console.log('HLS replaced');
const NEW_HLTIPS = "const HLTIPS={\n" +
" Verbs:[{e:'\\uD83D\\uDDE3\\uFE0F',h:['#ee2a7b','#6228d7'],t:'iru · hogu · baaru · nodu · kelu — 5 verbs behind 80% of dialogue'},{e:'\\uD83D\\uDCDD',h:['#ee2a7b','#2b0a3d'],t:'-beku = must · -beda = do not · -bahudu = can. Modals unlock every verb.'}],\n" +
" Nouns:[{e:'\\uD83C\\uDFE0',h:['#0095F6','#6228d7'],t:'mane · oota · duddu · cinema — manege hogona means lets go home'},{e:'\\uD83C\\uDF5B',h:['#0095F6','#1a1a40'],t:'oota aayta? means how are you here. Always answer aaytu!'}],\n" +
" Phrases:[{e:'\\uD83D\\uDD25',h:['#f9ce34','#ee2a7b'],t:'parvagilla · swalpa adjust maadi · tension beda — survival phrases'},{e:'\\uD83D\\uDCAC',h:['#f9ce34','#5b3a00'],t:'alva? = right? · sumne = just · sakkath = awesome. Sound local instantly.'}],\n" +
" Movies:[{e:'\\uD83C\\uDFAC',h:['#7b2ff7','#ee2a7b'],t:'Watch with subtitles. Pause on star words. Rewind the fights.'},{e:'\\uD83C\\uDF7F',h:['#7b2ff7','#2b0a3d'],t:'Comedies teach fillers. Emotional scenes teach verbs. Note them down.'}]};";
html = replaceConst(html, 'HLTIPS', NEW_HLTIPS);
console.log('HLTIPS replaced');

// 3. bio defaults -> Kannada learner
html = html.replace(
  "<textarea id=\"eBio\" rows=\"3\">🎓 BTech CSE '26 | placements&#10;📚 revising 500 interview Qs&#10;📍 delhi</textarea>",
  "<textarea id=\"eBio\" rows=\"3\">🗣️ learning Kannada via movies&#10;📚 800 words and counting&#10;📍 bengaluru</textarea>");
html = html.replace(
  "(bio||\"🎓 BTech CSE '26 | placements\\n📚 revising 500 interview Qs\\n📍 delhi\")",
  "(bio||\"🗣️ learning Kannada via movies\\n📚 800 words and counting\\n📍 bengaluru\")");
html = html.replace("<b>${p.n}</b><br>🎓 placements '26<br>📍 india<br>",
  "<b>${p.n}</b><br>🗣️ kannada learner<br>📍 india<br>");
console.log('bios replaced');

// 4. THREADS + NOTES -> Kannada-flavored chats
const T = (u, unread, msgs) => ({ u, unread, msgs: msgs.map(m => ({ m: m[0], t: m[1] })) });
const THREADS = [
  T('aarav.mehta', 2, [[0, 'bro weekend plan??'], [0, 'KGF rewatch + note new words 📝'], [1, 'deal. subtitles on?'], [0, 'subtitles OFF. we brave now 😭']]),
  T('meera.kapoor', 1, [[0, 'sent you a reel 📩'], [0, 'this word!!! sakkath use 😍'], [1, 'the alva? one? 😭']]),
  T('kabir.jpeg', 0, [[1, 'test me. 10 words.'], [0, 'iru hogu baaru nodu kelu GO'], [1, 'to be go come see... ask?'], [0, 'kelu = ask/listen ✅ 4/5']]),
  T('zoya.exe', 0, [[0, 'your kannada playlist>>> '], [1, 'movie dialogues on loop 🎧'], [0, 'oota aayta? stuck in my head']])
];
html = replaceConst(html, 'THREADS', 'const THREADS=' + JSON.stringify(THREADS) + ';');
console.log('THREADS replaced');
html = replaceConst(html, 'NOTES',
  "const NOTES=[{u:'aarav.mehta',t:'movie night sat? 🍿'},{u:'meera.kapoor',t:'word #300 done!!'},{u:'kabir.jpeg',t:'kannada-only sunday 🤫'}];");
console.log('NOTES replaced');

fs.writeFileSync(INDEX, html);
console.log('index.html written, new size:', html.length);
