import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma.js';

export async function GET() {
    try {
        const qnaData = await prisma.qna.findMany({
            orderBy: {
                id: 'asc',
            },

            select: {
                question_kn: true,
                answer_kn: true,
                question_en: true,
                answer_en: true,
            }
        });
        return NextResponse.json({ data: qnaData }, { status: 200 });
    } catch (error) {
        console.error('API Error fetching QnA data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch QnA data', details: error.message },
            { status: 500 }
        );
    } finally {
        console.error('finally')
    }
}