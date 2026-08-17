# SmashPad — project memory (resume notes)

_Last updated: 2026-08-17. Read this first when resuming._

## ⏭️ RESUME HERE (next session)
Site is **live** and the backlog is essentially cleared. Only one code item left:
1. **#6 Spoken voice** (Web Speech API, `speechSynthesis`) reading letters/words —
   ⚠️ **MUST CONFIRM WITH USER FIRST** (they earlier said "no voice"). Add as a
   default-OFF toggle on the start screen (mirror the sounds/case toggle pattern);
   speak in Alphabet / Animal / Numbers modes. Biggest learning boost if wanted.
   Then it's polish-only (letter tracing, more themes, etc.).

**Non-code follow-ups the USER still owes** (blocking, not code):
- **Register `smashpad.in`** (Cloudflare DNS zone already added; nameservers
  anahi/graham.ns.cloudflare.com waiting on registrar). Domain NOT bought yet.
  Until then the live URL is the github.io one below.
  **Where to buy (researched 2026-08-17):** Cloudflare Registrar does NOT sell `.in`,
  so buy `.in` elsewhere and keep NS pointed at Cloudflare. Cheapest to *own* =
  **Porkbun ~$7.83/yr flat** (free WHOIS privacy, no renewal jump). Indian registrars
  (Hostinger/GoDaddy/BigRock) are cheaper year-1 (₹99–299) but renew at ₹900–1500 —
  watch the renewal price, not the promo. If ever switching to `.com` instead,
  **Cloudflare Registrar** is best (at-cost ~$10.44/yr, requires CF DNS = already set).
  When bought: update `CONFIG.shareUrl` in app.js + manifest/canonical URLs to the
  real domain (offered to pre-stage this; user hadn't purchased yet).
- **Contact email:** contact.html now says "being set up, coming soon" (the raw
  {{CONTACT_EMAIL}} placeholder was removed on user request 2026-08-17). When the
  user has an address, drop it back into contact.html.
- **Razorpay:** business-model field → register as **Individual**, category
  Software/Education (NOT NGO/Donations). The reusable Payment Button
  (`pl_TQYFTRQb6bmALA`) is what's live now — no expiry, unlimited payments.
- Razorpay test/secret keys were pasted in chat earlier — **user said they'll
  rotate them**. We never stored/committed any secret (only the public `pl_`
  button id). Secret scan is part of every deploy.

**Live URL:** https://smashpad.in/ (custom domain, bought at GoDaddy 2026-08-17) —
mirror: https://sidharthmittal.github.io/smashpad/ (repo `sidharthmittal/smashpad`)
**SW cache:** currently `smashpad-v13` (bump on every asset change).

**⚠️ HTTPS cert NOT issued yet (as of 2026-08-17):** DNS is fully correct &
propagated (4 A records 185.199.108-111.153 @ TTL 600, www CNAME →
sidharthmittal.github.io — verified via Cloudflare DoH). But GitHub Pages
`https_certificate.state` is still `null` and the Pages WRITE endpoint
(`PUT repos/.../pages`) keeps returning **HTTP 503 "No server available"** —
githubstatus.com shows a **Partial System Outage** (Git Operations degraded).
So cert issuance is stalled on GitHub's side, NOT our config. Nothing to fix —
just wait for the outage to clear; the cert then auto-issues within minutes-to-
hours. Do NOT touch `https_enforced` (user never asked to change it; toggling it
was blocked by the safety classifier earlier). To re-nudge once writes work:
`GH_HOST=github.com gh api --method PUT repos/sidharthmittal/smashpad/pages -f cname=smashpad.in`
then poll `.https_certificate.state`. Once state=`approved`/serving over HTTPS,
tell USER to tick Settings → Pages → **Enforce HTTPS**. This one blocker explains
ALL THREE user complaints: "unsecure logo", missing install button
(`beforeinstallprompt` needs HTTPS), and not seeing fresh themes.

**v13 shipped (commit 47498dd, deployed & confirmed on raw):**
- **Punch-up backdrop + card** (user: "themes are still very plain") — bigger/
  brighter/faster per-theme ambient particles; glass `.card` more transparent
  (blur 20→11px, lower fill alpha) so backdrop reads through; aurora softened;
  NEW `#startFloaters` layer = 9 big drifting theme emojis around the card
  (`buildStartFloaters()` in app.js from `SP.floaterPool()`), hidden while
  playing + under reduced-motion. Verified all 4 themes via headless screenshots.
- **Network-first SW** (user: "full pull down does not reload the site") — sw.js
  rewritten cache-first → NETWORK-FIRST for app code (HTML/CSS/JS), cache-first
  only for static binaries, offline falls back to cache/shell. app.js
  `registerSW()` now auto-updates (reg.update() on load+focus, SKIP_WAITING on
  updatefound, one-time reload on controllerchange). CACHE v12→v13.
  NOTE: the OLD cache-first SW is still installed on the user's devices; the
  network-first fix only takes over AFTER the new SW activates once — so the
  FIRST reload after this deploy may still be stale, the next one is fresh.

**Custom domain wiring (smashpad.in via GoDaddy):**
- Repo side DONE: `CNAME` file = `smashpad.in`; `CONFIG.shareUrl` = https://smashpad.in/;
  canonical + OpenGraph/Twitter meta in index.html point to smashpad.in. All asset
  paths are RELATIVE so the site works unchanged at the root domain.
- **DNS (do in GoDaddy → Manage DNS):** apex `@` → 4 A records
  185.199.108.153 / .109.153 / .110.153 / .111.153 (optionally AAAA
  2606:50c0:8000::153 … 8003::153); `www` → CNAME `sidharthmittal.github.io`.
  Delete GoDaddy's default parking A record + any "Forwarding". (NOTE: earlier
  plan assumed Cloudflare DNS — user bought at GoDaddy instead, so records go in
  GoDaddy, not Cloudflare.)
- GitHub → repo Settings → Pages → Custom domain = smashpad.in (the CNAME file
  sets this automatically on deploy); tick **Enforce HTTPS** once the cert issues
  (can take up to ~24h, usually minutes after DNS resolves).

## What this is
A safe fullscreen web playground where babies/toddlers/kids can **smash the
keyboard or touchscreen** without anything breaking. Every key is swallowed;
only a deliberate grown-up gesture exits. Includes playful **learning modes**.
Static site, no build, no dependencies, works offline, installable as a PWA.

**Location:** `/Users/sidharth.mittal/smashpad/`

## Current status: ✅ WORKING, VERIFIED & DEPLOYED LIVE
All features below were built and verified with real headless-Chrome
screenshots + driven-input tests (desktop boot clean, all 5 modes render,
Esc-hold exits, multi-touch works, corner-hold exits, responsive scaling works,
manifest valid, icons correct dimensions, zero JS errors).

**Deployed to GitHub Pages** at https://sidharthmittal.github.io/smashpad/
via `gh` CLI + Pages API. Deploy loop (reuse this): edit → headless-Chrome
screenshot over `python3 -m http.server 8000` → `git grep` secret scan →
commit `git -c user.name="Sidharth Mittal" -c user.email="sidharth.mittal@salesforce.com"`
with `Co-Authored-By: Claude Opus 4.8 (1M context)` trailer →
`GH_HOST=github.com git push -q origin main` → poll `gh api repos/OWNER/REPO/pages/builds/latest`
until "built" → curl live files to confirm. (gh must use github.com host, NOT
the Salesforce-internal git it defaults to.)

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
  Instead: optional **donations** via `js/app.js` CONFIG. No backend needed —
  nothing is unlocked by paying, so no signature verification (donations, not purchases).
- **PAYMENT (current, 2026-08-17): reusable Razorpay Payment Button DISGUISED as
  the coffee button.** We dropped the one-time payment *link* (it deactivates after
  the first payment — user confirmed this). Now `CONFIG.donateUrl=""` and we render
  `CONFIG.razorpayButtonId` (`pl_TQYFTRQb6bmALA`) but overlay it INVISIBLY on top of
  our own "☕ Buy me a coffee" face (`buildDonate()` → `.donate-stack`/`.donate-face`
  visible + `.donate-rzp` at opacity:0 covering it). Razorpay renders inline HTML
  (an `<a>`, NOT an iframe) — verified by DOM inspection — which is the ONLY reason
  the overlay/hit-through works. Verified with a hit-test (center of the coffee
  button resolves to Razorpay's own element). If you ever set `CONFIG.donateUrl`
  (Ko-fi / a REUSABLE Razorpay Payment *Page* URL), that takes priority as a plain
  link instead. Do NOT reintroduce a one-time payment link.
- **"Made in India 🇮🇳"** note — CENTERED at bottom (hidden while playing).
- **ABC/abc case toggle** — `SP.upperCase` (remembered); display-only `cased()`
  helper in modes.js keeps lookups canonical uppercase.
- **Themes** — `js/themes.js` (`SP.Themes` + `SP.floaterPool()` + `SP.trailColors()`):
  Rainbow / Space / Ocean / Kawaii. Picker chips on start screen, remembered. Each
  swaps the backdrop via `body[data-theme=...]` CSS + biases the floating-emoji pool
  + swaps the finger-trail palette. ALL themes kept DARK (white text + glass card must
  stay readable). Glyph palette (SP.COLORS) unchanged across themes — keeps
  Colors&Shapes colour names correct.
- **Animated backdrops (2026-08-17):** the sprite `#stage` canvas is now TRANSPARENT
  (z-index:1); behind it sit two fixed layers — `#bg` (themeable animated gradient,
  slow `bgDrift`) + `#ambient` (pure-CSS per-theme particle fields: Space starfield
  w/ parallax+twinkle, Ocean rising bubbles, Kawaii drifting sparkles+pulse). All
  disabled under `prefers-reduced-motion` (static dots remain). This replaced the
  old flat per-theme `#stage` gradient the user called "not very good".
- **Drag/touch trail (2026-08-17):** was one tiny star; now a glowing "comet" — an
  additive glow bloom (`addGlow`/`drawGlow`, `globalCompositeOperation="lighter"`) +
  a burst of bigger varied spinning shapes (star/heart/diamond/circle/ring) in the
  active theme's `trail` palette, each with a soft `glowStroke` halo. `hexToRgba()`
  helper in sprites.js. Verified all 4 themes via headless screenshots.
- **Smash report** — on exit, a grown-up "report card" overlay shows smash count +
  time played + an effort-scaled note, then a Done button → start screen. Counts
  real smashes only (idle-attract excluded). Skipped if 0 smashes. `#report` overlay.
- **Install prompt** — `beforeinstallprompt` captured → "Add to Home Screen" button.
- **Share** — `navigator.share()` sheet on mobile; desktop fallback = WhatsApp
  deep link + Copy-link (`CONFIG.shareUrl` empty = use current page URL).
- **Legal pages** — contact/terms/privacy/refund .html (+ legal.css), operated by
  "Sidharth Mittal (individual)", contributions strictly non-refundable. Footer
  links on start screen. Contact email REMOVED (says "coming soon") per user until
  they have an address.
- **Free Play mode renamed "Party" 🎉** (was confusing next to learning modes).
- **Mobile layout fix (2026-08-17):** `.overlay` clips horizontal overflow (the
  decorative aurora was forcing the layout wider than the phone → sideways shift +
  off-center "Made in India"); `.card` uses `margin:auto` + `min-width:0` +
  `align-items:flex-start` so a tall card centers when it fits and pins-to-top
  (fully scrollable) when it doesn't. NOTE: headless-Chrome `--window-size` does NOT
  emulate a real mobile viewport; verify mobile via an iframe forced to 390px wide.
- **Modern CSS** pass done (aurora bg, glass card, gradient sheen title, shiny button, ✓ mode badges).
- **PWA**: installable, offline service worker, generated icons, iOS meta tags.
- Code **split into files** using classic `<script>`s sharing `window.SP` (NOT ES modules —
  ES modules break over file://, which would kill "double-click to run").

## File map
```
index.html               markup, PWA meta, script order
styles.css               modern styling (design tokens, aurora, glass, responsive, safe-area) +
                         animated backdrop layers (#bg gradient drift, #ambient per-theme particles)
manifest.webmanifest     PWA manifest (display: fullscreen)
sw.js                     offline service worker (cache-first, bump CACHE="smashpad-vN" to update; currently v11)
legal.css                shared styling for the 4 legal pages
contact.html terms.html privacy.html refund.html   legal pages (footer-linked)
icons/                    icon-192.png, icon-512.png, apple-touch-icon.png (chick + confetti tile)
js/content.js            data: colors, shapes, A–Z words & animals, number words, emojis + helpers
js/audio.js              optional Web Audio sound engine (SP.Sound); pentatonic notes
js/sprites.js            canvas engine (SP.Stage): particles, glyphs, floaters, glowing comet trail
                         (addGlow/drawGlow/addSparkle + hexToRgba), count row, responsive SCALE +
                         u() helper. Floaters draw from SP.floaterPool(); trail from SP.trailColors().
js/device.js             SP.Device: touch/keyboard/standalone detection + haptic buzz()
js/themes.js             SP.Themes registry + SP.floaterPool(); loads before modes.js/app.js
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

## Donations (India)
LIVE: reusable Razorpay Payment Button (`pl_TQYFTRQb6bmALA`) disguised as the
coffee button — see the PAYMENT decision above. Alternatives if ever switching
(`CONFIG.donateUrl`): a REUSABLE Razorpay Payment *Page* URL, Ko-fi, Buy Me a
Coffee, or a UPI link. NEVER a one-time payment link (deactivates after 1 payment).

## Backlog

### ✅ Shipped (live)
- Legal pages (contact/terms/privacy/refund) for Razorpay verification.
- Animal ABC: bigger animal drawn on top/front, smaller letter below.
- Donate: reusable Razorpay button disguised as "☕ Buy me a coffee".
- **ABC/abc case toggle** for Party/Alphabet/Animal modes (remembered).
- **Install prompt** ("Add to Home Screen").
- **Share**: WhatsApp + Copy link (Web Share API + desktop fallback).
- **Themes**: Rainbow / Space / Ocean / Kawaii (remembered).
- **Animated backdrops**: per-theme CSS particle fields (starfield / bubbles /
  sparkles) + drifting gradient, behind a transparent canvas.
- **Glowing "comet" drag/touch trail**: additive glow bloom + burst of bigger
  varied shapes in each theme's palette (replaced the single tiny star).
- **Smash report** on exit (smash count + time played, effort-scaled note).
- **Mobile layout fix** (horizontal overflow → centered, scrollable card).
- **Contact email removed** (placeholder → "coming soon") per user.

### ⏳ Pending
- **Spoken voice** (Web Speech API) — ⚠️ CONFIRM FIRST (user earlier said "no voice");
  add last, default-OFF toggle. Biggest learning boost. (task #6)
- Letter **tracing** for Alphabet mode (nice-to-have).
- More themes (jungle, dinosaurs…) — trivial to add in js/themes.js now.
- **Custom domain** smashpad.in once registered (see follow-ups at top).

## Reference
Inspired by tinyfingers.net (which lets stray keys through and exits by typing "parent").
Our differentiator: stricter key-swallowing + single deliberate exit gesture + learning modes.
