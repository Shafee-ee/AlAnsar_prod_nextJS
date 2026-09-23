import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug");
    const lang = searchParams.get("lang") || "kn";

    if (!slug) {
      return new NextResponse("Slug required", { status: 400 });
    }

    // Reuse the existing article lookup
    const articleUrl =
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/articles/by-slug` +
      `?slug=${encodeURIComponent(slug)}&lang=${encodeURIComponent(lang)}`;

    const articleResponse = await fetch(articleUrl, {
      next: { revalidate: 3600 },
    });

    if (!articleResponse.ok) {
      return new NextResponse("Article not found", { status: 404 });
    }

    const article = await articleResponse.json();

    if (!article.image) {
      return new NextResponse("Article image not found", { status: 404 });
    }

    // Download the original article image
    const imageResponse = await fetch(article.image);

    if (!imageResponse.ok) {
      return new NextResponse("Failed to fetch article image", {
        status: 500,
      });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Resize and compress for WhatsApp / Open Graph
    const optimizedImage = await sharp(imageBuffer)
      .resize(1200, 630, {
        fit: "cover",
        position: "centre",
      })
      .jpeg({
        quality: 75,
        mozjpeg: true,
      })
      .toBuffer();

    return new NextResponse(optimizedImage, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("OG image generation failed:", error);

    return new NextResponse("Failed to generate OG image", {
      status: 500,
    });
  }
}
