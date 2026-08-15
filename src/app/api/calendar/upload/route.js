import { adminDB, adminStorage } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { randomUUID } from "crypto";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const match = authHeader.match(/^Bearer (.+)$/);

    if (!match) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = match[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const hasAdminClaim = decoded.admin === true || decoded.isAdmin === true;

    const adminUidsEnv = process.env.ADMIN_UIDS || "";

    const adminUids = adminUidsEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const isAdminByUid = adminUids.includes(uid);

    const adminDoc = await adminDB.collection("admins").doc(uid).get();

    const isAdmin = hasAdminClaim || isAdminByUid || adminDoc.exists;

    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();

    const image = formData.get("image");
    const hijriMonth = formData.get("hijriMonth");
    const hijriYear = formData.get("hijriYear");
    const gregorianLabel = formData.get("gregorianLabel");
    const calendarDate = formData.get("calendarDate");

    if (
      !image ||
      !hijriMonth ||
      !hijriYear ||
      !gregorianLabel ||
      !calendarDate
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!(image instanceof File)) {
      return Response.json({ error: "Invalid image file" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    const bucket = adminStorage.bucket();

    const filePath = `calendar/${hijriYear}-${hijriMonth}/${image.name}`;

    const file = bucket.file(filePath);

    const downloadToken = randomUUID();

    await file.save(buffer, {
      metadata: {
        contentType: image.type,
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    });

    const imageUrl =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
      `${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

    const docRef = await adminDB.collection("calendar_issues").add({
      imageUrl,
      storagePath: filePath,
      hijriMonth,
      hijriYear: Number(hijriYear),
      gregorianLabel,
      calendarDate: new Date(calendarDate),
      status: "draft",
      events: [],
      createdAt: new Date(),
    });

    return Response.json({
      success: true,
      id: docRef.id,
      imageUrl,
    });
  } catch (err) {
    console.error("Calendar upload error:", err);

    return Response.json(
      {
        error: "Calendar upload failed",
        details: err.message,
      },
      { status: 500 },
    );
  }
}
