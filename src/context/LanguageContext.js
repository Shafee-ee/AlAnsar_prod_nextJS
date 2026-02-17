"use client";

import { createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";

const LanguageContext = createContext({ lang: "kn" });

export function LanguageProvider({ children }) {
    const searchParams = useSearchParams();

    const lang =
        searchParams?.get("lang") === "en" ? "en" : "kn";

    return (
        <LanguageContext.Provider value={{ lang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
