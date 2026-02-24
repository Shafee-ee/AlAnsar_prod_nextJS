import { ImageResponse } from "next/og";
import { adminDB } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(request, context) {
    const { id, lang } = await context.params;

    const doc = await adminDB
        .collection("qna_items")
        .doc(id)
        .get();

    if (!doc.exists) {
        return new ImageResponse(
            (
                <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0B4C8C",
                    color: "white",
                    fontSize: 48,
                }}>
                    Al Ansar Weekly
                </div>
            ),
            { width: 1200, height: 630 }
        );
    }

    const data = doc.data();

    const question =
        lang === "kn"
            ? data.question_kn || data.question_en
            : data.question_en || data.question_kn;

    const maxLength = 200;

    let displayText = question;

    if (question && question.length > maxLength) {
        displayText =
            question.slice(0, maxLength).split(" ").slice(0, -1).join(" ") + "...";
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "80px",
                    textAlign: "center",
                    color: "white",
                    fontSize: 44,
                    fontWeight: 500,
                }}
            >
                <img
                    src={`${process.env.NEXT_PUBLIC_SITE_URL}/default-image/og-image.jpg`}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: 1200,
                        height: 630,
                        objectFit: "cover",
                    }}
                />

                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(10, 25, 80, 0.5)",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        maxWidth: "900px",
                        lineHeight: 1.3,
                    }}
                >
                    {displayText}
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}