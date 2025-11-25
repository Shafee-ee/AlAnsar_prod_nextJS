// prisma/seed.js
const dotenv = require('dotenv');
const path = require('path');
// Load environment from the project root (.env.local)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const fs = require('fs');
// Import the Prisma Client module we created
const prisma = require('../libs/prisma.js');

async function main() {
    console.log('Starting bulk upload of Q&A data...');

    // 1. Read the JSON file (assuming the data folder is named 'data' in the project root)
    const jsonPath = path.resolve(process.cwd(), 'data/initial_qna.json');
    const qnaData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // 2. Clear any old data
    await prisma.qna.deleteMany({});
    console.log('Cleared existing QnA records.');

    // 3. Prepare data for insertion (CRITICAL: joins keywords_en array into a single string)
    const preparedData = qnaData.map(item => ({
        ...item,
        // Ensure that if keywords_en is an array, it is joined into a string
        keywords_en: Array.isArray(item.keywords_en) ? item.keywords_en.join(', ') : item.keywords_en || null,

        // Ensure other optional fields are correctly handled
        question_en: item.question_en || null,
        answer_en: item.answer_en || null,
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
        if (e.code) {
            console.error(`Prisma Error Code: ${e.code}`);
        }
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });