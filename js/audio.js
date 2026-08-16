/*
 * audio.js — optional cheerful sounds, generated live with Web Audio.
 * No audio files, so it works offline. SP.Sound.pluck() is a no-op until init().
 */
(function (SP) {
  "use strict";

  var actx = null, master = null;

  // A happy major-pentatonic spread over a few octaves.
  var SCALE = [];
  var base = [0, 2, 4, 7, 9]; // semitone offsets
  for (var oct = 0; oct < 4; oct++) {
    for (var i = 0; i < base.length; i++) {
      SCALE.push(261.63 * Math.pow(2, (base[i] + oct * 12) / 12));
    }
  }
  var WAVES = ["triangle", "sine", "square"];

  SP.Sound = {
    init: function () {
      if (actx) return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = new AC();
      var comp = actx.createDynamicsCompressor(); // stop rapid mashing from clipping
      master = actx.createGain();
      master.gain.value = 0.9;
      master.connect(comp);
      comp.connect(actx.destination);
    },

    resume: function () { if (actx && actx.state === "suspended") actx.resume(); },

    // A short plucky note. Optional `freq` lets modes play a rising scale.
    pluck: function (freq) {
      if (!actx) return;
      var now = actx.currentTime;
      var f = freq || SCALE[(Math.random() * SCALE.length) | 0];
      var osc = actx.createOscillator();
      var g = actx.createGain();
      osc.type = WAVES[(Math.random() * WAVES.length) | 0];
      osc.frequency.value = f;
      osc.detune.value = (Math.random() * 24) - 12;

      var peak = 0.16;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(g); g.connect(master);
      osc.start(now);
      osc.stop(now + 0.32);
    },

    // Map a letter A–Z to a rising pitch, so the alphabet "sings" upward.
    noteForLetter: function (ch) {
      var idx = ch.toUpperCase().charCodeAt(0) - 65;
      if (idx < 0 || idx > 25) return null;
      return SCALE[idx % SCALE.length];
    }
  };

})(window.SP = window.SP || {});
