import { adminDB } from "@/lib/firebaseAdmin";
import Link from "next/link";

export default async function EpaperViewer({ params }) {
  const { slug } = await params;

  const snap = await adminDB.collection("digipaper_issues").doc(slug).get();
  const issue = snap.data();

  return (
    <div className="p-8 ">
      <Link href="/digipaper" className="text-white">
        ← Back
      </Link>

      <iframe src={issue.pdfUrl} className="w-full h-[calc(100vh-80px)]" />
    </div>
  );
}
