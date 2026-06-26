import { NextResponse } from "next/server";
import { adminDB, adminStorage } from "@/lib/firebaseAdmin";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const snap = await adminDB.collection("digipaper_issues").doc(slug).get();

    if (!snap.exists) {
      return new NextResponse("Issues not found", { status: 404 });
    }

    const issue = snap.data();

    const url = new URL(issue.pdfUrl);
    const path = decodeURIComponent(url.pathname.split("/o/")[1]);

    const bucket = adminStorage.bucket();
    const file = bucket.file(path);

    const [buffer] = await file.download();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": buffer.length.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": "inline",
      },
    });
  } catch (err) {
    console.error(err);
    return new NextResponse("Failed to Load PDF", { status: 500 });
  }
}
