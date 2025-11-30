import { NextResponse } from 'next/server';
// FIX: This line now correctly imports from your file: '@/libs/firebase'
import { searchQna } from '@/libs/firebase';

// Handles POST requests to search the Qna database
export async function POST(request) {
    try {
        const { query } = await request.json();

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return NextResponse.json({
                success: false,
                answer: "ಪ್ರಶ್ನೆ ಇಲ್ಲ (No query provided)."
            }, { status: 400 });
        }

        // Execute the search using the Firebase utility
        const bestMatch = await searchQna(query);

        // This logic is designed to work with the data structure in libs/firebase.js
        if (!bestMatch) {
            return NextResponse.json({
                success: false,
                answer: "ಕ್ಷಮಿಸಿ, ಈ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿಯನ್ನು ನನ್ನ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಕಂಡುಹಿಡಿಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ರೀತಿಯಲ್ಲಿ ಪ್ರಯತ್ನಿಸಿ."
            }, { status: 200 });
        }

        // Return the successful response
        return NextResponse.json({
            success: true,
            // Assuming the Firestore document has these fields
            answer: bestMatch.answer_en,
            sourceQuestion_kn: bestMatch.question_kn,
            // Handle keywords array/string conversion
            keywords: Array.isArray(bestMatch.keywords_en) ? bestMatch.keywords_en :
                (typeof bestMatch.keywords_en === 'string' ? bestMatch.keywords_en.split(',').map(k => k.trim()) : [])
        }, { status: 200 });

    } catch (error) {
        console.error('Fatal Error in QA Search API (Firebase):', error);
        return NextResponse.json({
            success: false,
            answer: "ಸರ್ವರ್ ದೋಷದಿಂದಾಗಿ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ."
        }, { status: 500 });
    }
}