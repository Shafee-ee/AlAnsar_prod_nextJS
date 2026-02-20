import { ImageResponse } from "next/og";
import { adminDB } from "@/lib/firebaseAdmin";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/jpeg";
export const runtime = "nodejs";

export default async function Image({ params }) {
    const { id } = params;

    const doc = await adminDB.collection("qna_items").doc(id).get();
    const data = doc.data();

    const question =
        data?.question_en ||
        "Al Ansar Weekly";

    const base =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://www.alansarweekly.com";

    const response = await fetch(
        new URL("/default-image/og-image.jpg", base)
    );

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const bg = `data:image/jpeg;base64,${base64}`;

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
                    src={bg}
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

                <div style={{ position: "relative", zIndex: 1 }}>
                    {question}
                </div>
            </div>
        ),
        size
    );
}