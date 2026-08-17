/*
 * sprites.js — the canvas engine: particles, big glyphs, floating emojis,
 * a mouse sparkle trail, plus a little "count row" for Numbers mode.
 * Exposes SP.Stage.
 */
(function (SP) {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MAX_SPRITES = REDUCED ? 400 : 1500;

  var canvas, ctx;
  var W = 0, H = 0, DPR = 1, SCALE = 1;
  var sprites = [];

  // SCALE keeps things readable across a phone, tablet, and a big TV.
  // Reference is a ~900px-min-side screen = scale 1; smaller shrinks, bigger grows (capped).
  function computeScale() {
    var minSide = Math.min(W, H);
    SCALE = Math.max(0.5, Math.min(1.8, minSide / 900));
  }
  // Public unit helper for modes.js so offsets scale too.
  function u(px) { return px * SCALE; }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    computeScale();
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // ---- sprite factories ----
  function addGlyph(x, y, text, isLetter, opts) {
    if (sprites.length > MAX_SPRITES) return;
    opts = opts || {};
    sprites.push({
      kind: "glyph", x: x, y: y, text: text, isLetter: isLetter,
      color: opts.color || SP.pick(SP.COLORS),
      size: (opts.size || (isLetter ? SP.rand(130, 210) : SP.rand(90, 150))) * SCALE,
      rot: REDUCED ? 0 : SP.rand(-0.22, 0.22),
      vr: REDUCED ? 0 : SP.rand(-0.5, 0.5),
      vy: SP.rand(-24, -54), vx: SP.rand(-12, 12),
      age: 0, life: REDUCED ? 950 : 1350
    });
  }

  // A caption under the last glyph (e.g. "A is for Apple", "Red Star").
  function addLabel(x, y, text, color) {
    if (sprites.length > MAX_SPRITES) return;
    sprites.push({
      kind: "label", x: x, y: y, text: text,
      color: color || "#ffffff",
      size: SP.rand(34, 44) * SCALE,
      rot: 0, vr: 0, vy: -18, vx: 0,
      age: 0, life: REDUCED ? 1100 : 1600
    });
  }

  function addParticle(x, y) {
    if (sprites.length > MAX_SPRITES) return;
    var ang = SP.rand(0, Math.PI * 2);
    var spd = SP.rand(90, REDUCED ? 220 : 520);
    sprites.push({
      kind: "particle", shape: SP.pick(SP.SHAPES), x: x, y: y,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - SP.rand(20, 90),
      g: 900, color: SP.pick(SP.COLORS),
      size: SP.rand(10, 30) * SCALE, rot: SP.rand(0, Math.PI * 2),
      vr: REDUCED ? 0 : SP.rand(-8, 8),
      age: 0, life: SP.rand(700, REDUCED ? 900 : 1300)
    });
  }

  // opts (all optional): { size, jitter:false to center it, vx, vy, life }
  function addFloater(x, y, emoji, opts) {
    if (sprites.length > MAX_SPRITES) return;
    opts = opts || {};
    var jx = opts.jitter === false ? 0 : SP.rand(-40, 40);
    var jy = opts.jitter === false ? 0 : SP.rand(-30, 30);
    sprites.push({
      kind: "floater", text: emoji || SP.pick(SP.floaterPool ? SP.floaterPool() : SP.EMOJIS),
      x: x + jx, y: y + jy,
      vx: opts.vx != null ? opts.vx : SP.rand(-30, 30),
      vy: opts.vy != null ? opts.vy : SP.rand(-40, -90),
      size: (opts.size || SP.rand(46, 84)) * SCALE,
      rot: REDUCED ? 0 : SP.rand(-0.4, 0.4),
      vr: REDUCED ? 0 : SP.rand(-1.2, 1.2),
      age: 0, life: opts.life || (REDUCED ? 1000 : 1500)
    });
  }

  // A soft additive glow blob (used for the trail bloom + sparkle cores).
  function addGlow(x, y, color, size, life) {
    if (sprites.length > MAX_SPRITES) return;
    sprites.push({
      kind: "glow", x: x, y: y,
      vx: SP.rand(-14, 14), vy: SP.rand(-22, -4),
      g: 0, color: color || "#ffffff",
      size: size * SCALE, rot: 0, vr: 0,
      age: 0, life: life || 520
    });
  }

  // A prettier finger/mouse trail: a glowing bloom plus a little burst of
  // bigger, varied, theme-coloured shapes that drift out and fade. Called as
  // the pointer moves (throttled in app.js), so keep each call fairly light.
  var TRAIL_SHAPES = ["star", "heart", "diamond", "circle", "star", "ring"];
  function addSparkle(x, y) {
    if (sprites.length > MAX_SPRITES) return;
    var pool = SP.trailColors ? SP.trailColors() : SP.COLORS;

    // 1) soft glow bloom that lingers under everything
    addGlow(x, y, SP.pick(pool), SP.rand(46, 74), SP.rand(360, 560));

    // 2) a small burst of bigger, spinning shapes flying outward
    var n = REDUCED ? 2 : SP.randInt(3, 5);
    for (var i = 0; i < n; i++) {
      var ang = SP.rand(0, Math.PI * 2);
      var spd = SP.rand(60, 220);
      sprites.push({
        kind: "particle", shape: SP.pick(TRAIL_SHAPES), x: x, y: y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - SP.rand(10, 50),
        g: 140, color: SP.pick(pool),
        size: SP.rand(16, 34) * SCALE, rot: SP.rand(0, Math.PI * 2),
        vr: REDUCED ? 0 : SP.rand(-7, 7),
        glowStroke: true,
        age: 0, life: SP.rand(450, 820)
      });
    }
  }

  // One big hero shape (used by Colors & Shapes mode).
  function addParticleBig(x, y, shape, color) {
    if (sprites.length > MAX_SPRITES) return;
    sprites.push({
      kind: "particle", shape: shape, x: x, y: y,
      vx: SP.rand(-20, 20), vy: SP.rand(-40, -10),
      g: 260, color: color,
      size: SP.rand(150, 210) * SCALE, rot: SP.rand(-0.3, 0.3),
      vr: REDUCED ? 0 : SP.rand(-1.5, 1.5),
      age: 0, life: REDUCED ? 1100 : 1600
    });
  }

  // A neat row of N emojis to count, centred on x. Shrinks the gap if it would
  // run off the screen edges (so big counts still fit on a phone).
  function addCountRow(x, y, n, emoji) {
    var gap = 62 * SCALE;
    var maxWidth = W * 0.9;
    if ((n - 1) * gap > maxWidth) gap = maxWidth / Math.max(1, n - 1);
    var startX = x - ((n - 1) * gap) / 2;
    // keep the whole row on screen horizontally
    var half = ((n - 1) * gap) / 2;
    startX = Math.max(half + 30, Math.min(W - half - 30, x)) - half;
    for (var i = 0; i < n; i++) {
      if (sprites.length > MAX_SPRITES) break;
      sprites.push({
        kind: "floater", text: emoji, x: startX + i * gap, y: y,
        vx: 0, vy: -14, size: 48 * SCALE, rot: 0, vr: 0,
        age: 0, life: REDUCED ? 1200 : 1800,
        popDelay: i * 60 // gentle staggered pop-in
      });
    }
  }

  // ---- drawing ----
  // A soft additive glow blob (radial gradient), for the trail bloom.
  function drawGlow(s, alpha) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";   // additive → pretty light blooms
    ctx.globalAlpha = alpha;
    var r = s.size;
    var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
    g.addColorStop(0, s.color);
    g.addColorStop(0.5, hexToRgba(s.color, 0.35));
    g.addColorStop(1, hexToRgba(s.color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // #RRGGBB -> rgba() with the given alpha (trail colours are always hex).
  function hexToRgba(hex, a) {
    var h = hex.charAt(0) === "#" ? hex.slice(1) : hex;
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    return "rgba(" + ((n>>16)&255) + "," + ((n>>8)&255) + "," + (n&255) + "," + a + ")";
  }

  function drawShape(s, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    // A soft glow halo behind trail shapes so they read as sparkly, not flat.
    if (s.glowStroke) { ctx.shadowColor = s.color; ctx.shadowBlur = Math.max(8, s.size * 0.6); }
    ctx.fillStyle = s.color;
    var r = s.size;
    ctx.beginPath();
    switch (s.shape) {
      case "circle": ctx.arc(0, 0, r / 2, 0, Math.PI * 2); ctx.fill(); break;
      case "square": ctx.fillRect(-r/2, -r/2, r, r); break;
      case "ring":
        ctx.lineWidth = Math.max(3, r/4); ctx.strokeStyle = s.color;
        ctx.arc(0, 0, r/2, 0, Math.PI*2); ctx.stroke(); break;
      case "triangle":
        ctx.moveTo(0, -r/2); ctx.lineTo(r/2, r/2); ctx.lineTo(-r/2, r/2);
        ctx.closePath(); ctx.fill(); break;
      case "diamond":
        ctx.moveTo(0, -r/2); ctx.lineTo(r/2, 0); ctx.lineTo(0, r/2); ctx.lineTo(-r/2, 0);
        ctx.closePath(); ctx.fill(); break;
      case "heart": {
        var k = r / 2;
        ctx.moveTo(0, k*0.35);
        ctx.bezierCurveTo(k, -k*0.6, k*1.3, k*0.4, 0, k);
        ctx.bezierCurveTo(-k*1.3, k*0.4, -k, -k*0.6, 0, k*0.35);
        ctx.fill(); break;
      }
      case "star": {
        var spikes = 5, outer = r/2, inner = r/4;
        for (var i = 0; i < spikes * 2; i++) {
          var rad = i % 2 === 0 ? outer : inner;
          var a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
          ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath(); ctx.fill(); break;
      }
    }
    ctx.restore();
  }

  function drawText(s, alpha, scale) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.scale(scale, scale);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (s.kind === "glyph" && s.isLetter) {
      ctx.font = '900 ' + s.size + 'px -apple-system, "Segoe UI", system-ui, sans-serif';
      ctx.lineWidth = Math.max(4, s.size * 0.06);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.strokeText(s.text, 0, 0);
      ctx.fillStyle = s.color;
      ctx.fillText(s.text, 0, 0);
    } else if (s.kind === "label") {
      ctx.font = '800 ' + s.size + 'px -apple-system, "Segoe UI", system-ui, sans-serif';
      ctx.lineWidth = Math.max(4, s.size * 0.14);
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.strokeText(s.text, 0, 0);
      ctx.fillStyle = s.color;
      ctx.fillText(s.text, 0, 0);
    } else {
      ctx.font = s.size + 'px -apple-system, "Segoe UI", system-ui, sans-serif';
      ctx.fillText(s.text, 0, 0);
    }
    ctx.restore();
  }

  function step(dt) {
    ctx.clearRect(0, 0, W, H);
    for (var i = sprites.length - 1; i >= 0; i--) {
      var s = sprites[i];
      s.age += dt * 1000;

      // staggered pop-in for count rows
      if (s.popDelay && s.age < s.popDelay) continue;
      var localAge = s.popDelay ? s.age - s.popDelay : s.age;
      var life = localAge / s.life;
      if (life >= 1) { sprites.splice(i, 1); continue; }

      if (s.kind === "particle") s.vy += s.g * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rot += (s.vr || 0) * dt;

      var alpha = life < 0.6 ? 1 : 1 - (life - 0.6) / 0.4;

      if (s.kind === "glow") {
        // grow slightly as it fades for a soft bloom-out
        var gs = { x: s.x, y: s.y, color: s.color, size: s.size * (1 + life * 0.6) };
        drawGlow(gs, alpha * 0.9);
      } else if (s.kind === "particle") {
        drawShape(s, alpha);
      } else {
        var scale = 1;
        if (life < 0.16) scale = 1.2 * (life / 0.16);
        else if (life < 0.3) scale = 1.2 - 0.2 * ((life - 0.16) / 0.14);
        drawText(s, alpha, scale);
      }
    }
  }

  SP.Stage = {
    REDUCED: REDUCED,
    init: function () {
      canvas = document.getElementById("stage");
      ctx = canvas.getContext("2d");
      window.addEventListener("resize", resize);
      resize();
    },
    size: function () { return { w: W, h: H }; },
    u: u,
    scale: function () { return SCALE; },
    step: step,
    clear: function () { sprites.length = 0; if (ctx) ctx.clearRect(0, 0, W, H); },
    count: function () { return sprites.length; },
    // factories exposed for modes.js
    addGlyph: addGlyph, addLabel: addLabel, addParticle: addParticle,
    addParticleBig: addParticleBig, addGlow: addGlow,
    addFloater: addFloater, addSparkle: addSparkle, addCountRow: addCountRow
  };

})(window.SP = window.SP || {});
