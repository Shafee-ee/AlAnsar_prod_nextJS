import { adminDB } from "@/lib/firebaseAdmin";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PER_PAGE = 8;

export default async function DigiPaperListing(props) {
    const searchParams = await props.searchParams;

    const page = parseInt(searchParams?.page || "1", 10);
    const selectedYear = searchParams?.year
        ? parseInt(searchParams.year)
        : null;

    const offset = (page - 1) * PER_PAGE;


    let baseQuery = adminDB
        .collection("digipaper_issues")
        .where("status", "==", "published");

    if (selectedYear) {
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear + 1, 0, 1);


        baseQuery = baseQuery
            .where("publishDate", ">=", startDate)
            .where("publishDate", "<", endDate);
    }

    baseQuery = baseQuery.orderBy("publishDate", "desc");

    //get total count efficiency
    const totalSnapshot = await baseQuery.count().get();
    const total = totalSnapshot.data().count;

    //get needed pages only
    let pageQuery = baseQuery.limit(PER_PAGE);

    if (page > 1) {
        const previousDocsSnapShot = await baseQuery
            .limit((page - 1) * PER_PAGE)
            .get()

        const lastVisible =
            previousDocsSnapShot.docs[previousDocsSnapShot.docs.length - 1];
        pageQuery = baseQuery.startAfter(lastVisible).limit(PER_PAGE);
    }

    const snapshot = await pageQuery.get();

    const issues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }))

    const totalPages = Math.ceil(total / PER_PAGE);

    // Fetch distinct years for dropdown
    const yearSnapshot = await adminDB
        .collection("digipaper_issues")
        .where("status", "==", "published")
        .select("publishDate")
        .get();

    const years = [
        ...new Set(
            yearSnapshot.docs.map(doc =>
                doc.data().publishDate.toDate().getFullYear()
            )
        ),
    ].sort((a, b) => b - a);

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">

            {/* Year Filter */}
            <div className="max-w-6xl mx-auto mb-6 flex gap-4 text-sm">
                <Link
                    href="/digipaper"
                    className={!selectedYear ? "font-bold" : ""}
                >
                    All Years
                </Link>

                {years.map((year) => (
                    <Link
                        key={year}
                        href={`/digipaper?year=${year}`}
                        className={selectedYear === year ? "font-bold" : ""}
                    >
                        {year}
                    </Link>
                ))}
            </div>

            {/* Showing Info */}
            <div className="max-w-6xl mx-auto mb-6 text-sm text-gray-600">
                Showing {total === 0 ? 0 : offset + 1}–
                {Math.min(offset + PER_PAGE, total)} of {total}
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6">
                {issues.map((issue) => (
                    <a
                        key={issue.id}
                        href={issue.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white shadow hover:shadow-lg transition p-4"
                    >
                        <img
                            src={issue.coverImageUrl}
                            alt={issue.title}
                            className="w-full h-auto"
                        />
                        <h3 className="mt-3 font-semibold text-gray-800 text-center">
                            {issue.title}
                        </h3>
                    </a>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 gap-2">

                {page > 1 && (
                    <Link
                        href={`/digipaper?page=${page - 1}${selectedYear ? `&year=${selectedYear}` : ""}`}
                        className="px-3 py-1 border bg-white"
                    >
                        Prev
                    </Link>
                )}

                {Array.from({ length: totalPages })
                    .filter((_, i) =>
                        i === 0 ||
                        i === totalPages - 1 ||
                        Math.abs(i + 1 - page) <= 2
                    )
                    .map((_, i) => (
                        <Link
                            key={i}
                            href={`/digipaper?page=${i + 1}${selectedYear ? `&year=${selectedYear}` : ""}`}
                            className={`px-3 py-1 border ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white"
                                }`}
                        >
                            {i + 1}
                        </Link>
                    ))}

                {page < totalPages && (
                    <Link
                        href={`/digipaper?page=${page + 1}${selectedYear ? `&year=${selectedYear}` : ""}`}
                        className="px-3 py-1 border bg-white"
                    >
                        Next
                    </Link>
                )}
            </div>
        </div>
    );
}