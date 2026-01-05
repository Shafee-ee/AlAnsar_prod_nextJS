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

    //Language tabs
    // language tabs
    const LANGUAGES = ["kn", "en"];
    const [translations, setTranslations] = useState([]); // existing saved languages
    const [activeLang, setActiveLang] = useState("kn");


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

    useEffect(() => {
        async function loadTranslations() {
            try {
                const res = await fetch(
                    `/api/articles/translations/list?articleId=${id}`
                );
                if (!res.ok) return;

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
                )
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


            {/* Language Tabs */}
            <div className="flex gap-2 border-b pb-2">
                {LANGUAGES.map((lang) => {
                    const exists = translations.some(t => t.language === lang);

                    return (
                        <button
                            key={lang}
                            onClick={() => exists && setActiveLang(lang)}
                            disabled={!exists}
                            className={`px-4 py-2 rounded-t border-b-2 text-sm
                    ${exists
                                    ? "border-green-600 text-green-700 font-medium"
                                    : "border-gray-300 text-gray-400 cursor-not-allowed"
                                }
                    ${activeLang === lang ? "bg-gray-100" : ""}
                `}
                        >
                            {lang.toUpperCase()}
                        </button>
                    );
                })}
            </div>



            {/*Placeholder for language editor*/}
            <div className="p-4 border rounded bg-gray-50 space-y-4">
                <h3 className="font-semibold">Article Content</h3>

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