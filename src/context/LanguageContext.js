'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('kn') // default Kannada

    useEffect(() => {
        const stored = localStorage.getItem('site-lang')
        if (stored) setLang(stored)
    }, [])

    useEffect(() => {
        localStorage.setItem('site-lang', lang)
    }, [lang])

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    return useContext(LanguageContext)
}
