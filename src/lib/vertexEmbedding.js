import { GoogleAuth } from "google-auth-library";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const LOCATION = "us-central1";

const credentials = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
);

const auth = new GoogleAuth({
    credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

let cachedClientPromise = null;
let cachedToken = null;
let tokenExpiry = 0;

const embeddingCache = new Map();

async function getClient() {

    if (!cachedClientPromise) {
        cachedClientPromise = auth.getClient();
    }
    return cachedClientPromise;
}

async function getAccessToken() {
    const now = Date.now();

    if (cachedToken && now < tokenExpiry - 60000) {
        return cachedToken;
    }

    const client = await getClient();
    const tokenResponse = await client.getAccessToken();

    cachedToken = tokenResponse.token;

    // tokens usually valid ~1 hour
    tokenExpiry = now + 55 * 60 * 1000;

    return cachedToken;
}

export async function generateEmbedding(text) {
    const key = text.trim().toLowerCase();

    if (embeddingCache.has(key)) {
        return embeddingCache.get(key);
    }

    const accessToken = await getAccessToken();

    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/text-embedding-004:predict`;

    const r = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            instances: [{ content: text }],
        }),
    });

    if (!r.ok) {
        const t = await r.text();
        throw new Error("Vertex embedding failed: " + t);
    }

    const j = await r.json();
    const vector = j.predictions[0].embeddings.values;

    embeddingCache.set(key, vector);

    return vector;
}