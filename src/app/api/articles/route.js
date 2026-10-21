import { NextResponse } from "next/server";
import { getCachedArticles } from "@/lib/articleCache";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "kn";

    const articles = await getCachedArticles(lang);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Articles API error:", error);

    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}
