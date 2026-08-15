import { adminDB, adminStorage } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

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

    const { calendarId } = await req.json();

    if (!calendarId) {
      return Response.json(
        { error: "Calendar ID is required" },
        { status: 400 },
      );
    }

    const calendarRef = adminDB.collection("calendar_issues").doc(calendarId);

    const calendarSnap = await calendarRef.get();

    if (!calendarSnap.exists) {
      return Response.json({ error: "Calendar not found" }, { status: 404 });
    }

    const calendar = calendarSnap.data();

    if (calendar.storagePath) {
      await adminStorage
        .bucket()
        .file(calendar.storagePath)
        .delete()
        .catch((err) => {
          if (err.code !== 404) {
            throw err;
          }
        });
    }

    await calendarRef.delete();

    return Response.json({
      success: true,
    });
  } catch (err) {
    console.error("Calendar delete error:", err);

    return Response.json(
      {
        error: "Calendar deletion failed",
        details: err.message,
      },
      { status: 500 },
    );
  }
}
