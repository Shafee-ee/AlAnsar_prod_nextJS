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
    "=jÈ'": "ಪ್ರ",
    ":jÈ": "ತ್ರ",
    "ù‰": "ಕ್ತ",
    Pš: "ಲ್ಲ",
    "<j‹": "ನ್ನ",
    "D‰": "ಸ್ತ",
    jbš: "ಲ್ಲಿ",

    ";nkj": "ಥ",
    ";nk": "ಥ",

    // High-frequency QnA patterns
    '%Ôj"Y<j': "ಉಗುರಿನ",
    "æloÔj;jbš": "ಭಾಗದಲ್ಲಿ",
    'úDjÚj<j"‹': "ಕೆಸರನ್ನು",
    Ajûèjr: "ವುಳೂ",
    "Do‹<j;j": "ಸ್ನಾನದ",
    "Au|èu": "ವೇಳೆ",
    "^AoYDjæu|ú|": "ನಿವಾರಿಸಬೇಕೇ",
    "Úurà]Ôu": "ರೊಂದಿಗೆ",
    "Do‹ನ": "ಸ್ನಾನ",
    'àಧ"': "ಂಧು",
    'Au"ã': "ಮೈ",
    "ÓoರL]àದ": "ಕಾರಣದಿಂದ",
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
    Auತೀèu: "ವೇಳೆ",
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
    '"r': "ೂ",
    '"': "ು",
    ur: "ೊ",
    o: "ಾ",
    u: "ೇ",
    ã: "ೈ",
    z: "ೌ",
    0: "ಂ",
    "/": "ಃ",
    û: "ು",
    "r‹": "ೂ",
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

    // GLOBAL joiner handling (CRITICAL FIX)
    if (text[i] === "j") {
      // attach halant to previous character
      if (output.length > 0) {
        output += "್";
      }
      i++;
      continue;
    }

    // 3️⃣ base handling (FIXED)
    for (const key of baseKeys) {
      // prevent breaking cluster
      if (text.startsWith("<j‹", i)) continue;

      if (text.startsWith(key, i)) {
        let char = BASE[key];
        i += key.length;

        // vowel
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

      console.log(i, text[i], text.slice(i, i + 5));
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

  return output;
}
