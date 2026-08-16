/*
 * modes.js — defines what each mode does on a "smash".
 * Every mode exposes smash(x, y, info) where info = { key, isLetter, char }.
 * info.key is the raw event key (may be empty for mouse clicks).
 * Returns an optional sound frequency (or null) so app.js can play the right note.
 */
(function (SP) {
  "use strict";

  var Stage = null; // wired in init
  function burst(x, y, min, max) {
    var n = SP.Stage.REDUCED ? 8 : SP.randInt(min, max);
    for (var i = 0; i < n; i++) SP.Stage.addParticle(x, y);
  }

  // Free Play — pure chaos: big letter (or emoji), particles, floating emojis.
  function freePlay(x, y, info) {
    if (info.isLetter) SP.Stage.addGlyph(x, y, info.char.toUpperCase(), true);
    else SP.Stage.addGlyph(x, y, SP.pick(SP.EMOJIS), false);
    burst(x, y, 16, 30);
    var f = SP.Stage.REDUCED ? 1 : SP.randInt(1, 3);
    for (var i = 0; i < f; i++) SP.Stage.addFloater(x, y);
    return null;
  }

  // Pick a letter: use the pressed one if it's A–Z, else a random letter.
  function letterFor(info) {
    if (info.isLetter && /^[a-zA-Z]$/.test(info.char)) return info.char.toUpperCase();
    return String.fromCharCode(65 + SP.randInt(0, 25));
  }

  // Alphabet — big letter + "Apple" style word.
  function alphabet(x, y, info) {
    var L = letterFor(info);
    var word = SP.LETTER_WORDS[L] || "";
    var color = SP.pick(SP.COLORS);
    SP.Stage.addGlyph(x, y, L, true, { color: color, size: 200 });
    SP.Stage.addLabel(x, y + SP.Stage.u(130), L + " · " + word, color);
    burst(x, y, 12, 22);
    return SP.Sound.noteForLetter(L);
  }

  // Animal ABC — "A is for Alligator" + the animal emoji.
  function animalABC(x, y, info) {
    var L = letterFor(info);
    var a = SP.LETTER_ANIMALS[L];
    var color = SP.pick(SP.COLORS);
    SP.Stage.addGlyph(x, y - SP.Stage.u(30), L, true, { color: color, size: 170 });
    SP.Stage.addFloater(x, y - SP.Stage.u(20), a.emoji);
    SP.Stage.addLabel(x, y + SP.Stage.u(120), L + " is for " + a.word, color);
    burst(x, y, 12, 20);
    return SP.Sound.noteForLetter(L);
  }

  // Numbers & Counting — a digit plus that many objects to count.
  function numbers(x, y, info) {
    var n;
    if (info.char && /^[0-9]$/.test(info.char)) n = parseInt(info.char, 10);
    else n = SP.randInt(1, 9);
    if (n === 0) n = SP.randInt(1, 9); // zero is hard to "count", keep it lively
    var color = SP.pick(SP.COLORS);
    var emoji = SP.pick(SP.COUNT_EMOJIS);
    SP.Stage.addGlyph(x, y - SP.Stage.u(60), String(n), true, { color: color, size: 190 });
    SP.Stage.addLabel(x, y + SP.Stage.u(60), SP.NUMBER_WORDS[n], color);
    SP.Stage.addCountRow(x, y + SP.Stage.u(130), n, emoji);
    burst(x, y, 8, 16);
    // pitch rises with the number
    return 261.63 * Math.pow(2, n / 12);
  }

  // Colors & Shapes — one big shape, named ("Red Star").
  function colorsShapes(x, y, info) {
    var color = SP.pick(SP.COLORS);
    var shape = SP.pick(SP.SHAPES);
    // one large hero shape...
    SP.Stage.addParticleBig(x, y, shape, color);
    SP.Stage.addLabel(x, y + SP.Stage.u(120), SP.COLOR_NAMES[color] + " " + SP.SHAPE_NAMES[shape], color);
    // ...surrounded by a little matching-color burst
    for (var i = 0; i < (SP.Stage.REDUCED ? 6 : 14); i++) SP.Stage.addParticle(x, y);
    return null;
  }

  SP.Modes = {
    // id -> { label, emoji, smash }
    list: [
      { id: "free",    label: "Free Play",       emoji: "🎉", smash: freePlay },
      { id: "abc",     label: "Alphabet",        emoji: "🔤", smash: alphabet },
      { id: "animals", label: "Animal ABC",      emoji: "🦁", smash: animalABC },
      { id: "numbers", label: "Numbers",         emoji: "🔢", smash: numbers },
      { id: "colors",  label: "Colors & Shapes", emoji: "🎨", smash: colorsShapes }
    ],
    byId: function (id) {
      var l = this.list;
      for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
      return l[0];
    }
  };

})(window.SP = window.SP || {});
