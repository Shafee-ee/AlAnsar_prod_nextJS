// src/app/api/is-admin/route.js

import "@/lib/firebaseAdmin";
import admin from "firebase-admin";

async function checkAdmin(req) {
    const authHeader = req.headers.get("authorization") || "";
    const match = authHeader.match(/^Bearer (.+)$/);

    if (!match) {
        return new Response(JSON.stringify({ isAdmin: false }), { status: 200 });
    }

    try {
        const idToken = match[1];
        const decoded = await admin.auth().verifyIdToken(idToken);
        const uid = decoded.uid;

        if (decoded.admin === true || decoded.isAdmin === true) {
            return new Response(JSON.stringify({ isAdmin: true }), { status: 200 });
        }

        const adminUidsEnv = process.env.ADMIN_UIDS || "";
        const adminUids = adminUidsEnv.split(",").map((s) => s.trim()).filter(Boolean);
        const isAdmin = adminUids.includes(uid);

        return new Response(JSON.stringify({ isAdmin }), { status: 200 });

    } catch (err) {
        console.error("/api/is-admin error:", err);
        return new Response(JSON.stringify({ isAdmin: false }), { status: 200 });
    }
}

export async function GET(req) {
    return checkAdmin(req);
}

export async function POST(req) {
    return checkAdmin(req);
}