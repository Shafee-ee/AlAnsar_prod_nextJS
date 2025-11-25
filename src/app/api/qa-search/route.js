import { NextResponse } from 'next/server';
import prisma from '../../../../libs/prisma';
export async function POST(request) {
    const queryStartTime = Date.now();
    let searchQuery = '';

    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return NextResponse.json({ error: 'A valid search query is required.' }, { status: 400 });
        }

        searchQuery = query.trim();

        const results = await prisma.qna.findMany({
            where: {
                OR: [
                    {
                        question_en: {
                            contains: searchQuery,
                            mode: 'insensitive'
                        }
                    },
                    {
                        keywords_en: {
                            contains: searchQuery,
                            mode: 'insensitive'
                        }
                    },
                    {
                        question_kn: {
                            contains: searchQuery,
                            mode: 'insensitive'
                        }
                    },
                ],
            },
            take: 5,
        });

        const queryDuration = Date.now() - queryStartTime;
        console.log(`[QA Search] Query: "${searchQuery}" | Duration: ${queryDuration}ms | Results: ${results.length}`);


        if (results.length > 0) {
            const bestResult = results[0];

            return NextResponse.json({
                success: true,
                answer: bestResult.answer_en,
                sourceQuestion_kn: bestResult.question_kn,
                keywords: bestResult.keywords_en,
            });
        }

        return NextResponse.json({
            success: false,
            answer: "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿಯನ್ನು ನನ್ನ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಕಂಡುಹಿಡಿಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ರೀತಿಯಲ್ಲಿ ಪ್ರಯತ್ನಿಸಿ."
        });

    } catch (error) {
        const errorDetails = error.message.split('\n').filter(line => line.trim() !== '').slice(0, 3).join(' | ');
        console.error(`[QA Search] CRITICAL SERVER ERROR for query: "${searchQuery}"`, error);

        return NextResponse.json({
            error: 'Internal Server Error during search process.',
            answer: "ಒಳಾಂಗಣ ಸರ್ವರ್ ದೋಷ. (Internal Server Error)",
            details: errorDetails
        }, { status: 500 });
    }
}