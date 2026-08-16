import { NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only images allowed" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const bucket = adminStorage.bucket();

    const filePath = `ads/ad-${Date.now()}`;
    const fileRef = bucket.file(filePath);

    await fileRef.save(buffer, {
      contentType: file.type,
    });

    const [signedUrl] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500",
    });

    return NextResponse.json({
      url: signedUrl,
    });
  } catch (err) {
    console.error("Ad image upload failed:", err);

    return NextResponse.json(
      { error: "Failed to upload ad image" },
      { status: 500 },
    );
  }
}
