"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const LanguageContext = createContext({ lang: "kn" });

export function LanguageProvider({ children }) {
  const searchParams = useSearchParams();

  const [lang, setLang] = useState("kn");

  useEffect(() => {
    const urlLang = searchParams?.get("lang");

    if (urlLang === "en" || urlLang === "kn") {
      setLang(urlLang);
      localStorage.setItem("lang", urlLang);
    } else {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "kn") {
        setLang(saved);
      }
    }
  }, [searchParams]);

  return (
    <LanguageContext.Provider value={{ lang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
