import { ImageResponse } from "next/og";
import { adminDB } from "@/lib/firebaseAdmin";
import { readFile } from "fs/promises";
import path from "path";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/jpeg";
export const runtime = "nodejs";

export default async function Image(props) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const { id } = params;
    const lang = searchParams?.lang || "en";

    // Load Kannada font
    const fontData = await readFile(
        path.join(process.cwd(), "public/fonts/DOES_NOT_EXIST.ttf"));

    const doc = await adminDB.collection("qna_items").doc(id).get();

    // Fallback if doc missing
    if (!doc.exists) {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#0B4C8C",
                        color: "white",
                        fontSize: 48,
                        fontFamily: "NotoKannada",
                    }}
                >
                    Al Ansar Weekly
                </div>
            ),
            {
                ...size,
                fonts: [
                    {
                        name: "NotoKannada",
                        data: fontData,
                        style: "normal",
                        weight: 400,
                    },
                ],
            }
        );
    }

    const data = doc.data();

    const question =
        lang === "kn"
            ? data.question_kn || data.question_en
            : data.question_en || data.question_kn || "Al Ansar Weekly";

    const base =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://www.alansarweekly.com";

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
                    fontFamily: "NotoKannada",
                }}
            >
                <img
                    src={`${base}/default-image/og-image.jpg`}
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
                        position: "absolute",
                        bottom: 40,
                        fontSize: 28,
                        opacity: 0.9,
                        fontFamily: "NotoKannada",
                    }}
                >
                    Read the full answer at AlAnsarWeekly.com
                </div>

                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        maxWidth: "900px",
                        lineHeight: 1.3,
                        fontFamily: "NotoKannada",
                    }}
                >
                    {question.length > 140
                        ? question.slice(0, 137) + "..."
                        : question}
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                {
                    name: "NotoKannada",
                    data: fontData,
                    style: "normal",
                    weight: 400,
                },
            ],
        }
    );
}