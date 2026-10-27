import { config } from "dotenv";
config({ path: ".env.local" });
const { adminDB } = await import("./src/lib/firebaseAdmin.js");
const snapshot = await adminDB.collection("digipaper_issues").get();

let matches = 0;

for (const doc of snapshot.docs) {
  const data = doc.data();
  const slug = data.slug;

  if (typeof slug === "string" && slug.startsWith("$")) {
    console.log({
      id: doc.id,
      title: data.title,
      slug,
    });
    matches++;
  }
}

console.log(`Found ${matches} slugs starting with "$".`);
process.exit(0);
