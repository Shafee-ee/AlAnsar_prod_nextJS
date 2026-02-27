import { adminDB } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";
import QnaContent from "@/components/QnaContent";



let cachedQnaEmbeddings = null;
let lastQnaLoadTime = 0;

async function loadQnaEmbeddingsIfNeeded() {
    const now = Date.now();

    if (cachedQnaEmbeddings && now - lastQnaLoadTime < 10 * 60 * 1000) {
        return cachedQnaEmbeddings;
    }

    const snap = await adminDB
        .collection("qna_items")
        .select("embedding", "question_en", "question_kn")
        .get();

    cachedQnaEmbeddings = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));

    lastQnaLoadTime = now;

    return cachedQnaEmbeddings;
}

/* ---------- PAGE COMPONENT ---------- */
function cosine(a = [], b = []) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

async function getQnaById(id) {
    const snap = await adminDB.collection("qna_items").doc(id).get();
    if (!snap.exists) return null;
    return snap.data();
}

export async function generateMetadata(props) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const { id } = params;
    const lang = searchParams?.lang === "en" ? "en" : "kn";
    const data = await getQnaById(id);

    if (!data) return {};

    const rawQuestion =
        lang === "kn"
            ? data.question_kn || data.question_en
            : data.question_en || data.question_kn || "Al Ansar Weekly";

    const shortenedQuestion =
        rawQuestion.length > 60
            ? rawQuestion.slice(0, 57) + "..."
            : rawQuestion;

    const rawAnswer =
        lang === "kn"
            ? data.answer_kn || data.answer_en
            : data.answer_en || data.answer_kn || "";

    const description = rawAnswer
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 155);

    const base =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://www.alansarweekly.com";

    const url = `${base}/qna/${id}/opengraph-image/${lang}`;

    return {
        title: `${shortenedQuestion} | Al Ansar Weekly`,
        description,
        openGraph: {
            title: `${shortenedQuestion} | Al Ansar Weekly`,
            description,
            url,
            siteName: "Al Ansar Weekly",
            images: [
                {
                    url: `${base}/qna/${id}/opengraph-image/${lang}`,
                    width: 1200,
                    height: 630,
                },
            ],
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: `${shortenedQuestion} | Al Ansar Weekly`,
            description,
            images: [`${base}/qna/${id}/opengraph-image?lang=${lang}`],
        },
    };
}

export default async function QnAPage(props) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const { id } = params;
    if (!id) notFound();

    const lang =
        searchParams?.lang === "en" ? "en" : "kn";
    const data = await getQnaById(id);
    if (!data) notFound();

    const currentEmbedding = data.embedding || [];
    let relatedQuestions = [];

    if (currentEmbedding.length) {
        const allItems = await loadQnaEmbeddingsIfNeeded();

        relatedQuestions = allItems
            .map(item => {
                if (item.id === id) return null;
                if (!item.embedding) return null;

                return {
                    id: item.id,
                    question_en: item.question_en,
                    question_kn: item.question_kn,
                    imageUrl: item.imageUrl || null,
                    score: cosine(currentEmbedding, item.embedding),
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    return (
        <QnaContent
            id={id}
            data={data}
            relatedQuestions={relatedQuestions}
            lang={lang}
        />
    );
}