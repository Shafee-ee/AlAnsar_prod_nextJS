import { ImageResponse } from "next/og";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

// Force Node runtime instead of Edge
export const runtime = "nodejs";

export default async function Image({ params }) {
    const question = "Al Ansar Weekly";

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: "#0B3D91",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "80px",
                    color: "white",
                    fontSize: 48,
                    fontWeight: 600,
                    textAlign: "center",
                }}
            >
                {question}
            </div>
        ),
        { ...size }
    );
}