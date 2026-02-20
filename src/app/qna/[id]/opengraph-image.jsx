import { ImageResponse } from "next/og";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image({ params }) {
    const question = "Is it better to break the fast as soon as the adhan starts or after the adhan finishes?";

    const bg = await fetch(
        new URL("/default-image/default-image-qna", process.env.NEXT_PUBLIC_SITE_URL)
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
                    padding: "120px 120px 80px 120px",
                    textAlign: "center",
                    color: "white",
                    fontSize: 52,
                    fontWeight: 500,
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

                <div style={{ position: "relative", zIndex: 1 }}>
                    {question}
                </div>
            </div>
        ),
        { ...size }
    );
}