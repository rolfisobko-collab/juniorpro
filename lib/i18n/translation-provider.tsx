"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Language, type TranslationKey } from "./translations"

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const STORAGE_KEY = "tz_language"

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es")

  useEffect(() => {
    // Load language from localStorage or browser preference
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    } else {
      // Detect browser language (only Spanish or Portuguese)
      const browserLang = navigator.language.split("-")[0] as Language
      if (browserLang === "pt" && translations[browserLang]) {
        setLanguageState(browserLang)
      } else {
        // Default to Spanish
        setLanguageState("es")
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    // También guardar en cookie para que server components puedan leerlo
    document.cookie = `tz_language=${lang};path=/;max-age=31536000;SameSite=Lax`
  }

  const t = (key: string): string => {
    const translation = (translations[language] as any)[key]
    return translation || (translations.es as any)[key] || key
  }

  const contextValue = {
    language,
    setLanguage,
    t
  }

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
