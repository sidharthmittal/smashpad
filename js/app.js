/*
 * app.js — ties it together: mode picker, input (keyboard + multi-touch + mouse),
 * hold-to-exit (Esc on keyboards, top-left corner on touch), fullscreen,
 * keyboard lock, wake lock, idle attract mode, and PWA registration.
 * Loads last (after content/audio/sprites/device/modes).
 */
(function (SP) {
  "use strict";

  // ---------------------------------------------------------------------------
  // CONFIG — edit these, no code knowledge needed.
  // ---------------------------------------------------------------------------
  var CONFIG = {
    // Razorpay Payment Button — paste your button id (looks like "pl_XXXXXXXXXXXX")
    // from the Razorpay dashboard → Payment Button product. Renders Razorpay's own
    // native button (UPI / cards), no backend needed. Takes priority over donateUrl.
    // Leave "" to skip it.
    // PREFERRED: a link to your Razorpay Payment Page / Payment Link (or Ko-fi,
    // BuyMeACoffee, a UPI link…). Renders a custom "Buy me a coffee" button that
    // opens in a new tab. When set, this is used instead of the inline button below.
    donateUrl: "https://rzp.io/rzp/JR8Aq9O",
    donateLabel: "☕ Buy me a coffee",

    // FALLBACK: Razorpay Payment Button id ("pl_..."). Renders Razorpay's own
    // inline button. Used only when donateUrl is empty. Leave "" to skip.
    razorpayButtonId: "pl_TQYFTRQb6bmALA",

    // Warm one-liner shown above the Support button. Set "" to hide it.
    donateCaption: "Enjoying SmashPad? It's free & ad-free 💛"
  };

  var HOLD_MS = 1500;               // hold Esc this long to exit
  var CORNER_HOLD_MS = 2000;        // hold the corner this long to exit (touch)
  var CORNER_SIZE = 96;             // px square in the top-left that acts as the exit
  var REPEAT_THROTTLE_MS = 70;
  var TRAIL_THROTTLE_MS = 24;
  var IDLE_MS = 15000;              // start the attract show after this much quiet
  var IDLE_EVERY_MS = 620;         // gap between attract bursts

  // ---- elements ----
  var startEl, goBtn, escRing, ringFill, ringLabel, playhint, soundToggle,
      soundLabel, modeGrid, donateWrap;
  var RING_CIRC = 2 * Math.PI * 64;

  // ---- state ----
  var playing = false;
  var currentMode = null;
  var soundOn = false;              // default OFF (per user)
  var lastT = 0, lastSmashT = 0, lastTrailT = 0;

  // unified "hold to exit" state (works for Esc and the touch corner)
  var holdActive = false, holdStart = 0, holdMax = HOLD_MS;
  var escHeld = false;              // is the Esc key currently down
  var cornerPointerId = null;       // pointer currently holding the corner

  var activePointers = {};          // pointerId -> true (for multi-touch tracking)
  var idleTimer = 0, idleInterval = 0;
  var wakeLock = null;

  // ---------------------------------------------------------------------------
  // Sound preference (remembered)
  // ---------------------------------------------------------------------------
  function loadSoundPref() {
    try { soundOn = (localStorage.getItem("smashpad-sound") === "on"); }
    catch (_) { soundOn = false; }
  }
  function saveSoundPref() {
    try { localStorage.setItem("smashpad-sound", soundOn ? "on" : "off"); } catch (_) {}
  }
  function updateSoundLabel() {
    soundLabel.textContent = soundOn ? "🔊 Sounds: On" : "🔇 Sounds: Off";
  }

  // ---------------------------------------------------------------------------
  // Mode picker UI
  // ---------------------------------------------------------------------------
  function buildModeGrid() {
    SP.Modes.list.forEach(function (m, i) {
      var card = document.createElement("button");
      card.className = "mode-card" + (i === 0 ? " selected" : "");
      card.setAttribute("data-id", m.id);
      card.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      card.innerHTML = '<span class="mode-emoji">' + m.emoji + '</span>' +
                       '<span class="mode-name">' + m.label + '</span>';
      card.addEventListener("click", function () { selectMode(m.id); });
      modeGrid.appendChild(card);
    });
    currentMode = SP.Modes.byId("free");
  }
  function selectMode(id) {
    currentMode = SP.Modes.byId(id);
    var cards = modeGrid.querySelectorAll(".mode-card");
    for (var i = 0; i < cards.length; i++) {
      var on = cards[i].getAttribute("data-id") === id;
      cards[i].classList.toggle("selected", on);
      cards[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function buildDonate() {
    // Nothing configured at all → hide the whole area.
    if (!CONFIG.donateUrl && !CONFIG.razorpayButtonId) {
      donateWrap.style.display = "none";
      return;
    }

    // Warm caption above whichever support control we render.
    if (CONFIG.donateCaption) {
      var c = document.createElement("p");
      c.className = "donate-caption";
      c.textContent = CONFIG.donateCaption;
      donateWrap.appendChild(c);
    }

    // Priority 1 (preferred): a custom "Buy me a coffee" button linking out.
    if (CONFIG.donateUrl) {
      var a = document.createElement("a");
      a.href = CONFIG.donateUrl; a.target = "_blank"; a.rel = "noopener";
      a.className = "donate-link"; a.textContent = CONFIG.donateLabel;
      donateWrap.appendChild(a);
      return;
    }

    // Priority 2 (fallback): Razorpay's own inline Payment Button (no backend).
    // Razorpay's script replaces this <form> with its rendered button.
    var form = document.createElement("form");
    var s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/payment-button.js";
    s.async = true;
    s.setAttribute("data-payment_button_id", CONFIG.razorpayButtonId);
    form.appendChild(s);
    donateWrap.appendChild(form);
  }

  // ---------------------------------------------------------------------------
  // Smashing
  // ---------------------------------------------------------------------------
  function doSmash(x, y, info) {
    var freq = currentMode.smash(x, y, info);
    if (soundOn) SP.Sound.pluck(freq || undefined);
    bumpIdle();
  }

  // ---------------------------------------------------------------------------
  // Idle attract mode — gentle auto-bursts when nobody's playing.
  // ---------------------------------------------------------------------------
  function stopIdle() {
    if (idleInterval) { clearInterval(idleInterval); idleInterval = 0; }
  }
  function startIdle() {
    stopIdle();
    idleInterval = setInterval(function () {
      if (!playing || holdActive) return;
      var sz = SP.Stage.size();
      doSmashInternal(SP.rand(sz.w * 0.15, sz.w * 0.85),
                      SP.rand(sz.h * 0.2, sz.h * 0.8),
                      { key: "", isLetter: false, char: "" });
    }, IDLE_EVERY_MS);
  }
  // like doSmash but does NOT reset the idle timer (so attract mode keeps going)
  function doSmashInternal(x, y, info) {
    var freq = currentMode.smash(x, y, info);
    if (soundOn) SP.Sound.pluck(freq || undefined);
  }
  function bumpIdle() {
    stopIdle();
    if (idleTimer) clearTimeout(idleTimer);
    if (!playing) return;
    idleTimer = setTimeout(startIdle, IDLE_MS);
  }

  // ---------------------------------------------------------------------------
  // Wake lock — keep the screen awake while playing.
  // ---------------------------------------------------------------------------
  function requestWakeLock() {
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request("screen").then(function (wl) {
          wakeLock = wl;
        }).catch(function () {});
      }
    } catch (_) {}
  }
  function releaseWakeLock() {
    try { if (wakeLock) { wakeLock.release(); wakeLock = null; } } catch (_) {}
  }
  function onVisibility() {
    // Wake lock is dropped when tab is hidden; re-acquire on return.
    if (document.visibilityState === "visible" && playing) requestWakeLock();
  }

  // ---------------------------------------------------------------------------
  // Loop + hold-to-exit ring
  // ---------------------------------------------------------------------------
  function frame(t) {
    if (!lastT) lastT = t;
    var dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;

    SP.Stage.step(dt);

    if (holdActive) {
      if (holdStart === 0) holdStart = t;       // single rAF clock, no drift
      var p = Math.min(1, (t - holdStart) / holdMax);
      ringFill.style.strokeDashoffset = RING_CIRC * (1 - p);
      if (p >= 1) { holdActive = false; exitPlay(); }
    }

    if (playing) requestAnimationFrame(frame);
  }

  function beginHold(ms, label) {
    holdActive = true; holdStart = 0; holdMax = ms;
    ringLabel.textContent = label;
    escRing.classList.add("show");
  }
  function cancelHold() {
    holdActive = false; holdStart = 0;
    escRing.classList.remove("show");
    ringFill.style.strokeDashoffset = RING_CIRC;
  }

  // ---------------------------------------------------------------------------
  // Keyboard input
  // ---------------------------------------------------------------------------
  function onKeyDown(e) {
    if (!playing) return;

    if (e.key === "Escape") {
      e.preventDefault();
      if (!escHeld) { escHeld = true; beginHold(HOLD_MS, "Keep holding Esc…"); }
      return;
    }

    // Swallow everything else — no key does anything but smash.
    e.preventDefault();
    e.stopPropagation();

    if (e.repeat) {
      var now = performance.now();
      if (now - lastSmashT < REPEAT_THROTTLE_MS) return;
      lastSmashT = now;
    } else {
      lastSmashT = performance.now();
    }

    var k = e.key;
    var isLetter = k.length === 1 && k.trim() !== "";
    var sz = SP.Stage.size();
    doSmash(SP.rand(sz.w * 0.12, sz.w * 0.88), SP.rand(sz.h * 0.15, sz.h * 0.85),
            { key: k, isLetter: isLetter, char: isLetter ? k : "" });
  }

  function onKeyUp(e) {
    if (e.key === "Escape") { escHeld = false; if (!cornerPointerId) cancelHold(); }
  }

  // ---------------------------------------------------------------------------
  // Pointer input (mouse + multi-touch). Each finger is its own pointer.
  // ---------------------------------------------------------------------------
  function inCorner(x, y) { return x <= CORNER_SIZE && y <= CORNER_SIZE; }

  function onPointerDown(e) {
    if (!playing) return;
    e.preventDefault();
    activePointers[e.pointerId] = true;

    // A touch/click in the top-left corner starts the grown-up exit hold.
    if (inCorner(e.clientX, e.clientY) && cornerPointerId === null) {
      cornerPointerId = e.pointerId;
      beginHold(CORNER_HOLD_MS, "Hold the corner…");
      return; // corner press doesn't also smash
    }

    SP.Device.buzz(12);
    doSmash(e.clientX, e.clientY, { key: "", isLetter: false, char: "" });
  }

  function onPointerMove(e) {
    if (!playing) return;
    // If the finger holding the corner slides out of it, cancel the exit.
    if (e.pointerId === cornerPointerId && !inCorner(e.clientX, e.clientY)) {
      cornerPointerId = null;
      if (!escHeld) cancelHold();
      return;
    }
    if (e.pointerId === cornerPointerId) return; // still holding corner

    var now = performance.now();
    if (now - lastTrailT < TRAIL_THROTTLE_MS) return;
    lastTrailT = now;
    SP.Stage.addSparkle(e.clientX, e.clientY);
    bumpIdle();
  }

  function onPointerUp(e) {
    delete activePointers[e.pointerId];
    if (e.pointerId === cornerPointerId) {
      cornerPointerId = null;
      if (!escHeld) cancelHold();
    }
  }

  // ---------------------------------------------------------------------------
  // Start / stop
  // ---------------------------------------------------------------------------
  function enterPlay() {
    if (soundOn) { SP.Sound.init(); SP.Sound.resume(); }

    // Fullscreen (best effort) — swallow sync throws and promise rejections.
    try {
      var el = document.documentElement;
      var fsP = null;
      if (el.requestFullscreen) fsP = el.requestFullscreen({ navigationUI: "hide" });
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      if (fsP && fsP.catch) fsP.catch(function () {});
    } catch (_) {}

    // Keyboard Lock (Chrome/Edge) traps browser shortcuts too.
    try {
      if (navigator.keyboard && navigator.keyboard.lock) {
        var kbP = navigator.keyboard.lock();
        if (kbP && kbP.catch) kbP.catch(function () {});
      }
    } catch (_) {}

    requestWakeLock();

    playing = true;
    document.body.classList.add("playing");
    startEl.classList.add("hidden");
    lastT = 0;
    requestAnimationFrame(frame);

    playhint.classList.add("show");
    setTimeout(function () { playhint.classList.add("fade"); }, 3500);
    bumpIdle();
  }

  function exitPlay() {
    playing = false;
    document.body.classList.remove("playing");
    escHeld = false; cornerPointerId = null;
    activePointers = {};
    cancelHold();
    stopIdle(); if (idleTimer) { clearTimeout(idleTimer); idleTimer = 0; }
    playhint.classList.remove("show", "fade");
    SP.Stage.clear();
    startEl.classList.remove("hidden");
    releaseWakeLock();

    try { if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock(); } catch (_) {}
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (_) {}
  }

  function onFsChange() {
    var fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fs && playing) exitPlay();
  }

  // ---------------------------------------------------------------------------
  // Device-aware copy on the start screen
  // ---------------------------------------------------------------------------
  function applyDeviceCopy() {
    var tag = document.getElementById("tagline");
    var hint = document.getElementById("escHint");
    if (SP.Device.touch && !SP.Device.keyboard) {
      // Pure touch device (tablet/phone)
      tag.innerHTML = "Tap and smash the screen as much as you like.<br/>Nothing breaks.";
      hint.innerHTML = "Grown-ups: <b>hold the top-left corner</b> to leave.";
    } else if (SP.Device.touch) {
      // Hybrid (touch laptop)
      tag.innerHTML = "Smash the keyboard or tap the screen — all you like.<br/>Nothing breaks.";
      hint.innerHTML = "To leave: <b>hold&nbsp;Esc</b> or <b>hold the top-left corner</b>.";
    } // else: desktop default copy already in the HTML
  }

  // ---------------------------------------------------------------------------
  // PWA registration + gesture lockdown
  // ---------------------------------------------------------------------------
  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol !== "http:" && location.protocol !== "https:") return; // no SW on file://
    try {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    } catch (_) {}
  }

  function lockGestures() {
    // Block long-press context menu.
    window.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    // Block double-tap-to-zoom.
    var lastTouch = 0;
    document.addEventListener("touchend", function (e) {
      var now = performance.now();
      if (now - lastTouch < 350) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
    // Block pinch-zoom gestures (Safari) and multi-touch scroll.
    ["gesturestart", "gesturechange", "gestureend"].forEach(function (t) {
      document.addEventListener(t, function (e) { e.preventDefault(); });
    });
    // Block pull-to-refresh / rubber-banding while playing.
    document.addEventListener("touchmove", function (e) {
      if (playing && e.cancelable) e.preventDefault();
    }, { passive: false });
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  function boot() {
    startEl    = document.getElementById("start");
    goBtn      = document.getElementById("go");
    escRing    = document.getElementById("escring");
    ringFill   = document.getElementById("ringFill");
    ringLabel  = document.getElementById("ringLabel");
    playhint   = document.getElementById("playhint");
    soundToggle= document.getElementById("soundToggle");
    soundLabel = document.getElementById("soundLabel");
    modeGrid   = document.getElementById("modeGrid");
    donateWrap = document.getElementById("donateWrap");

    ringFill.style.strokeDasharray = RING_CIRC;
    ringFill.style.strokeDashoffset = RING_CIRC;

    SP.Stage.init();
    buildModeGrid();
    buildDonate();
    applyDeviceCopy();

    loadSoundPref();
    soundToggle.checked = soundOn;
    updateSoundLabel();
    soundToggle.addEventListener("change", function () {
      soundOn = soundToggle.checked;
      saveSoundPref();
      updateSoundLabel();
      if (soundOn) { SP.Sound.init(); SP.Sound.resume(); }
    });

    goBtn.addEventListener("click", enterPlay);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("pointerdown", onPointerDown, { passive: false });
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("visibilitychange", onVisibility);

    lockGestures();
    registerSW();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})(window.SP = window.SP || {});
