export async function translateText(text, targetLang) {
    const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: text,
                target: targetLang
            })
        }
    );

    const data = await res.json();

    const translated =
        data?.data?.translations?.[0]?.translatedText || "";

    console.log("Translating:", text);
    console.log("Translated to:", targetLang);
    console.log("Translation result:", translated);

    return translated;
}
