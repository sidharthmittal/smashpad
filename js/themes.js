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
    // id -> { label, emoji (picker chip), floaters (emoji pool, null = default) }
    list: [
      { id: "rainbow", label: "Rainbow", emoji: "🌈", floaters: null },
      { id: "space",   label: "Space",   emoji: "🚀",
        floaters: ["🚀","🪐","⭐","🌟","🌙","👽","🛸","☄️","✨","🌍","💫","🌠","🌌","🔭"] },
      { id: "ocean",   label: "Ocean",   emoji: "🌊",
        floaters: ["🐠","🐙","🐋","🐬","🦀","🐚","🌊","🐳","🦑","🐢","🐟","🦈","🪸","⭐"] },
      { id: "kawaii",  label: "Kawaii",  emoji: "🌸",
        floaters: ["🌸","💖","🧸","🍭","🦄","🌈","🧁","🎀","🍰","⭐","💕","🌷","🍓","🐰"] }
    ],
    byId: function (id) {
      var l = this.list;
      for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
      return l[0];
    }
  };

  // The emoji pool the engine should draw floaters from right now. app.js sets
  // SP.themeFloaters when a theme is applied; falls back to the general set.
  SP.floaterPool = function () {
    return (SP.themeFloaters && SP.themeFloaters.length) ? SP.themeFloaters : SP.EMOJIS;
  };

})(window.SP = window.SP || {});
