import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function POST(req) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            );
        }

        // Generate embedding
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;

        return NextResponse.json({ embedding });
    } catch (error) {
        console.error("Embedding error:", error);
        return NextResponse.json(
            { error: "Failed to generate embedding" },
            { status: 500 }
        );
    }
}
