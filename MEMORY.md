# SmashPad — project memory (resume notes)

_Last updated: 2026-08-16. Read this first when resuming._

## What this is
A safe fullscreen web playground where babies/toddlers/kids can **smash the
keyboard or touchscreen** without anything breaking. Every key is swallowed;
only a deliberate grown-up gesture exits. Includes playful **learning modes**.
Static site, no build, no dependencies, works offline, installable as a PWA.

**Location:** `/Users/sidharth.mittal/smashpad/`

## Current status: ✅ WORKING & VERIFIED
All features below were built and verified with real headless-Chrome
screenshots + driven-input tests (desktop boot clean, all 5 modes render,
Esc-hold exits, multi-touch works, corner-hold exits, responsive scaling works,
manifest valid, icons correct dimensions, zero JS errors).

## How to run
```bash
open -a "Google Chrome" ~/smashpad/index.html    # double-click also works
```
Click ▶ Start Smashing → fullscreen → smash → hold Esc (or top-left corner) ~1.5–2s to exit.

⚠️ **PWA/offline (service worker) only runs over http(s), NOT file://.** To test install/offline:
```bash
cd ~/smashpad && python3 -m http.server 8000   # then open http://localhost:8000
```

## Decisions locked in (do not re-litigate without asking)
- **Platform:** best-effort web app (single-page, static). No native app.
- **Only Esc exits on keyboard; hold 1.5s** (fill ring) so accidental taps don't exit.
- **Touch exit = hold top-left corner 2s** (no Esc key on tablets). Both exits always active.
- **Sounds DEFAULT OFF** (toggle on start screen, remembered in localStorage).
- **Visuals = "everything"**: big letters + particle bursts + shapes + emojis.
- **5 modes:** Free Play, Alphabet (A·Apple), Animal ABC (A is for Alligator 🐊),
  Numbers (digit + count row + word), Colors & Shapes (named big shape).
- **Mouse works everywhere** (sparkle trail + click burst). Multi-touch: each finger = its own burst.
- **NO ADS** — decided against (COPPA/GDPR-K + toddlers cause invalid ad clicks → ban).
  Instead: optional **donate link** via `CONFIG.donateUrl` in `js/app.js` (empty = hidden).
- **"Made in India 🇮🇳"** note bottom-right (added).
- **Modern CSS** pass done (aurora bg, glass card, gradient sheen title, shiny button, ✓ mode badges).
- **PWA**: installable, offline service worker, generated icons, iOS meta tags.
- Code **split into files** using classic `<script>`s sharing `window.SP` (NOT ES modules —
  ES modules break over file://, which would kill "double-click to run").

## File map
```
index.html               markup, PWA meta, script order
styles.css               modern styling (design tokens, aurora, glass, responsive, safe-area)
manifest.webmanifest     PWA manifest (display: fullscreen)
sw.js                     offline service worker (cache-first, bump CACHE="smashpad-v1" to update)
icons/                    icon-192.png, icon-512.png, apple-touch-icon.png (chick + confetti tile)
js/content.js            data: colors, shapes, A–Z words & animals, number words, emojis + helpers
js/audio.js              optional Web Audio sound engine (SP.Sound); pentatonic notes
js/sprites.js            canvas engine (SP.Stage): particles, glyphs, floaters, sparkle, count row,
                         responsive SCALE + u() unit helper
js/device.js             SP.Device: touch/keyboard/standalone detection + haptic buzz()
js/modes.js              SP.Modes: what each mode draws on a smash
js/app.js                controller: input, hold-to-exit, fullscreen, keyboard lock, wake lock,
                         idle attract, gesture lockdown, PWA registration. **CONFIG block at top.**
README.md                run/deploy/donate docs
MEMORY.md                this file
```

## Honest limitations (already communicated to user; keep being honest)
- Brightness / volume / media keys / screenshot / Windows key / ⌘+Opt+Esc **cannot be blocked
  by any website** — the OS owns them. For a true lockdown: iPad Guided Access / Android screen
  pinning / Windows kiosk. This is noted on-screen (grown-ups disclosure) and in README.
- Keyboard Lock API (traps ⌘/Ctrl+T etc.) is **Chrome/Edge only**, fullscreen only.
- iOS Safari has no real Fullscreen API — that's *why* we made it an installable PWA (launches borderless).

## How verification was done (reuse this pattern)
No `node` installed; use headless Chrome against the real files:
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --screenshot=... --virtual-time-budget=... file://.../harness.html`
- Copy index.html into a temp harness, rewrite `src="js/` → absolute paths, inject a driver script.
- **Gotcha:** `--virtual-time-budget` fast-forwards setTimeout but only fires rAF ~once. To test the
  frame loop / hold timers, OVERRIDE `requestAnimationFrame` to queue callbacks and flush them with a
  synthetic advancing timestamp (see how Esc-hold + corner-hold were verified).
- To emulate touch: patch `window.matchMedia` (pointer:coarse=true, fine=false) + `navigator.maxTouchPoints`
  BEFORE the app scripts load.

## Deploy (free) — details in README
Netlify Drop (drag folder) · GitHub Pages · Cloudflare Pages/Vercel. All give free HTTPS
(needed for Keyboard Lock, Fullscreen, and the service worker).

## Donations (India) — details in README
`CONFIG.donateUrl` in js/app.js. Options: UPI link (best on mobile), **Razorpay Payment Page**
(desktop+mobile, accepts UPI, free to set up), Ko-fi, Buy Me a Coffee. User is India-based.

## Ideas parked / possible next steps (not yet built)
- Optional **spoken voice** (Web Speech API) reading letters/words — user said "no voice" for now,
  but it's the biggest learning boost; easy to add behind a toggle.
- **Uppercase/lowercase toggle** + letter tracing for Alphabet mode.
- **Themes** (space / underwater / kawaii) — engine already supports swappable palettes.
- **Parent session timer / "smash report"** on exit (tinyfingers-style).
- **Install prompt UX** (beforeinstallprompt) with a friendly "Add to Home Screen" button.
- Custom domain if sharing widely.

## Reference
Inspired by tinyfingers.net (which lets stray keys through and exits by typing "parent").
Our differentiator: stricter key-swallowing + single deliberate exit gesture + learning modes.
