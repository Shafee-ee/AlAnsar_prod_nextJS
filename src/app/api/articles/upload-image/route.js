import crypto from "crypto";
import { NextResponse } from "next/server";
import { adminDB, adminStorage } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const articleId = formData.get("articleId");

    if (!file || !articleId) {
      return NextResponse.json(
        { error: "Missing file or articleId" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only images allowed" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = adminStorage.bucket();

    const filePath = `articles/${articleId}/cover-${Date.now()}.jpg`;
    const fileRef = bucket.file(filePath);

    const token = crypto.randomUUID();

    await fileRef.save(buffer, {
      contentType: file.type,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const downloadUrl =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
      `${encodeURIComponent(filePath)}?alt=media&token=${token}`;

    await adminDB.collection("articles").doc(articleId).update({
      coverImage: downloadUrl,
      updatedAt: new Date(),
    });

    return NextResponse.json({ url: downloadUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
