// scripts/upload-qna.js (CommonJS Syntax)
const fs = require('fs');
const path = require('path');
// Import the CJS module
const prisma = require('../libs/prisma.js');

async function main() {
    console.log('Starting bulk upload of Q&A data...');

    // 1. Read the JSON file
    const jsonPath = path.resolve(process.cwd(), 'data/initial_qna.json');
    const qnaData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // 2. Clear any old data
    await prisma.qna.deleteMany({});
    console.log('Cleared existing QnA records.');

    // 3. Prepare data for insertion (Ensures keywords_en is an array)
    const preparedData = qnaData.map(item => ({
        ...item,
        // Ensure keywords_en is correctly defaulted to [] if missing (though the schema default helps)
        // If keywords_en is missing in the data, the schema default of [] will apply.
        // We only map the Kannada fields here, allowing English fields to use the optional/default settings.
        question_kn: item.question_kn,
        answer_kn: item.answer_kn,
        keywords_kn: item.keywords_kn,

        // Explicitly set optional English fields to null if they are not provided,
        // although Prisma handles this automatically, it ensures clean data.
        question_en: item.question_en || null,
        answer_en: item.answer_en || null,

        // keywords_en is handled by the schema default of [], so we can omit it if absent.
        // If you were providing a single keyword string that needed conversion, the logic below is better:
        // keywords_en: Array.isArray(item.keywords_en) ? item.keywords_en : (item.keywords_en ? [item.keywords_en] : []),
    }));

    // 4. Insert all records in a single batch
    const result = await prisma.qna.createMany({
        data: preparedData,
        skipDuplicates: true,
    });

    console.log(`✅ Successfully inserted ${result.count} QnA records.`);
}

main()
    .catch(e => {
        console.error('❌ Data upload failed:', e);
        // Ensure to log any potential database errors (P-codes)
        if (e.code) {
            console.error(`Prisma Error Code: ${e.code}`);
        }
        process.exit(1);
    })
    .finally(async () => {
        // Disconnect the Prisma client cleanly
        await prisma.$disconnect();
    });