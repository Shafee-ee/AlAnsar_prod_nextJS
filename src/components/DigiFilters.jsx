"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function DigiFilters({ selectedType, selectedYear }) {
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

  return (
    <div className="flex gap-4">
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
  );
}
