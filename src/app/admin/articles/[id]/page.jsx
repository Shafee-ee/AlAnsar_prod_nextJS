"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ArticlePage() {
  const { id } = useParams();
  const router = useRouter();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState("");

  useEffect(() => {
    if (article) {
      setImage(article.coverImage || "");
    }
  }, [article]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/articles/by-id?id=${id}`);
      const data = await res.json();
      setArticle(data);
      setLoading(false);
    }

    if (id) load();
  }, [id]);

  useEffect(() => {
    if (article?.translations?.[lang]) {
      const t = article.translations[lang];
      setTitle(t.title || "");
      setContent(t.content || "");
      setAuthor(t.author || "");
    } else {
      setTitle("");
      setContent("");
      setAuthor("");
    }
  }, [article, lang]);

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content required");
      return;
    }

    setSaving(true);

    const promise = fetch("/api/articles/translations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleId: id,
        language: lang,
        title,
        content,
        author,
        image,
      }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    });

    try {
      await toast.promise(promise, {
        loading: "Saving article...",
        success: "Saved successfully",
        error: (err) => err.message,
      });

      router.push("/admin/articles?success=1");
    } catch (err) {
      // already handled by toast
    } finally {
      setSaving(false);
    }
  }
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("articleId", id);

      const res = await fetch("/api/articles/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setImage(data.url);

      toast.success("Image uploaded", { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Article</h1>

      <div className="flex gap-2">
        <button onClick={() => setLang("en")}>EN</button>
        <button onClick={() => setLang("kn")}>KN</button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border p-2"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        className="w-full border p-2 h-40"
      />

      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author"
        className="w-full border p-2"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Cover Image</label>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-gray-900 text-white px-4 py-2 text-sm">
            Upload Image
            <input
              type="file"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <span className="text-sm text-gray-500">
            {image ? "Image selected" : "No file chosen"}
          </span>
        </div>
      </div>
      {image && (
        <img src={image} className="w-full h-48 object-cover rounded border" />
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-black text-white px-4 py-2 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
