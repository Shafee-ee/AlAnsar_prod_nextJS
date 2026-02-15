import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app;

if (!getApps().length) {
    const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const parsed = JSON.parse(raw);

    app = initializeApp({
        credential: cert(parsed),
    });
} else {
    app = getApps()[0];
}

export const adminDB = getFirestore(app);
