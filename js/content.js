/*
 * content.js — all the data SmashPad draws from, plus a few tiny helpers.
 * Everything hangs off a single global: window.SP
 * (Classic script, no imports, so it works when you double-click index.html.)
 */
(function (SP) {
  "use strict";

  // Bright, friendly palette (iOS-ish system colors).
  SP.COLORS = [
    "#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#00C7BE", "#30B0C7",
    "#0A84FF", "#5E5CE6", "#BF5AF2", "#FF2D55", "#FF6B9D", "#A2FF86", "#FFD60A"
  ];

  // Human-readable color names, keyed by hex, for the Colors & Shapes mode.
  SP.COLOR_NAMES = {
    "#FF3B30": "Red", "#FF9500": "Orange", "#FFCC00": "Yellow", "#34C759": "Green",
    "#00C7BE": "Teal", "#30B0C7": "Sky", "#0A84FF": "Blue", "#5E5CE6": "Indigo",
    "#BF5AF2": "Purple", "#FF2D55": "Pink", "#FF6B9D": "Rose", "#A2FF86": "Lime",
    "#FFD60A": "Gold"
  };

  SP.SHAPES = ["circle", "star", "triangle", "heart", "square", "ring", "diamond"];

  SP.SHAPE_NAMES = {
    circle: "Circle", star: "Star", triangle: "Triangle", heart: "Heart",
    square: "Square", ring: "Ring", diamond: "Diamond"
  };

  // General grab-bag of emojis for Free Play floaters.
  SP.EMOJIS = [
    "🐶","🐱","🦄","🐸","🐙","🦋","🌈","⭐","🌟","✨","🎈","🎉","🍭","🍩",
    "🐝","🐳","🦁","🐼","🐧","🚀","🌸","💫","🎨","🐢","🦖","🦕","🐬","🌻",
    "🍎","🎸","🎁","🦉","🐰","🐨","🍓","🌵","🐥","🎪","🪁","🍦"
  ];

  // A -> a simple, familiar word (Alphabet mode).
  SP.LETTER_WORDS = {
    A:"Apple", B:"Ball", C:"Cat", D:"Dog", E:"Egg", F:"Fish", G:"Grapes",
    H:"Hat", I:"Ice cream", J:"Jam", K:"Kite", L:"Leaf", M:"Moon", N:"Nest",
    O:"Orange", P:"Pig", Q:"Queen", R:"Rain", S:"Sun", T:"Tree", U:"Umbrella",
    V:"Van", W:"Whale", X:"Xylophone", Y:"Yo-yo", Z:"Zebra"
  };

  // A -> animal + matching emoji (Animal ABC mode).
  SP.LETTER_ANIMALS = {
    A:{word:"Alligator", emoji:"🐊"}, B:{word:"Bear", emoji:"🐻"},
    C:{word:"Cat", emoji:"🐱"},       D:{word:"Dog", emoji:"🐶"},
    E:{word:"Elephant", emoji:"🐘"},  F:{word:"Fox", emoji:"🦊"},
    G:{word:"Giraffe", emoji:"🦒"},   H:{word:"Horse", emoji:"🐴"},
    I:{word:"Iguana", emoji:"🦎"},    J:{word:"Jellyfish", emoji:"🪼"},
    K:{word:"Koala", emoji:"🐨"},     L:{word:"Lion", emoji:"🦁"},
    M:{word:"Monkey", emoji:"🐵"},    N:{word:"Newt", emoji:"🦎"},
    O:{word:"Owl", emoji:"🦉"},       P:{word:"Penguin", emoji:"🐧"},
    Q:{word:"Quail", emoji:"🐦"},     R:{word:"Rabbit", emoji:"🐰"},
    S:{word:"Snake", emoji:"🐍"},     T:{word:"Tiger", emoji:"🐯"},
    U:{word:"Unicorn", emoji:"🦄"},   V:{word:"Vulture", emoji:"🦅"},
    W:{word:"Whale", emoji:"🐳"},     X:{word:"Fox (X)", emoji:"🦊"},
    Y:{word:"Yak", emoji:"🐂"},       Z:{word:"Zebra", emoji:"🦓"}
  };

  // Number words 0–20 for Counting mode.
  SP.NUMBER_WORDS = [
    "Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
    "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen",
    "Eighteen","Nineteen","Twenty"
  ];

  // Cute objects to count in Numbers mode.
  SP.COUNT_EMOJIS = ["🍎","⭐","🎈","🐟","🌸","🍪","🐝","🚗","⚽","🍓"];

  // ---- tiny helpers ----
  SP.rand  = function (a, b) { return a + Math.random() * (b - a); };
  SP.pick  = function (arr) { return arr[(Math.random() * arr.length) | 0]; };
  SP.randInt = function (a, b) { return a + ((Math.random() * (b - a + 1)) | 0); };

})(window.SP = window.SP || {});
