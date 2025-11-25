// prisma.config.js
// Explicitly loads .env.local variables for the CLI
require('dotenv').config({ path: './.env.local' });

const config = {
    // Points to the schema file
    schema: './prisma/schema.prisma',

    // REQUIRED by Prisma CLI v7 for migrations: tells it to use the environment variable
    datasource: {
        url: process.env.DATABASE_URL,
    },
};

module.exports = config;