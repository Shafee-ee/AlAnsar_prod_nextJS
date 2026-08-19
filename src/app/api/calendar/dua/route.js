import { adminDB, adminStorage } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { randomUUID } from "crypto";

export async function POST(req) {
  try {
    // Verify admin
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

    // Read form
    const formData = await req.formData();

    const calendarId = formData.get("calendarId");
    const day = formData.get("day");
    const image = formData.get("image");

    if (!calendarId || !day || !image) {
      return Response.json(
        { error: "Calendar, day and image are required" },
        { status: 400 },
      );
    }

    if (!(image instanceof File)) {
      return Response.json({ error: "Invalid image file" }, { status: 400 });
    }

    const dayNumber = Number(day);

    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 31) {
      return Response.json({ error: "Invalid Dua day" }, { status: 400 });
    }

    // Get calendar
    const calendarRef = adminDB.collection("calendar_issues").doc(calendarId);

    const calendarDoc = await calendarRef.get();

    if (!calendarDoc.exists) {
      return Response.json({ error: "Calendar not found" }, { status: 404 });
    }

    const calendar = calendarDoc.data();

    // Prevent duplicate day
    const existingDuas = Array.isArray(calendar.duas) ? calendar.duas : [];

    const alreadyExists = existingDuas.some(
      (dua) => Number(dua.day) === dayNumber,
    );

    if (alreadyExists) {
      return Response.json(
        { error: `Dua for Day ${dayNumber} already exists` },
        { status: 400 },
      );
    }

    // Upload image
    const buffer = Buffer.from(await image.arrayBuffer());

    const bucket = adminStorage.bucket();

    const duaId = randomUUID();

    const filePath = `calendar/${calendar.hijriYear}-${calendar.hijriMonth}/duas/${duaId}-${image.name}`;

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

    // Create Dua object
    const dua = {
      id: duaId,
      day: dayNumber,
      imageUrl,
      storagePath: filePath,
    };

    const updatedDuas = [...existingDuas, dua].sort(
      (a, b) => Number(a.day) - Number(b.day),
    );

    // Save to calendar
    await calendarRef.update({
      duas: updatedDuas,
      updatedAt: new Date(),
    });

    return Response.json({
      success: true,
      dua,
    });
  } catch (err) {
    console.error("Dua upload error:", err);

    return Response.json(
      {
        error: "Dua upload failed",
        details: err.message,
      },
      { status: 500 },
    );
  }
}
