# Insta Copy — Kannada vocab reels in an Instagram skin

A mobile-first Instagram clone where every reel is a **spoken Kannada word
+ meaning + example**: 500 most-useful words for understanding Kannada
movies and everyday conversation (65 verbs: 8 suffix patterns + 57 roots,
160 nouns, 75 adjectives, 35 pronouns, 45 adverbs, 45 fillers,
75 everyday phrases). Every example is a long conversational sentence
(~15 words) in pure Kannada with no English loanwords.
Scroll randomly, tap to reveal the meaning + example, save for revision.

Everything works offline once loaded (service worker + local assets).

## Run it

- **Local:** just open `index.html` in a browser (mobile view for the real feel),
  or serve the folder: `npx serve .`
- **Phone:** host it (e.g. Vercel, below) then **Add to Home Screen** — it runs
  fullscreen and works offline.

## Deploy on Vercel

1. Push this folder to GitHub (it is the repo root).
2. [Import the repo in Vercel](https://vercel.com/new).
3. Framework preset: **Other**. Build command: *(empty)*. Output directory: *(empty)*.
4. Deploy. `vercel.json` handles clean URLs + long-term caching of portraits.

No build step, no dependencies, no backend.

## What's inside

| File | What |
| ---- | ---- |
| `index.html` | The whole app (all screens, all logic, 500 Kannada Q&As inline) |
| `portraits/` | 19 public-domain painting avatars (Rembrandt, Van Gogh, Vermeer…) |
| `manifest.webmanifest` | PWA install metadata |
| `sw.js` | Offline service worker |
| `icon.svg` | App icon |
| `vercel.json` | Vercel routing + cache headers |

## Screens (all functional)

Login (with session persistence) → Reels (endless, shuffled, Q&A reveal,
like/comment/share/save/more, audio pages) → Home (stories + viewer, posts) →
Explore (working search + grid viewer) → Notifications → Profile (highlights,
grids, followers sheets, edit profile, saved) → Inbox + chat threads with
replies → composer (post / story / reel).

## Credits

- Portrait avatars: public-domain paintings via Wikimedia Commons —
  Van Gogh, Rembrandt, Vermeer, Goya, Modigliani, Dürer, Klimt, Caravaggio,
  Friedrich, Arcimboldo, Munch, Bruegel, Da Vinci, Mondrian, Hokusai,
  Michelangelo (+ others).
- Kannada reels: 500 most useful spoken-Kannada words (Roman script) with
  long conversational examples in pure Kannada (no English loanwords) —
  verbs, nouns, adjectives, pronouns, adverbs, fillers and everyday phrases.
  Source: `source-data/kannada-500-pure-conversation.md`, built via
  `source-data/generators/build-500-pure.js` (re-run it after editing
  the vocab to rebuild the reels).
