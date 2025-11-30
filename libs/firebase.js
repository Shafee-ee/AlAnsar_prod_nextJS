// libs/firebase.js

import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection
} from "firebase/firestore";

// ---------------------------------------------
// Firebase Config from .env.local
// ---------------------------------------------
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ---------------------------------------------
// Initialize Firebase
// ---------------------------------------------
const app = initializeApp(firebaseConfig);

// ---------------------------------------------
// Services
// ---------------------------------------------
export const auth = getAuth(app);
export const db = getFirestore(app);

// ---------------------------------------------
// Convenience Exports
// ---------------------------------------------
export {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    doc,
    getDoc,
    setDoc,
    collection
};

// App ID is useful for building Firestore paths later
export const appId = firebaseConfig.projectId;
