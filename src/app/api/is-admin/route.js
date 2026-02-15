// src/app/api/is-admin/route.js
import "@/lib/firebaseAdmin";
import admin from "firebase-admin";



export async function POST(req) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const match = authHeader.match(/^Bearer (.+)$/);
        if (!match) {
            return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
        }
        const idToken = match[1];

        const decoded = await admin.auth().verifyIdToken(idToken);
        const uid = decoded.uid;

        // If the token has admin claim, accept it
        if (decoded.admin === true || decoded.isAdmin === true) {
            return new Response(JSON.stringify({ isAdmin: true }), { status: 200 });
        }

        // Fallback: check ADMIN_UIDS env var (comma-separated UIDs)
        const adminUidsEnv = process.env.ADMIN_UIDS || "";
        const adminUids = adminUidsEnv.split(",").map((s) => s.trim()).filter(Boolean);
        const isAdmin = adminUids.includes(uid);

        return new Response(JSON.stringify({ isAdmin }), { status: 200 });
    } catch (err) {
        console.error("/api/is-admin error:", err);
        return new Response(JSON.stringify({ error: "Unauthorized or server error" }), { status: 401 });
    }
}
