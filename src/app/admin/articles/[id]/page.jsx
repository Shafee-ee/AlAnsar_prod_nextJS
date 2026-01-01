"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ArticleEditorPage() {
    const { id } = useParams();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    //active language tab (UI only for now)
    const [activeLang, setActiveLang] = useState("kn");

    // translations 
    const [translations, setTranslations] = useState([]);

    useEffect(() => {
        async function loadTranslations() {
            try {
                const res = await fetch(
                    `/api/articles/translations/list?articleId=${id}`
                );

                if (!res.ok) {
                    throw new Error("Failed to load translations");
                }

                const data = await res.json();
                setTranslations(data.translations || []);

                if (data.translations?.length > 0) {
                    setActiveLang(data.translations[0].language);
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (id) loadTranslations();
    }, [id]);


    useEffect(
        () => {
            async function loadArticle() {
                try {
                    setLoading(true);
                    const res = await fetch(`/api/articles/by-id?id=${id}`);

                    if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || "failed to load article")
                    }

                    const data = await res.json();
                    setArticle(data);
                } catch (err) {
                    setError(err.message)
                } finally {
                    setLoading(false);
                }
            }
            if (id) loadArticle();
        }, [id]);

    if (loading) {
        return <div className="p-6">Loading Article....</div>
    }

    if (error) {
        return <div className="p-6 text-red-600">{error}</div>
    }

    if (!article) {
        return <div className="p-6">Article not found</div>
    }

    return (
        <div className="max-w-4xl space-y-6">
            {/*Header*/}
            <div className="border-b pb-4">
                <h1 className="text-2xl font-bold">Edit Article</h1>
                <p className="text-sm text-gray-600">
                    slug: <span className="font-mono">{article.slug}</span>
                </p>
                <p className="text-sm">
                    status: <strong>{article.status}</strong>
                </p>
            </div>

            {/*Language tabs (UI scaffold)*/}

            <div className="flex gap-2 border-b">

                {translations.map((t) => (
                    <button
                        key={t.language}
                        onClick={() => setActiveLang(t.language)}
                        className={`px-4 py-2 border-b-2 ${activeLang === t.language
                            ? "border-blue-600 font-medium"
                            : "border-transparent text-gray-500"
                            }`}
                    >
                        {t.language.toUpperCase()}
                    </button>
                ))}

            </div>

            {/*Placeholder for language editor*/}
            <div className="p-4 border rounded bg-gray-50">
                <p className="text-sm text-gray-600">
                    Editing language: <strong>{activeLang.toUpperCase()}</strong>
                </p>
                <p className="text-xs text-gray-500">
                    Language editor form comes next
                </p>
            </div>

        </div>
    )

}