import { cookies } from "next/headers"
import { translations, type Language, type TranslationKey } from "./translations"

export async function getServerLang(): Promise<Language> {
  const store = await cookies()
  const lang = store.get("tz_language")?.value as Language | undefined
  if (lang && translations[lang]) return lang
  return "es"
}

export async function getServerT() {
  const lang = await getServerLang()
  return {
    lang,
    t: (key: string): string => {
      const translation = (translations[lang] as any)[key]
      return translation || (translations.es as any)[key] || key
    },
  }
}
