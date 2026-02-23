export function analyzeNudi(text) {
    const charFreq = {};
    const bigramFreq = {};
    const trigramFreq = {};

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        charFreq[c] = (charFreq[c] || 0) + 1;
    }

    for (let i = 0; i < text.length - 1; i++) {
        const bg = text.slice(i, i + 2);
        bigramFreq[bg] = (bigramFreq[bg] || 0) + 1;
    }

    for (let i = 0; i < text.length - 2; i++) {
        const tg = text.slice(i, i + 3);
        trigramFreq[tg] = (trigramFreq[tg] || 0) + 1;
    }

    return {
        charFreq,
        bigramFreq,
        trigramFreq
    };
}