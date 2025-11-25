// run-migrate.js

// 1. Manually load environment variables from .env.local
// This uses the 'dotenv' package you already installed.
require('dotenv').config({ path: require('path').resolve(__dirname, '.env.local') });

const { execSync } = require('child_process');

console.log('Environment loaded. Starting Prisma migration...');

// 2. Define the migration command
const migrateCommand = 'npx prisma migrate dev --name init_qna_table';

// 3. Execute the command using the loaded environment
try {
    // stdio: 'inherit' ensures you see all the output (like the confirmation prompt)
    execSync(migrateCommand, { stdio: 'inherit' });
    console.log('✅ Migration succeeded!');
} catch (error) {
    console.error('❌ Migration failed. Check the error output above.');
    process.exit(1);
}