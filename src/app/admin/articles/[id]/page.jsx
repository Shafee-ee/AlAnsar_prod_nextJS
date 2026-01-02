"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ArticleEditorPage() {
    const { id } = useParams();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    //language editor form
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [visibility, setVisibility] = useState(true);
    const [saving, setSaving] = useState(false);

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


    const activeTranslation = translations.find(
        (t) => t.language === activeLang
    );

    useEffect(() => {
        if (activeTranslation) {
            setTitle(activeTranslation.title || "");
            setContent(activeTranslation.content || "");
            setExcerpt(activeTranslation.excerpt || "");
            setVisibility(activeTranslation.visibility !== false);
        } else {
            //new language
            setTitle("");
            setContent("");
            setExcerpt("");
            setVisibility(true);

        }
    }, [activeLang, activeTranslation])


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

    async function handleSaveTranslation() {
        if (!title || !content) {
            alert("Title and content are required");
            return;
        }

        setSaving(true);

        try {
            const res = await fetch("/api/articles/translations/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    articleId: id,
                    language: activeLang,
                    title,
                    excerpt,
                    content,
                    visibility,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to save translation");
            }

            // refresh translations
            const refresh = await fetch(
                `/api/articles/translations/list?articleId=${id}`
            );
            const refreshed = await refresh.json();
            setTranslations(refreshed.translations || []);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    }


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
            <div className="p-4 border rounded bg-gray-50 space-y-4">
                <h3 className="font-semibold">
                    {activeTranslation ? "Edit" : "Add"} language:{" "}
                    {activeLang.toUpperCase()}
                </h3>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Excerpt</label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="w-full p-2 border rounded h-20"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 border rounded h-40"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={visibility}
                        onChange={(e) => setVisibility(e.target.checked)}
                    />
                    <label>Visible on site</label>
                </div>

                <button
                    onClick={handleSaveTranslation}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                    {saving ? "Saving…" : "Save Language"}
                </button>
            </div>


        </div>
    )

}