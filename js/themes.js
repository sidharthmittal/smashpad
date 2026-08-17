/*
 * themes.js — swappable visual themes. Each theme changes the background
 * (via a body[data-theme] CSS rule in styles.css) and biases the floating
 * emoji pool. The bright rainbow glyph/particle palette (SP.COLORS) is kept
 * across all themes: it reads well on every dark background AND keeps the
 * Colors & Shapes mode's colour names correct (they're keyed to those hexes).
 * Exposes SP.Themes + SP.floaterPool(). Loads before app.js.
 */
(function (SP) {
  "use strict";

  SP.Themes = {
    // id -> { label, emoji (picker chip), floaters (emoji pool, null = default),
    //         trail (finger/mouse trail colours, null = full rainbow palette) }
    list: [
      { id: "rainbow", label: "Rainbow", emoji: "🌈", floaters: null, trail: null },
      { id: "space",   label: "Space",   emoji: "🚀",
        floaters: ["🚀","🪐","⭐","🌟","🌙","👽","🛸","☄️","✨","🌍","💫","🌠","🌌","🔭"],
        trail: ["#ffffff","#cfe0ff","#9db4ff","#7aa0ff","#c8b4ff","#ffe27a"] },
      { id: "ocean",   label: "Ocean",   emoji: "🌊",
        floaters: ["🐠","🐙","🐋","🐬","🦀","🐚","🌊","🐳","🦑","🐢","🐟","🦈","🪸","⭐"],
        trail: ["#7ef0ff","#37d0e6","#00c7be","#4fd1ff","#a8f0ff","#e6fbff"] },
      { id: "kawaii",  label: "Kawaii",  emoji: "🌸",
        floaters: ["🌸","💖","🧸","🍭","🦄","🌈","🧁","🎀","🍰","⭐","💕","🌷","🍓","🐰"],
        trail: ["#ff9ecb","#ff6b9d","#ffd0ec","#c8a2ff","#ffb3de","#fff0f7"] }
    ],
    byId: function (id) {
      var l = this.list;
      for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
      return l[0];
    }
  };

  // Colours the finger/mouse trail should use right now. app.js sets
  // SP.themeTrail on theme apply; falls back to the full bright palette.
  SP.trailColors = function () {
    return (SP.themeTrail && SP.themeTrail.length) ? SP.themeTrail : SP.COLORS;
  };

  // The emoji pool the engine should draw floaters from right now. app.js sets
  // SP.themeFloaters when a theme is applied; falls back to the general set.
  SP.floaterPool = function () {
    return (SP.themeFloaters && SP.themeFloaters.length) ? SP.themeFloaters : SP.EMOJIS;
  };

})(window.SP = window.SP || {});
