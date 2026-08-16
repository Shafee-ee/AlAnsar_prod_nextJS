"use client";

import { useEffect, useState } from "react";

export default function ArticleAd() {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadAds() {
      try {
        const res = await fetch("/api/ads");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load ads");
        }

        setAds(data.ads || []);
      } catch (err) {
        console.error("Failed to load ads:", err);
      }
    }

    loadAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % ads.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [ads]);

  if (ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="px-4 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Sponsored
        </p>
      </div>

      <a
        href={currentAd.targetUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src={currentAd.imageUrl}
          alt={currentAd.title}
          className="w-full object-cover"
        />
      </a>
    </div>
  );
}
