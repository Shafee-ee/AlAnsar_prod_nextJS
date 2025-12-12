import { NextResponse } from "next/server";

// Simple CSV → JSON parser
function parseCSV(text) {
    const lines = text.trim().split("\n");
    const header = lines[0].split(",").map(h => h.trim());

    return lines.slice(1).map(line => {
        const parts = line.split(",");
        const obj = {};

        header.forEach((key, i) => {
            obj[key] = parts[i]?.trim() || "";
        });

        // convert keywords "a;b;c" → ["a","b","c"]
        obj.keywords = obj.keywords
            ? obj.keywords.split(";").map(k => k.trim())
            : [];

        return obj;
    });
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({
                success: false,
                message: "No CSV file uploaded"
            });
        }

        const text = await file.text();
        const items = parseCSV(text);

        return NextResponse.json({
            success: true,
            items
        });

    } catch (err) {
        console.error("CSV Parse Error:", err);
        return NextResponse.json(
            { success: false, message: "CSV parse failed" },
            { status: 500 }
        );
    }
}
