// db/direct-seed.js (FINAL, WORKING VERSION)

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(process.cwd(), 'dev.db');
const QNA_JSON_PATH = path.resolve(process.cwd(), 'data/initial_qna.json');

async function main() {
    console.log('Starting direct SQLite bulk upload...');

    let db;
    try {
        db = await sqlite.open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });

        if (!fs.existsSync(QNA_JSON_PATH)) {
            throw new Error(`Data file not found at ${QNA_JSON_PATH}. Please ensure the 'data' folder and 'initial_qna.json' exist.`);
        }
        const qnaData = JSON.parse(fs.readFileSync(QNA_JSON_PATH, 'utf-8'));

        console.log(`Read ${qnaData.length} records from JSON.`);

        await db.run('BEGIN TRANSACTION;');

        // Clear old data
        await db.run('DELETE FROM "Qna"');
        console.log(`Cleared existing records.`);

        // --- CHANGE IS HERE: Added "createdAt" and "updatedAt" to the insert columns ---
        const insertStmt = `INSERT INTO "Qna" (
            "createdAt", "updatedAt", 
            "question_kn", "answer_kn", "keywords_kn", "question_en", "answer_en", "keywords_en"
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        // Get current timestamp once (SQLite stores this as TEXT)
        const now = new Date().toISOString();

        // 6. Insert all records
        for (const item of qnaData) {
            const keywords_en_string = Array.isArray(item.keywords_en) ? item.keywords_en.join(', ') : item.keywords_en || null;

            await db.run(insertStmt, [
                // --- CHANGE IS HERE: Insert the current timestamp for both date columns ---
                now, // createdAt
                now, // updatedAt

                item.question_kn,
                item.answer_kn,
                item.keywords_kn,
                item.question_en || null,
                item.answer_en || null,
                keywords_en_string
            ]);
        }

        await db.run('COMMIT;');

        console.log(`✅ Successfully inserted ${qnaData.length} QnA records into dev.db.`);

    } catch (e) {
        console.error('❌ Data upload failed:', e.message);
        // The rollback error is expected if the script fails before BEGIN TRANSACTION, so we catch it
        if (db) {
            try {
                await db.run('ROLLBACK;');
            } catch (rollbackError) {
                // Ignore the "no transaction is active" error
            }
        }
        process.exit(1);
    } finally {
        if (db) await db.close();
        console.log('Database connection closed.');
    }
}

main();