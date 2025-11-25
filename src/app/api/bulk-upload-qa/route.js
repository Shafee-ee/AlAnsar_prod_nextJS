// src/app/api/bulk-upload-qa/route.js

import prisma from '../../../../libs/prisma'; // Adjust import path as needed
import { NextResponse } from 'next/server';

// --- THE PRE-TRANSLATED DATA PAYLOAD ---
// We place the data here temporarily for easy bulk insertion testing.
const QNA_DATA_PAYLOAD = [
    {
        "question_kn": "ನಮಾಝಿನ ನಿಯ್ಯತ್ತನ್ನು ನಡೆದುಕೊಂಡು ಬರುವಾಗ ಮಾಡಬಹುದೆ? ನಿಂತುಕೊಂಡೇ ಮಾಡಬೇಕೆಂದಿದೆಯೆ?",
        "answer_kn": "ನಿಂತುಕೊಂಡೇ ಆಗಬೇಕು. ನಿಶ್ಚಲ ಸ್ಥಿತಿಯಲ್ಲೇ ನಮಾಜಿನ ನಿಯ್ಯತ್ ಮಾಡಬೇಕೆನ್ನುವುದು ನಿಯ್ಯತ್‌ನ ಶರ್ತಗಳಲ್ಲೊಂದಾಗಿದೆ...",
        "keywords_kn": "ನಮಾಝ್, ನಿಯ್ಯತ್, ಫರ್ಳ್, ಸುನ್ನತ್, ನಿಲ್ಲುವುದು, ತಕ್ಬೀರತುಲ್ ಇಹ್ರಾಂ",
        "question_en": "Is it permissible to make the intention (Niyyat) for Salah while walking? Or must it be done while standing?",
        "answer_en": "It must be done while standing. Making the intention in a state of stability/stillness (Nischala Sthiti) is one of the preconditions (Shart) of the Niyyat...",
        "keywords_en": ["Salah", "Niyyat", "Intention", "Standing", "Fard", "Sunnah", "Takbiratul Ihram"]
    },
    {
        "question_kn": "ಮೂತ್ರ ಶಂಕೆಯ ನಂತರ ಕೊನೆಯಲ್ಲಿ ಉಳಿದ ಒಂದೆರಡು ಹನಿಗಳು ಕುಳಿತಲ್ಲಿಂದ ನೇರ ನಿಂತು ಕೊಂಡ ನಂತರ ಹೊರ ಬಂದು ವಸ್ತ್ರಕ್ಕೆ ತಾಗುತ್ತದೆ. ಇದನ್ನು ಶುಚೀಕರಿಸದೆ ಇದೇ ವಸ್ತ್ರದಲ್ಲಿ ನಮಾಜು ಮಾಡುವುದರಿಂದ ತೊಂದರೆ ಇದೆಯೆ?",
        "answer_kn": "ಮೂತ್ರದ ಒಂದು ಹನಿಯೂ ನಜಸ್ ಆಗಿದೆ. ಅದು ನಮಾಜು ಮಾಡುವವನ ವಸ್ತ್ರ, ಶರೀರದಲ್ಲಿದ್ದರೆ ಅದರೊಂದಿಗೆ ನಮಾಜು ಸಿಂಧುವಾಗುವುದಿಲ್ಲ...",
        "keywords_kn": "ಮೂತ್ರ, ನಜಸ್, ನಮಾಜು, ವಸ್ತ್ರ, ಶುಚೀಕರಣ, ಸುನ್ನತ್",
        "question_en": "After passing urine, if one or two remaining drops come out and touch the clothes after standing up, is the prayer valid if performed without cleaning the clothes?",
        "answer_en": "Even a single drop of urine is considered Najis (impure). If it is on the clothes or body of the person praying, the Salah is invalid...",
        "keywords_en": ["Urine", "Drops", "Clothes", "Najis", "Impure", "Wudu", "Salah", "Invalid"]
    },
    {
        "question_kn": "ನಮಾಜಿನಲ್ಲಿ ಕಾಲಿನ ಮಣಿಗಂಟಿನ ಕೆಳಗೆ ವಸ್ತ್ರವನ್ನು ಇಳಿ ಬಿಡುವುದರ ವಿಧಿ ಏನು? ಹೀಗೆ ವಸ್ತ್ರವು ಕೆಳಗಿದ್ದರೆ ನಮಾಜ್ ಸಿಂಧುವೆ?",
        "answer_kn": "ನಮಾಜಿನಲ್ಲಿ ಕಾಲಿನ ಮಣಿಗಂಟಿಗಿಂತ ಕೆಳಗೆ ವಸ್ತ್ರವು ಇಳಿದಿದ್ದರೆ ನಮಾಜ್‌ನ ಸಿಂದುತ್ವಕ್ಕೆ ಅಡ್ಡಿ ಇಲ್ಲ...",
        "keywords_kn": "ನಮಾಜು, ವಸ್ತ್ರ, ಮಣಿಗಂಟು, ಇಳಿ ಬಿಡುವುದು, ಕರಾಹತ್, ಹರಾಮ್",
        "question_en": "What is the ruling on lowering one's garment below the ankles during Salah? Is Salah valid if the garment is low?",
        "answer_en": "If the garment is below the ankles during Salah, it does not invalidate the Salah. However, for men, lowering the garment below the ankles... is Karāhat (disliked)...",
        "keywords_en": ["Garment", "Clothes", "Ankle", "Salah", "Valid", "Karahat", "Haram", "Arrogance"]
    },
    // ADD ALL 22 Q&A RECORDS HERE
    // (Note: I've only included the first three for brevity in this response. 
    // You must paste the full array from our previous conversion step.)
];
// ----------------------------------------------------

export async function POST(request) {
    // A simple check to prevent accidental bulk uploads in production
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ message: 'Bulk upload is disabled in production environment.' }, { status: 403 });
    }

    try {
        // 1. Clear existing data (optional, but good for testing)
        // await prisma.qnA.deleteMany({});

        // 2. Bulk Insertion
        const result = await prisma.qnA.createMany({
            data: QNA_DATA_PAYLOAD,
            skipDuplicates: true,
        });

        return NextResponse.json({
            message: `Successfully uploaded ${result.count} records.`,
            count: result.count
        });

    } catch (error) {
        console.error('Bulk upload error:', error);
        return NextResponse.json({
            message: 'Failed to process bulk upload.',
            error: error.message
        }, { status: 500 });
    }
}