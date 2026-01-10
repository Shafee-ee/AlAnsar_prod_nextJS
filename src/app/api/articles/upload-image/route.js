import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { getStorage } from "firebase-admin/storage"
import admin from "firebase-admin";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const articleId = formData.get("articleId");

        if (!file || !articleId) {
            return NextResponse.json({ error: "Missing file or articleId" }, { status: 400 })
        }


        const buffer = Buffer.from(await file.arrayBuffer());
        const bucket = getStorage().bucket();

        const filePath = `articles/${articleId}/cover.jpg`;
        const fileRef = bucket.file(filePath)


        await fileRef.save(buffer, {
            contentType: file.type,
            public: true,
        })

        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

        await adminDB.collection("articles").doc(articleId).update({
            coverImage: imageUrl,
            updatedAt: new Date(),
        })

        return NextResponse.json({ imageUrl });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "upload failed" }, { status: 500 })
    }


}
