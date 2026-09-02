"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function SoonToBePublished() {
  const { lang } = useLanguage();

  return (
    <main className="flex justify-center bg-white px-4 py-8">
      <Image
        src={
          lang === "en"
            ? "/soon-to-be-published.png"
            : "/soon-to-be-published.png"
        }
        alt="Articles coming soon"
        width={1280}
        height={853}
        className="w-full max-w-5xl h-auto"
        priority
      />
    </main>
  );
}
