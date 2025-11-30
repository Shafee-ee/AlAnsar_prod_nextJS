import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAySRlfVEea8zhAkDwNMUilvCWZ6nNjgcs",
    authDomain: "alansarweekly-274aa.firebaseapp.com",
    projectId: "alansarweekly-274aa",
    storageBucket: "alansarweekly-274aa.firebasestorage.app",
    messagingSenderId: "983745199988",
    appId: "1:983745199988:web:846226c9fe29e3731d7621"
};

const APP_ID = firebaseConfig.projectId;
const INITIAL_AUTH_TOKEN = "";

let db;

const initializeAndAuthenticate = async () => {

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    const auth = getAuth(app);

    try {
        let userCredential;
        if (INITIAL_AUTH_TOKEN) {
            userCredential = await signInWithCustomToken(auth, INITIAL_AUTH_TOKEN);
        } else {
            // Signs in anonymously. Requires Anonymous Auth to be enabled in Firebase Console.
            userCredential = await signInAnonymously(auth);
        }
        console.log(`Authenticated successfully. User ID: ${userCredential.user.uid}`);
        return userCredential.user.uid;
    } catch (e) {
        // This will now only fail if Anonymous Auth is NOT enabled in the console.
        console.error("Authentication failed:", e);
        return null;
    }
};

/**
 * Inserts sample Q&A data into the public Firestore collection.
 */
const seedDatabase = async () => {
    const userId = await initializeAndAuthenticate();
    if (!userId) {
        console.log("Cannot seed database. Exiting.");
        return;
    }

    const QNA_DATA = [
        {
            question_en: "What is the Quran?",
            question_kn: "ಕುರಾನ್ ಎಂದರೇನು?",
            answer_en: "The Quran is the central religious text of Islam, believed by Muslims to be a revelation from God (Allah). It is considered the finest work in classical Arabic literature."
        },
        {
            question_en: "Who is Prophet Muhammad?",
            question_kn: "ಪ್ರವಾದಿ ಮುಹಮ್ಮದ್ ಯಾರು?",
            answer_en: "Prophet Muhammad, peace be upon him (PBUH), is considered the last prophet sent by God to guide humanity, known as the founder of Islam."
        },
        {
            question_en: "What is Hadith?",
            question_kn: "ಹದೀಸ್ ಎಂದರೇನು?",
            answer_en: "Hadith refers to the record of the words, actions, and silent approvals of the Islamic prophet Muhammad. It is the second most important source of legislation in Islam after the Quran."
        },
        {
            question_en: "What is the meaning of Islam?",
            question_kn: "ಇಸ್ಲಾಂ ಧರ್ಮದ ಅರ್ಥವೇನು?",
            answer_en: "The word 'Islam' means 'submission to the will of God' and is derived from the root word *salaam*, meaning peace."
        }
    ];

    // Define the public path: /artifacts/{APP_ID}/public/data/qna
    const collectionPath = `/artifacts/${APP_ID}/public/data/qna`;
    const qnaCollection = collection(db, collectionPath);
    let successCount = 0;

    console.log(`Starting database seeding into collection: ${collectionPath}`);

    for (const data of QNA_DATA) {
        try {
            await addDoc(qnaCollection, {
                question_en: data.question_en,
                question_kn: data.question_kn,
                answer_en: data.answer_en,
                // These fields are necessary for the search function in libs/firebase.js to work.
                keywords_en: [data.question_en.toLowerCase().split(/\s+/).filter(t => t.length > 2).join(' ')],
                createdAt: new Date(),
                seededBy: userId
            });
            successCount++;
        } catch (e) {
            console.error(`Failed to add document for question: "${data.question_en}"`, e);
        }
    }

    if (successCount === QNA_DATA.length) {
        console.log(`\n✅ Success! ${successCount} Q&A documents successfully added to Firestore.`);
        console.log("You can now run your Next.js application (npm run dev) and start chatting!");
    } else {
        console.log(`\n⚠️ Seeding finished, but only ${successCount} of ${QNA_DATA.length} documents were added.`);
    }
};

seedDatabase();
