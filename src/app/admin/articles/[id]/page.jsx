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
    // language tabs
    const LANGUAGES = ["kn", "en"];
    const [translations, setTranslations] = useState([]); // existing saved languages
    const [activeLang, setActiveLang] = useState("kn");
    //image States
    const [imageUploading, setImageUploading] = useState(false);

    const existingTranslation = translations.find(
        (t) => t.language === activeLang
    );
    const isEditMode = Boolean(existingTranslation);

    useEffect(() => {
        const t = translations.find(tr => tr.language === activeLang);

        if (t) {
            setTitle(t.title || "");
            setExcerpt(t.excerpt || "");
            setContent(t.content || "");
            setVisibility(t.visibility !== false);
        } else {
            setTitle("");
            setExcerpt("");
            setContent("");
            setVisibility(true);
        }
    }, [activeLang, translations]);


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

    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;


        const formData = new FormData();
        formData.append("file", file);
        formData.append("articleId", id);

        setImageUploading(true);

        try {
            const res = await fetch("/api/articles/upload-image", {
                method: "POST",
                body: formData,
            })

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setArticle(prev => ({ ...prev, coverImage: data.imageUrl }));
        } catch (err) {
            alert(err.message);
        } finally {
            setImageUploading(false)
        }

    }

    async function handleSaveTranslation() {
        if (!title || !content) {
            alert("Title and content are required");
            return;
        }

        setSaving(true);

        try {

            const endpoint = isEditMode
                ? "/api/articles/translations/update"
                : "/api/articles/translations/create";

            const res = await fetch(endpoint, {
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

            // 👉 Only populate EN, do NOT save it
            if (activeLang === "kn") {
                const translateRes = await fetch("/api/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sourceLang: "kn",
                        targetLang: "en",
                        title,
                        excerpt,
                        content,
                    }),
                });

                const translated = await translateRes.json();

                setTitle(translated.title || "");
                setExcerpt(translated.excerpt || "");
                setContent(translated.content || "");
                setActiveLang("en");

                return;
            }

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

            {/*image upload*/}

            <div className="space-y-2">
                <label className="text-sm font-medium">Cover Image</label>
                {article.coverImage && (
                    <img
                        src={article.coverImage}
                        alt="cover"
                        className="w-full max-h-64 object-cover rounded border" />
                )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                />

                {imageUploading && (
                    <p className="text-xs text-gray-500">Uploading image...</p>
                )}

            </div>
            {/* Language Tabs */}
            <div className="flex gap-2 border-b pb-2">
                {LANGUAGES.map((lang) => {
                    const exists = translations.some(t => t.language === lang);
                    const isTempActive = activeLang === lang;

                    return (
                        <button
                            key={lang}
                            disabled={!exists && !isTempActive}
                            onClick={() => setActiveLang(lang)}
                            className={`px-4 py-2 rounded-t border-b-2 text-sm
                    ${exists
                                    ? "border-green-600 text-green-700 font-medium"
                                    : isTempActive
                                        ? "border-yellow-500 text-yellow-700 font-medium"
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
                    {saving
                        ? "Saving..."
                        : isEditMode
                            ? "Update Language"
                            : "Save Language"}
                </button>
            </div>


        </div>
    )

}