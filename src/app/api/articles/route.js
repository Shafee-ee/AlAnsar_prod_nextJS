// src/app/api/articles/route.js - CORRECT CONTENT

import { NextResponse } from 'next/server';
// 🚨 This imports the function to connect to MongoDB
import connectDB from '@/libs/mongodb';
// 🚨 This imports the Mongoose Model definition
import Article from '@/models/Article';

export async function GET() {
    try {
        // 1. Connect to the database
        await connectDB();

        // 2. Query the MongoDB collection
        const articles = await Article.find({})
            .sort({ date: -1 }) // Sort by newest date
            .limit(20)
            .exec();

        return NextResponse.json({ articles }, { status: 200 });
    } catch (error) {
        console.error('API Error fetching articles (MongoDB):', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch articles',
                details: error.message
            },
            { status: 500 }
        );
    }
}