/*
 * device.js — figure out what kind of device we're on so the UI can adapt.
 * Exposes SP.Device.
 */
(function (SP) {
  "use strict";

  function mm(q) { try { return window.matchMedia && window.matchMedia(q).matches; } catch (_) { return false; } }

  var coarse = mm("(pointer: coarse)");
  var fine   = mm("(pointer: fine)");
  var touch  = coarse || (navigator.maxTouchPoints || 0) > 0 || ("ontouchstart" in window);

  SP.Device = {
    touch: touch,
    fine: fine,
    // Keyboard-capable if there's a fine pointer (desktop/laptop/trackpad) or no touch at all.
    keyboard: fine || !touch,
    // Running as an installed PWA?
    standalone: mm("(display-mode: fullscreen)") || mm("(display-mode: standalone)") ||
                navigator.standalone === true,
    reduced: mm("(prefers-reduced-motion: reduce)"),

    // Gentle haptic tick (Android; silently ignored elsewhere / under reduced motion).
    buzz: function (ms) {
      if (SP.Device.reduced) return;
      try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (_) {}
    }
  };

})(window.SP = window.SP || {});
