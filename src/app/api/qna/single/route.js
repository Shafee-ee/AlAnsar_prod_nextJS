import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { generateEmbedding } from "@/lib/vertexEmbedding";

/* -------------------------------------------------------
   Detect Kannada (simple + reliable for our use case)
------------------------------------------------------- */
function isKannada(text = "") {
    return /[\u0C80-\u0CFF]/.test(text);
}

/* -------------------------------------------------------
   Translate using your existing pipeline
------------------------------------------------------- */
async function translate(text, targetLang) {
    const prompt = `
Translate the text into ${targetLang}.
STRICT RULES:
- ONLY return the translated sentence.
- NO explanations.
- NO markdown.
- Preserve Islamic terms exactly: wudu, ghusl, salah, zakat, sunnah, takbir, qibla, mahr, talaq.

TEXT:
${text}
    `;

    const r = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.0 }
            })
        }
    );

    if (!r.ok) {
        throw new Error("Gemini translate failed");
    }

    const data = await r.json();

    return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text
    );
}

/* -------------------------------------------------------
   MAIN HANDLER (new schema, auto-detect override)
------------------------------------------------------- */
export async function POST(req) {
    try {
        const {
            question,
            answer,
            lang: userLang,
            keywords = [],
            editor_note_en = "",
            editor_note_kn = "",
            imam_name = null,
            source_title = null,
            samputa = null,
            sanchike = null,
            image_urls = [],
            submissionId=null
        } = await req.json();

        if (!question || !answer || !userLang) {
            return NextResponse.json({ success: false, reason: "missing-fields" });
        }

        const q = question.trim();
        const a = answer.trim();

        if (q.length < 2 || a.length < 2) {
            return NextResponse.json({ success: false, reason: "too-short" });
        }

        /* -------------------------------------------------------
           AUTO-DETECT AND OVERRIDE USER SELECTION
        ------------------------------------------------------- */
        let detectedLang = isKannada(q) ? "kn" : "en";

        // If text is short (< 6 chars), user may be right → fallback to user selection
        const finalLang =
            q.length < 6 ? userLang : detectedLang;

        /* -------------------------------------------------------
           CREATE EN + KN VERSIONS
        ------------------------------------------------------- */
        let question_en, answer_en, question_kn, answer_kn;

        if (finalLang === "en") {
            // original is English
            question_en = q;
            answer_en = a;

            // auto-translate to Kannada
            question_kn = await translate(q, "kn");
            answer_kn = await translate(a, "kn");

        } else {
            // original is Kannada
            question_kn = q;
            answer_kn = a;

            // auto-translate to English
            question_en = await translate(q, "en");
            answer_en = await translate(a, "en");

            if (!question_en || !answer_en) {
                return NextResponse.json({ success: false, reason: "translation-failed" });
            }
        }

        /* -------------------------------------------------------
           GENERATE EMBEDDING USING ENGLISH VERSION
        ------------------------------------------------------- */
        const embedding = await generateEmbedding(question_en);
        if (!embedding) {
            return NextResponse.json({ success: false, reason: "embedding-failed" });
        }

        //new fields added here
        const normalizedImam =
            imam_name && imam_name.trim() !== "" ? imam_name.trim() : null;

        const normalizedSource =
            source_title && source_title.trim() !== "" ? source_title.trim() : null;

        const normalizedSamputa =
            samputa !== null && samputa !== "" && !isNaN(Number(samputa))
                ? Number(samputa)
                : null;

        const normalizedSanchike =
            sanchike !== null && sanchike !== "" && !isNaN(Number(sanchike))
                ? Number(sanchike)
                : null;

        const normalizedImages =
            Array.isArray(image_urls) ? image_urls : [];

        /* -------------------------------------------------------
           SAVE IN CLEAN FORMAT
        ------------------------------------------------------- */
        const docRef = await adminDB.collection("qna_items").add({
            question_en,
            answer_en,
            question_kn,
            answer_kn,
            editor_note_en,
            editor_note_kn,
            lang_original: finalLang,
            keywords,
            embedding,
            imam_name: normalizedImam,
            source_title: normalizedSource,
            samputa: normalizedSamputa,
            sanchike: normalizedSanchike,
            image_urls: normalizedImages,
            createdAt: new Date().toISOString(),
            updatedAt: null
        });

        const newQnaId=docRef.id;

        //if promoted send email to user if email exists 
        
if (submissionId) {
    try {
        const submissionRef = adminDB
            .collection("qna_submissions")
            .doc(submissionId);

        const snap = await submissionRef.get();

        if (snap.exists) {
            const submission = snap.data();

            if (submission.email && !submission.isAnonymous) {
                // for now just log instead of email (we’ll plug email next)
                console.log("SEND EMAIL TO:", submission.email);
            }

            await submissionRef.update({
                promoted_qna_id: newQnaId,
                email_sent: true
            });
        }
    } catch (err) {
        console.error("Submission linkage failed:", err);
    }
}

return NextResponse.json({ success: true, id: newQnaId });
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json(
            { success: false, reason: "server-error" },
            { status: 500 }
        );
    }
}
