import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { generateEmbedding } from "@/lib/vertexEmbedding";
import { translateText } from "@/lib/translate";

function normalize(s = "") {
    return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function looksLikeEnglish(text = "") {
    const q = normalize(text);

    const englishMarkers = [
        "how", "what", "when", "why",
        "where", "who", "is", "are",
        "can", "do", "does"
    ];

    return englishMarkers.some(word => q.startsWith(word));
}

function hasValidIntent(query = "") {
    const q = normalize(query);

    if (q.length < 8) return false;

    const words = q.split(" ");
    if (words.length < 2) return false;

    return true;
}



function cosine(a = [], b = []) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}
export async function POST(req) {
    const { query, lang = "en", excludeId } = await req.json();

    if (!query?.trim()) {
        return NextResponse.json({ success: false });
    }

    const qNorm = normalize(query);
    const isKeywordQuery = qNorm.split(" ").length === 1;
    const isLongQuery = qNorm.length > 80;

    const snap = await adminDB.collection("qna_items").get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));



    const exactMatchItem = items.find(item => {
        const qEN = normalize(item.question_en || "");
        const qKN = normalize(item.question_kn || "");
        return qEN === qNorm || qKN === qNorm;
    });

    if (exactMatchItem) {
        return NextResponse.json({
            success: true,
            bestMatch: {
                id: exactMatchItem.id,
                question:
                    lang === "kn"
                        ? exactMatchItem.question_kn
                        : exactMatchItem.question_en,
                answer:
                    lang === "kn"
                        ? exactMatchItem.answer_kn
                        : exactMatchItem.answer_en,
                score: 1,
                editorNote_en: exactMatchItem.editorNote_en || "",
                editorNote_kn: exactMatchItem.editorNote_kn || "",
            },
            related: [],
        });
    }


    // Intent gate ONLY for English full questions
    if (
        lang === "en" &&
        !isKeywordQuery &&
        !hasValidIntent(query)
    ) {
        return NextResponse.json({
            success: true,
            noMatch: true,
            reason: "invalid_intent",
        });
    }

    let embeddingText = query;




    const shouldTranslate =
        lang === "kn" || !looksLikeEnglish(query);

    if (shouldTranslate) {
        const translated = await translateText(query, "en");
        if (translated) {
            embeddingText = translated;
        }
    }

    console.log("Lang:", lang);
    console.log("looksLikeEnglish:", looksLikeEnglish(query));
    console.log("shouldTranslate:", shouldTranslate);

    console.log("Original query:", query);
    console.log("Embedding text:", embeddingText);

    const queryEmbedding = await generateEmbedding(embeddingText);



    if (!queryEmbedding.length) {
        return NextResponse.json({ success: false });
    }



    const scored = items.map(item => {
        const question =
            lang === "kn" ? item.question_kn : item.question_en;

        if (!question || !item.embedding) {
            return { ...item, rankScore: 0, confidenceScore: 0 };
        }

        const itemNorm = normalize(question);


        const confidenceScore = cosine(queryEmbedding, item.embedding);

        let rankScore = confidenceScore;

        if (itemNorm === qNorm) rankScore += 0.3;
        else if (itemNorm.includes(qNorm) || qNorm.includes(itemNorm))
            rankScore += 0.15;

        return {
            ...item,
            rankScore,
            confidenceScore,
        };
    });

    scored.sort((a, b) => b.rankScore - a.rankScore);
    const best = scored[0];
    const secondBest = scored[1];

    const semanticGap = secondBest ? best.confidenceScore - secondBest.confidenceScore : 0;

    const CONFIDENCE_THRESHOLD = isLongQuery ? 0.30 : 0.35;

    const intentWords = ["how", "when", "who", "what", "where", "why"];


    //intent words for stricter search
    function extractIntent(text = "") {
        const q = normalize(text);
        return intentWords.find(w => q.startsWith(w));
    }

    const intentSource = normalize(embeddingText);
    const userIntent = extractIntent(intentSource);
    const bestIntent = extractIntent(normalize(best?.question_en || ""));

    if (userIntent && bestIntent && userIntent !== bestIntent) {
        return NextResponse.json({
            success: true,
            noMatch: true,
            reason: "intent_mismatch",
        });
    }


    const isExactOrNearMatch =
        normalize(best?.question_en || "") === qNorm ||
        normalize(best?.question_kn || "") === qNorm ||
        normalize(best?.question_en || "").includes(qNorm) ||
        normalize(best?.question_kn || "").includes(qNorm);

    if (
        !isKeywordQuery &&
        (
            !best ||
            best.confidenceScore < CONFIDENCE_THRESHOLD ||
            semanticGap < 0.05
        )
    ) {
        return NextResponse.json({
            success: true,
            noMatch: true,
            reason: "low_confidence",
        });
    }


    const seen = new Set();
    seen.add(best.id);
    if (excludeId) seen.add(excludeId);

    const related = [];

    for (const item of scored) {
        if (related.length === 3) break;
        if (item.confidenceScore < 0.5) continue;
        if (seen.has(item.id)) continue;

        const qText =
            lang === "kn" ? item.question_kn : item.question_en;

        if (!qText) continue;

        seen.add(item.id);

        related.push({
            id: item.id,
            question: qText,
        });
    }

    // ---------- EXPLORE MODE (keyword search) ----------
    if (isKeywordQuery) {
        const results = scored
            .filter(i => i.confidenceScore > 0.25)
            .slice(0, 5)
            .map(i => ({
                id: i.id,
                question:
                    lang === "kn" ? i.question_kn : i.question_en,
            }));

        return NextResponse.json({
            success: true,
            mode: "explore",
            results,
        });
    }


    return NextResponse.json({
        success: true,
        bestMatch: {
            id: best.id,
            question:
                lang === "kn" ? best.question_kn : best.question_en,
            answer:
                lang === "kn" ? best.answer_kn : best.answer_en,
            score: best.confidenceScore,
            editorNote_en: best.editorNote_en || "",
            editorNote_kn: best.editorNote_kn || "",
        },
        related,
    });
}
