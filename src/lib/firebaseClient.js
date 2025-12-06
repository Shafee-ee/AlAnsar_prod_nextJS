// src/lib/firebaseClient.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// named export (used in some places)
export const app = initializeApp(firebaseConfig);

// default export (used by the AuthProvider below)
export default app;
