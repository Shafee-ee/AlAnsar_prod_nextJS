import { ImageResponse } from "next/og";

export const size = {
    width: 1100,
    height: 578,
};

export const contentType = "image/jpeg";
export const runtime = "nodejs";

export default async function Image({ params }) {
    const question = "Is it better to break the fast as soon as the adhan starts or after the adhan finishes?";
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.alansarweekly.com";

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
                    fontSize: 46,
                    fontWeight: 500,
                }}
            >
                <img
                    src={bg}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.25)"
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