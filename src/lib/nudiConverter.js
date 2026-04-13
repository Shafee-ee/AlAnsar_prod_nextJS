// /lib/nudiConverterV7.js

export function convertNudiToUnicode(text) {
  if (!text) return "";

  // prevent re-processing Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) {
    return text;
  }

  // =========================
  // 1️⃣ Conjunct clusters
  // =========================
  const CLUSTERS = {
    // core encoding clusters (learned from your data)
    æljr: "ಭೂ",
    '<jrÚj"': "ನೂರು",
    "')Û}'": "'ಏಡ್‌'",
    ÔjÈà: "ಗ್ರಂ",
    "èj<jr‹": "ಳನ್ನೂ",
    "Ôj èj<jr‹": "ಗಳನ್ನೂ",

    // existing valid conjuncts
    "=jÈ'": "ಪ್ರ",
    ":jÈ": "ತ್ರ",
    "ù‰": "ಕ್ತ",
    Pš: "ಲ್ಲ",
    "<j‹": "ನ್ನ",
    "D‰": "ಸ್ತ",
    jbš: "ಲ್ಲಿ",

    ";nkj": "ಥ",
    ";nk": "ಥ",

    // small but valid
    "r‹": "ೂ",
    Ôj: "ಗ",

    "Ôjèj<jr‹": "ಗಳನ್ನೂ",
  };

  // =========================
  // 2️⃣ Full syllable tokens
  // =========================
  const FULL = {
    Y: "ರಿ",
    Z: "ಡಿ",
    d: "ಸಿ",
    R: "ಕಿ",
    "\\": "ತಿ",
    "|": "ತೀ",
    b: "ಲಿ",
    ú: "ಕೆ",
    èjr: "ಳೂ",
    'O""': "ಯು",
    'Új<j"‹': "ರನ್ನು",
    'fO""': "ಳಿಯು",
    ä: "ವಿ",
  };

  // =========================
  // 3️⃣ Base consonants
  // =========================
  const BASE = {
    Aj: "ವ",
    Ao: "ವಾ",
    'Aj"': "ಮ",
    Új: "ರ",
    Ôj: "ಗ",
    Bj: "ಶ",
    ";k": "ಧ",
    "<j": "ನ",
    ù: "ಕ",
    ":": "ತ",
    P: "ಲ",
    D: "ಸ",
    N: "ಬ",
    ";": "ದ",
    æl: "ಭ",
    "^Ao": "ನಿ",
    Dj: "ಸ",
    I: "ಜ",
    T: "ಗಿ",
    È: "ರ",
    è: "ಳ",
  };

  // =========================
  // 4️⃣ Vowel modifiers
  // =========================
  const VOWEL = {
    '"': "ು",
    ur: "ೊ",
    o: "ಾ",
    u: "ೇ",
    ã: "ೈ",
    z: "ೌ",
    0: "ಂ",
    "/": "ಃ",
    û: "ು",
    à: "ಂ",
  };

  // =========================
  // 5️⃣ Independent vowels
  // =========================
  const INDEPENDENT = {
    "!": "ಅ",
    q: "ಆ",
    "#": "ಇ",
    $: "ಈ",
    "%": "ಉ",
    "&": "ಊ",
    "(": "ಎ",
    ")": "ಏ",
    "+": "ಒ",
    ø: "ಓ",
    ò: "ಔ",
    "!à": "ಅಂ",
    "!/": "ಅಃ",
  };

  const clusterKeys = Object.keys(CLUSTERS).sort((a, b) => b.length - a.length);
  const fullKeys = Object.keys(FULL).sort((a, b) => b.length - a.length);
  const baseKeys = Object.keys(BASE).sort((a, b) => b.length - a.length);
  const vowelKeys = Object.keys(VOWEL).sort((a, b) => b.length - a.length);

  let i = 0;
  let output = "";

  while (i < text.length) {
    console.log(i, text[i], text.slice(i, i + 5));
    let matched = false;

    // 1️⃣ clusters
    for (const key of clusterKeys) {
      if (text.startsWith(key, i)) {
        output += CLUSTERS[key];
        i += key.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // 2️⃣ full syllables
    for (const key of fullKeys) {
      if (text.startsWith(key, i)) {
        output += FULL[key];
        i += key.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // ✅ GLOBAL joiner
    if (text[i] === "j") {
      i++; // skip joiner
      continue;
    }

    // ✅ GLOBAL backward vowel (FIXED)
    if (text[i] === "r") {
      if (output.length > 0) {
        output = output.slice(0, -1) + output.slice(-1) + "ೂ";
      }
      i++;
      continue;
    }

    // 3️⃣ base + vowel
    for (const key of baseKeys) {
      if (text.startsWith(key, i)) {
        let char = BASE[key];
        i += key.length;

        // forward vowels
        for (const vKey of vowelKeys) {
          if (text.startsWith(vKey, i)) {
            char += VOWEL[vKey];
            i += vKey.length;
            break;
          }
        }

        output += char;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // 4️⃣ independent vowels
    const single = text[i];
    if (INDEPENDENT[single]) {
      output += INDEPENDENT[single];
      i++;
      continue;
    }

    // 5️⃣ fallback
    if (single !== undefined) {
      output += single;
    }
    i++;
  }
  output = output.replace(/\bಗ ಳನ್ನೂ\b/g, "ಗಳನ್ನೂ");
  return output;
}
