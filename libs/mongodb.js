// libs/mongodb.js

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // We already confirmed MONGODB_URI is set, but this is good practice.
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Check if a connection is already cached (prevents hot-reload connection leaks)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn; // Return existing connection
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Recommended for Next.js/Serverless
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;