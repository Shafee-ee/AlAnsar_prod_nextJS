"use client";

import { useState } from "react";

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ads</h1>

      <div className="flex border-b border-gray-300">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`px-5 py-3 font-medium ${
            activeTab === "upload"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Upload Ads
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manage")}
          className={`px-5 py-3 font-medium ${
            activeTab === "manage"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Manage Ads
        </button>
      </div>

      {activeTab === "upload" && <UploadAds />}

      {activeTab === "manage" && <ManageAds />}
    </div>
  );
}

function UploadAds() {
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
    <div className="max-w-xl">
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

function ManageAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadAds() {
    try {
      setLoading(true);

      const res = await fetch("/api/ads?manage=true");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load ads");
      }

      setAds(data.ads || []);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  useState(() => {
    loadAds();
  }, []);

  async function toggleAd(ad) {
    try {
      setUpdatingId(ad.id);
      setMessage("");

      const res = await fetch("/api/ads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: ad.id,
          active: !ad.active,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update ad");
      }

      setAds((currentAds) =>
        currentAds.map((item) =>
          item.id === ad.id ? { ...item, active: !item.active } : item,
        ),
      );
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading ads...</p>;
  }

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-red-600">{message}</p>}

      {!ads.length ? (
        <p className="text-gray-500">No ads found.</p>
      ) : (
        <div className="border border-gray-300 bg-white">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="flex items-center gap-4 border-b border-gray-200 p-4 last:border-b-0"
            >
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="h-16 w-24 object-cover border border-gray-200"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{ad.title}</h3>

                {ad.targetUrl && (
                  <p className="text-sm text-gray-500 truncate">
                    {ad.targetUrl}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-sm font-medium ${
                    ad.active ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {ad.active ? "Published" : "Unpublished"}
                </span>

                <button
                  type="button"
                  onClick={() => toggleAd(ad)}
                  disabled={updatingId === ad.id}
                  className={`px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                    ad.active
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {updatingId === ad.id
                    ? "Updating..."
                    : ad.active
                      ? "Unpublish"
                      : "Publish"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
