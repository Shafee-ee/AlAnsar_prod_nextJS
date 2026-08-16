"use client";

import { useState } from "react";

export default function AdsPage() {
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title || !file) {
      setMessage("Title and image are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 1. Upload image
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/ads/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Image upload failed");
      }

      // 2. Create ad
      const adRes = await fetch("/api/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          targetUrl,
          imageUrl: uploadData.url,
        }),
      });

      const adData = await adRes.json();

      if (!adRes.ok) {
        throw new Error(adData.error || "Failed to create ad");
      }

      setTitle("");
      setTargetUrl("");
      setFile(null);

      e.target.reset();

      setMessage("Ad created successfully.");
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Ads</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="font-medium">Ad Title</label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Al Ansar Academy"
            className="w-full rounded border p-2"
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium">Destination URL</label>

          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded border p-2"
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium">Ad Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {message && <p className="text-sm text-gray-700">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Create Ad"}
        </button>
      </form>
    </div>
  );
}
