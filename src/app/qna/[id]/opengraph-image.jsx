import { ImageResponse } from "next/og";
import { adminDB } from "@/lib/firebaseAdmin";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }) {
    const doc = await adminDB.collection("qna_items").doc(params.id).get();
    const data = doc.data();

    const question = data?.question_en || "Al Ansar Weekly";

    // Fetch background from public folder
    const bg = await fetch(
        new URL("/default-image/default-image-qna.jpg", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    ).then((res) => res.arrayBuffer());

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
                    color: "white",
                    textAlign: "center",
                    fontSize: 48,
                    fontWeight: 600,
                }}
            >
                <img
                    src={bg}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    {question}
                </div>
            </div>
        ),
        { ...size }
    );
}