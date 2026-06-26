"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function DigiFilters({
  selectedType,
  selectedYear,
  selectedMonth,
  years,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const handleChange = (type) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("type", type);
    params.delete("page"); // reset pagination

    startTransition(() => {
      router.push(`/digipaper?${params.toString()}`);
    });
  };

  const handleYearChange = (year) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("year", year);
    params.delete("page");

    startTransition(() => {
      router.push(`/digipaper?${params.toString()}`);
    });
  };

  const handleMonthChange = (month) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("month", month);
    params.delete("page");

    startTransition(() => {
      router.push(`/digipaper?${params.toString()}`);
    });
  };

  const months = [
    "January",
    "Febuary",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-4 ">
        {["weekly", "monthly", "special"].map((type) => (
          <button
            key={type}
            onClick={() => handleChange(type)}
            className={`px-4 py-2 rounded transition ${
              selectedType === type
                ? "bg-green-200 border-2 border-green-600"
                : "bg-gray-100 border"
            } ${isPending ? "opacity-70" : ""}`}
          >
            {type}
            {isPending && selectedType === type && (
              <span className="ml-2 inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4 ">
        <select
          value={selectedYear ?? ""}
          onChange={(e) => handleYearChange(e.target.value)}
        >
          <option value="">All Years</option>

          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {selectedType === "weekly" && (
          <select
            value={selectedMonth ?? ""}
            onChange={(e) => handleMonthChange(e.target.value)}
          >
            <option value="">All Months</option>
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
