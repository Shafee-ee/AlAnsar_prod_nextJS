import { PrismaClient } from '@prisma/client';

/**
 * Next.js-friendly Prisma Singleton Client
 * * This robust pattern ensures that a single instance of PrismaClient is created 
 * and reused across all modules. This is essential to prevent multiple 
 * connections during Next.js's hot-reloading in development, which is the 
 * root cause of the "Cannot read properties of undefined (reading '__internal')" TypeError.
 */
const prismaClientSingleton = () => {
    // You can add specific configuration here, e.g., logging
    return new PrismaClient();
};

// Use globalThis to access the global object consistently across environments
const globalForPrisma = globalThis;

// Check if a client instance already exists on the global object
// If not, create and store it.
if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prismaClientSingleton();
}

const prisma = globalForPrisma.prisma;

// Export the single instance defined above.
export default prisma;