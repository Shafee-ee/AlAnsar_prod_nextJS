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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const manage = searchParams.get("manage") === "true";

    let query = adminDB.collection("ads");

    // Public website: only published ads
    if (!manage) {
      query = query.where("active", "==", true);
    }

    const snapshot = await query.get();

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

export async function PATCH(req) {
  try {
    const body = await req.json();

    const { id, active } = body;

    if (!id || typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Ad ID and active status are required" },
        { status: 400 },
      );
    }

    const adRef = adminDB.collection("ads").doc(id);

    const doc = await adRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    await adRef.update({
      active,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      active,
    });
  } catch (err) {
    console.error("Update ad failed:", err);

    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
  }
}
