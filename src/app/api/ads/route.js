import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();

    const { title, targetUrl, imageUrl } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Title and image are required" },
        { status: 400 },
      );
    }

    const adRef = await adminDB.collection("ads").add({
      title,
      targetUrl: targetUrl || "",
      imageUrl,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      id: adRef.id,
    });
  } catch (err) {
    console.error("Create ad failed:", err);

    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const snapshot = await adminDB
      .collection("ads")
      .where("active", "==", true)
      .get();

    const ads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ ads });
  } catch (err) {
    console.error("Fetch ads failed:", err);

    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}
