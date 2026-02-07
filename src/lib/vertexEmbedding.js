import { GoogleAuth } from "google-auth-library";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const LOCATION = "us-central1";

export async function generateEmbedding(text) {
    const auth = new GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/text-embedding-004:predict`;

    const r = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify({
            instances: [
                { content: text }
            ]
        })
    });

    if (!r.ok) {
        const t = await r.text();
        throw new Error("Vertex embedding failed: " + t);
    }

    const j = await r.json();
    return j.predictions[0].embeddings.values;
}
