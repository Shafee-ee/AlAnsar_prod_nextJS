import { adminDB } from "@/lib/firebaseAdmin";
import Link from "next/link";

export default async function EpaperViewer({ params }) {
  const { slug } = await params;

  const snap = await adminDB.collection("digipaper_issues").doc(slug).get();
  const issue = snap.data();

  return (
    <div className="relative h-screen ">
      <Link
        href="/digipaper"
        className="absolute left-5 top-4 z-50 text-white font-medium"
      >
        ← Back
      </Link>
      <iframe
        src={`/pdfjs/web/viewer.html?file=/api/pdf/${slug}#zoom=page-height`}
        className="w-full h-screen border-0"
        title={issue.title}
      />
    </div>
  );
}
