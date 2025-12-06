import { NextResponse } from 'next/server';
import connectDB from '@/libs/mongodb.js';
import Article from '@/models/Article.js';

export async function GET() {
    try {
        await connectDB();

        const articles = await Article.find({})
            .sort({ date: -1 })
            .limit(20)
            .exec();

        return NextResponse.json({ articles });
    } catch (error) {
        console.error('API Error fetching articles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch articles', details: error.message },
            { status: 500 }
        );
    }
}
