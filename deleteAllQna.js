// scripts/deleteAllQna.js
import { adminDB } from "../src/lib/firebaseAdmin.js";

async function deleteAllQna() {
    const snap = await adminDB.collection("qna_items").get();

    if (snap.empty) {
        console.log("No QnA items found.");
        process.exit(0);
    }

    console.log(`Found ${snap.size} QnA items. Deleting...`);

    const batchSize = 500;
    let batch = adminDB.batch();
    let count = 0;

    for (const doc of snap.docs) {
        batch.delete(doc.ref);
        count++;

        if (count % batchSize === 0) {
            await batch.commit();
            console.log(`Deleted ${count}...`);
            batch = adminDB.batch();
        }
    }

    await batch.commit();

    console.log(`✅ Deleted ${count} QnA items.`);
    process.exit(0);
}

deleteAllQna().catch(err => {
    console.error("❌ Delete failed:", err);
    process.exit(1);
});
