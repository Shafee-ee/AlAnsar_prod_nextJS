"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ArticleEditorPage() {
    const { id } = useParams();

    const [article, setArticle] = useState(null);
    // added 
    const [articleStatus, setArticleStatus] = useState("draft");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    //language editor form
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [visibility, setVisibility] = useState(true);
    const [saving, setSaving] = useState(false);

    const SUPPORTED_LANGUAGES = [
        { code: "kn", label: "Kannada" },
        { code: "en", label: "English" },
    ];





    //active language tab (UI only for now)
    const [activeLang, setActiveLang] = useState("kn");

    // translations 
    const [translations, setTranslations] = useState([]);

    const existingLanguages = translations.map(t => t.language);

    const availableLanguages = SUPPORTED_LANGUAGES.filter(
        lang => !existingLanguages.includes(lang.code)
    );

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
                    setArticleStatus(data.status || "draft");
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
                    status: activeTranslation?.status || "draft",
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

    async function handleArticleStatusChange(newStatus) {
        setArticleStatus(newStatus);
        try {
            const res = await fetch("/api/articles/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        articleId: id,
                        status: newStatus,
                    }
                );
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update article status"
                )
            }
        } catch (err) {
            alert(err.message)
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
                <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                        slug: <span className="font-mono">{article.slug}</span>
                    </p>


                    {/* Slug is intentionally read-only after creation */}

                    {articleStatus === "published" && (
                        <p className="text-xs text-red-600">
                            ⚠️ Slug is locked after publishing. Changing it will break links.
                        </p>
                    )}
                </div>


                <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm font-medium">Article status:</span>

                    <select
                        value={articleStatus}
                        onChange={(e) =>
                            handleArticleStatusChange(e.target.value)
                        }
                        className="p-1 border rounded"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>

                    {articleStatus === "published" && (
                        <span className="text-xs text-green-700">
                            Article is live
                        </span>
                    )}
                </div>


            </div>

            {/*Language tabs (UI scaffold)*/}

            <div className="flex items-center gap-2 border-b pb-2">

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

                {availableLanguages.length > 0 && (
                    <select
                        onChange={(e) => {
                            setActiveLang(e.target.value);
                        }}
                        className="ml-4 p-1 border rounded text-sm"
                        defaultValue=""
                    >
                        <option value="" disabled>
                            + Add language
                        </option>
                        {availableLanguages.map(lang => (
                            <option key={lang.code} value={lang.code}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                )}

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