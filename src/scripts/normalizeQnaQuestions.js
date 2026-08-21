import { adminDB } from "../lib/firebaseAdmin.js";

function normalize(value = "") {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

async function run() {
  const snapshot = await adminDB.collection("qna_items").get();

  console.log(`Found ${snapshot.size} Q&A records.`);

  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    const update = {};

    if (data.question_en) {
      update.question_en_normalized = normalize(data.question_en);
    }

    if (data.question_kn) {
      update.question_kn_normalized = normalize(data.question_kn);
    }

    if (Object.keys(update).length > 0) {
      await doc.ref.update(update);
      updated++;
    }
  }

  console.log(`Updated ${updated} records.`);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
