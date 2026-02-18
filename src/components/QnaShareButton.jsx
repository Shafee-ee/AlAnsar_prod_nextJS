'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';

export default function QnaShareButton({ id, lang }) {
    const [copied, setCopied] = useState(false);

    async function handleShare() {
        const shareUrl = `${window.location.origin}/qna/${id}?lang=${lang}`;

        // Mobile native share
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
            try {
                await navigator.share({
                    title: "Al Ansar Weekly",
                    url: shareUrl,
                });
                return;
            } catch {
                return;
            }
        }

        // Desktop → copy
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            alert("Unable to copy link");
        }
    }

    return (
        <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition"
        >
            <Share2 className="w-4 h-4" />
            {copied ? "Link Copied" : "Share"}
        </button>
    );
}
