import { adminDB } from "@/lib/firebaseAdmin";
import Link from "next/link";
import DigiFilters from "@/components/DigiFilters";

export const dynamic = "force-dynamic";

const PER_PAGE = 8;

function formatDigiPaperTitle(title, type) {
  if (!title) {
    return {
      title: "",
      subtitle: "",
    };
  }

  if (type === "weekly") {
    const match = title.match(
      /^(.*?)(?:\s+)(Vloume|Volume):\s*(\d+)\s*-\s*Issue:\s*(\d+)$/i,
    );

    if (match) {
      return {
        title: match[1].trim(),
        subtitle: `Vol. ${match[3]} · No. ${match[4]}`,
      };
    }

    return {
      title,
      subtitle: "",
    };
  }

  if (type === "monthly") {
    const match = title.match(/^(\d{4}(?:-\d{2})?)\s+(.+)$/i);

    if (match) {
      return {
        title: match[1].trim(),
        subtitle: match[2].trim(),
      };
    }

    return {
      title,
      subtitle: "",
    };
  }

  if (type === "special") {
    const match = title.match(/^(.*?)(?:\s*-\s*)(\d{4})$/);

    if (match) {
      return {
        title: match[1].trim(),
        subtitle: match[2],
      };
    }

    return {
      title,
      subtitle: "",
    };
  }

  return {
    title,
    subtitle: "",
  };
}

export default async function DigiPaperListing(props) {
  const searchParams = await props.searchParams;

  const page = parseInt(searchParams?.page || "1", 10);
  const selectedYear = searchParams?.year ? parseInt(searchParams.year) : null;

  const selectedType = searchParams?.type || "weekly";

  const offset = (page - 1) * PER_PAGE;

  let baseQuery = adminDB
    .collection("digipaper_issues")
    .where("status", "==", "published");

  if (selectedType) {
    baseQuery = baseQuery.where("type", "==", selectedType);
  }

  const monthParam = searchParams?.month;

  const selectedMonth =
    monthParam === undefined || monthParam === ""
      ? null
      : parseInt(monthParam, 10);

  if (selectedYear) {
    if (selectedMonth !== null) {
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 1);

      baseQuery = baseQuery
        .where("publishDate", ">=", startDate)
        .where("publishDate", "<", endDate);
    } else {
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear + 1, 0, 1);

      baseQuery = baseQuery
        .where("publishDate", ">=", startDate)
        .where("publishDate", "<", endDate);
    }
  }

  baseQuery = baseQuery.orderBy("createdAt", "asc");
  //get total count efficiency
  const totalSnapshot = await baseQuery.count().get();
  const total = totalSnapshot.data().count;

  //get needed pages only
  let pageQuery = baseQuery.limit(PER_PAGE);

  if (page > 1) {
    const previousDocsSnapShot = await baseQuery
      .limit((page - 1) * PER_PAGE)
      .get();

    const lastVisible =
      previousDocsSnapShot.docs[previousDocsSnapShot.docs.length - 1];

    pageQuery = baseQuery.startAfter(lastVisible).limit(PER_PAGE);
  }

  const snapshot = await pageQuery.get();

  const issues = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const totalPages = Math.ceil(total / PER_PAGE);

  // Fetch distinct years for dropdown
  const yearSnapshot = await adminDB
    .collection("digipaper_issues")
    .where("status", "==", "published")
    .select("publishDate")
    .get();

  const years = [
    ...new Set(
      yearSnapshot.docs.map((doc) =>
        doc.data().publishDate.toDate().getFullYear(),
      ),
    ),
  ].sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      {/*Type filter*/}

      {/* Year Filter */}
      <div className="max-w-6xl mx-auto mb-6">
        <DigiFilters
          selectedType={selectedType}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          years={years}
        />
      </div>

      {/* Showing Info */}
      <div className="max-w-6xl mx-auto mb-6 text-sm text-gray-600">
        Showing {total === 0 ? 0 : offset + 1}–
        {Math.min(offset + PER_PAGE, total)} of {total}
      </div>

      {/* Content Grid*/}
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {issues.map((issue) => {
          const formatted = formatDigiPaperTitle(issue.title, issue.type);

          return (
            <Link
              key={issue.id}
              href={`/digipaper/${issue.slug}`}
              className="bg-white shadow hover:shadow-lg transition p-3 active:scale-[0.98]"
            >
              <img
                src={issue.coverImageUrl}
                alt={issue.title}
                className="w-full h-auto"
              />

              <div className="mt-3 text-center">
                <h3 className="text-xs font-semibold text-gray-900 leading-tight">
                  {formatted.title}
                </h3>

                {formatted.subtitle && (
                  <p className="mt-1 text-xs text-gray-500 leading-tight">
                    {formatted.subtitle}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 gap-2">
        {page > 1 && (
          <Link
            href={`/digipaper?page=${page - 1}&type=${selectedType}${selectedYear ? `&year=${selectedYear}` : ""}${selectedMonth !== null ? `&month=${selectedMonth}` : ""}`}
            className="px-3 py-1 border border-gray-300 bg-white text-gray-900 text-sm active:scale-95 transition-transform"
          >
            Prev
          </Link>
        )}

        {Array.from({ length: totalPages })
          .filter(
            (_, i) =>
              i === 0 || i === totalPages - 1 || Math.abs(i + 1 - page) <= 2,
          )
          .map((_, i) => (
            <Link
              key={i}
              href={`/digipaper?page=${i + 1}&type=${selectedType}${selectedYear ? `&year=${selectedYear}` : ""}${selectedMonth !== null ? `&month=${selectedMonth}` : ""}`}
              className={`px-3 py-1 border border-gray-300 text-sm ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-900"
              }`}
            >
              {i + 1}
            </Link>
          ))}

        {page < totalPages && (
          <Link
            href={`/digipaper?page=${page + 1}&type=${selectedType}${selectedYear ? `&year=${selectedYear}` : ""}${selectedMonth !== null ? `&month=${selectedMonth}` : ""}`}
            className="px-3 py-1 border border-gray-300 bg-white text-gray-900 text-sm"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
