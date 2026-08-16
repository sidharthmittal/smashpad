# 🐣 SmashPad

A safe fullscreen playground where babies, toddlers, and kids can **smash the
keyboard (or bang the mouse)** without breaking anything. Every key is swallowed
— **only Esc leaves** (and you have to *hold* it, so a stray tap won't kick you
out). Includes playful **learning modes**.

No build step, no dependencies, no accounts, no ads. Works fully offline.

---

## Run it

Just open `index.html` in a browser:

```bash
open index.html                       # default browser
open -a "Google Chrome" index.html    # Chrome (recommended — blocks the most keys)
```

…or double-click `index.html` in Finder.

Then click **▶ Start Smashing** → it goes fullscreen → smash away →
**hold Esc** for ~1.5s to leave.

> **Tip:** Use **Chrome or Edge** for the strongest key-blocking. They support the
> Keyboard Lock API, which traps browser shortcuts (⌘/Ctrl+T, ⌘/Ctrl+W, F11…)
> while you're in fullscreen. Safari and Firefox still block all normal keys but
> not those browser shortcuts.

---

## Modes

| Mode | What a smash does |
|------|-------------------|
| 🎉 **Free Play** | Big letter/emoji + colorful particle burst + floating emojis |
| 🔤 **Alphabet** | Big letter + its word (e.g. **A · Apple**) |
| 🦁 **Animal ABC** | Letter + animal emoji + word (e.g. **A is for Alligator 🐊**) |
| 🔢 **Numbers** | A digit + that many objects to count + the number word |
| 🎨 **Colors & Shapes** | A big named shape (e.g. **Red Star**) |

- **Sounds** are **off by default** — flip the toggle on the start screen to
  enable cheerful notes (generated in-browser, no files). Your choice is
  remembered.
- **Mouse works everywhere:** move to leave a sparkle trail, click/tap for a full
  smash. Great for laptops or pre-keyboard kids.
- Respects `prefers-reduced-motion` (fewer, calmer effects).

---

## What can and can't be blocked (honest note)

A **website can block**: every letter, number, symbol, space, enter, arrows,
tab — plus browser shortcuts in Chrome/Edge fullscreen.

A website **cannot block** (the operating system owns these — no web page can
intercept them): **brightness, volume & mute, media keys, screenshot, the
Windows key, and Mac's ⌘+Option+Esc.**

For a *fully* locked-down screen, pair SmashPad with your OS's kiosk feature:

- **iPad:** Settings → Accessibility → **Guided Access**
- **Android:** **Screen pinning**
- **Windows:** Assigned Access / kiosk mode
- **Mac:** it helps to close other apps; brightness/volume keys will still work

---

## Deploy for free

It's a plain static site (HTML/CSS/JS), so any static host works:

**Option A — Netlify Drop (easiest, no account setup):**
1. Go to <https://app.netlify.com/drop>
2. Drag the whole `smashpad` folder onto the page.
3. You get a live URL instantly. (Free.)

**Option B — GitHub Pages:**
```bash
cd smashpad
git init && git add . && git commit -m "SmashPad"
gh repo create smashpad --public --source=. --push   # needs the gh CLI
# then: repo Settings → Pages → Deploy from branch → main / root
```
Site appears at `https://<you>.github.io/smashpad/`.

**Option C — Cloudflare Pages / Vercel:** connect the repo (or drag-drop),
framework preset = "None", output dir = project root. Free tier is plenty.

All three give free HTTPS. HTTPS matters here because the **Keyboard Lock** and
**Fullscreen** APIs only work on secure origins (or `file://`).

---

## Optional: add a "Support" / donate button

There are **no ads** (a toddler mashing the screen would rack up invalid ad
clicks and get an ad account banned — and personalized ads to under-13s aren't
allowed anyway). A voluntary tip link is the clean alternative.

Open `js/app.js`, edit the top `CONFIG` block:

```js
var CONFIG = {
  donateUrl: "",                       // paste your link here; leave "" to hide
  donateLabel: "☕ Support SmashPad"
};
```

### Easy, free-to-set-up options in India 🇮🇳
- **UPI link** (simplest, zero fees): use a link like
  `upi://pay?pa=yourname@upi&pn=SmashPad&cu=INR`. Note: `upi://` links open a
  UPI app and work best when the site is opened **on a phone**.
- **Razorpay Payment Page / Payment Button** (<https://razorpay.com>): free to
  create a hosted payment page; supports UPI, cards, netbanking. Paste that
  page's URL as `donateUrl`. Good for desktop visitors.
- **Ko-fi** (<https://ko-fi.com>): free, international, supports one-off tips;
  paste your Ko-fi profile URL.
- **Buy Me a Coffee** (<https://buymeacoffee.com>): similar, free to start.

For India specifically, a **Razorpay Payment Page** (works on desktop + mobile,
accepts UPI) or a plain **UPI link** (great on mobile) are the least-friction,
free-to-start choices.

---

## Project layout

```
smashpad/
├── index.html              # markup, PWA meta tags, script order
├── styles.css              # modern styling (tokens, aurora bg, glass, responsive, safe-area)
├── manifest.webmanifest    # PWA manifest (display: fullscreen)
├── sw.js                   # offline service worker (cache-first)
├── icons/                  # app icons (192, 512, apple-touch-180)
├── js/
│   ├── content.js          # data: colors, shapes, A–Z words & animals, numbers
│   ├── audio.js            # optional Web Audio sound engine
│   ├── sprites.js          # canvas engine: particles, glyphs, emojis, count rows + responsive scale
│   ├── device.js           # device detection (touch/keyboard/standalone) + haptics
│   ├── modes.js            # what each mode draws on a smash
│   └── app.js              # input (kbd + multi-touch), hold-to-exit, fullscreen,
│                           #   keyboard lock, wake lock, idle attract, PWA reg, CONFIG
├── README.md
└── MEMORY.md               # resume notes / decisions log
```

Everything shares one global namespace, `window.SP`. Scripts are plain classic
`<script>`s (not ES modules) on purpose, so double-clicking the file over
`file://` just works.

> **Installing / offline testing:** the service worker only runs over http(s),
> not `file://`. To try install + offline, serve it locally:
> `cd smashpad && python3 -m http.server 8000` → open `http://localhost:8000`.
