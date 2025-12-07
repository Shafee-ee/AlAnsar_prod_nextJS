import { NextResponse } from "next/server";

// Free-tier safe delay: 3 seconds between QnA uploads
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({
                success: false,
                message: "No file uploaded",
            });
        }

        const text = await file.text();
        let items;

        try {
            items = JSON.parse(text);
        } catch (err) {
            return NextResponse.json({
                success: false,
                message: "Invalid JSON format",
                error: err.toString(),
            });
        }

        const total = items.length;
        let uploaded = 0;
        const failed = [];

        // Loop through QnA items
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // IMPORTANT: wait to avoid quota issues
            await wait(3000); // 3 seconds per item

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/qna/single`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(item),
                    }
                );

                const out = await res.json();

                if (out.success) {
                    uploaded++;
                } else {
                    failed.push({ index: i, reason: out.reason || "unknown" });
                }
            } catch (err) {
                failed.push({ index: i, reason: "network-error" });
            }
        }

        return NextResponse.json({
            success: true,
            total,
            uploaded,
            failed,
        });
    } catch (err) {
        console.error("Bulk Upload Error:", err);
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
                error: err.toString(),
            },
            { status: 500 }
        );
    }
}
