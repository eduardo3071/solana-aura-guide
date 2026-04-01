import { createContext, useContext, useState, ReactNode } from "react";

export type Locale = "en" | "pt" | "es";

const translations = {
  en: {
    // Hero
    "hero.title.before": "Understand",
    "hero.title.solana": "Solana",
    "hero.title.after": "instantly — powered by real protocol knowledge",
    "hero.badge": "terms · 14 categories · Official Solana Glossary",
    "hero.subtitle": "Instantly search, learn, and understand Solana concepts. Powered by the official @stbr/solana-glossary SDK with real AI assistance.",
    // Buttons
    "btn.copilot": "AI Copilot",
    "btn.explain_code": "Explain Code",
    "btn.browse_glossary": "Browse Glossary",
    // Nav
    "nav.glossary": "Glossary",
    "nav.copilot": "Copilot",
    "nav.explain_code": "Explain Code",
    // Copilot tabs
    "tab.copilot": "Copilot",
    "tab.explain_code": "Explain Code",
    "tab.explain_file": "Explain File",
    // Category
    "category.all": "All",
    "category.showing": "Showing",
    "category.of": "of",
    "category.load_more": "Load more",
  },
  pt: {
    "hero.title.before": "Entenda",
    "hero.title.solana": "Solana",
    "hero.title.after": "instantaneamente — com conhecimento real de protocolo",
    "hero.badge": "termos · 14 categorias · Glossário Oficial Solana",
    "hero.subtitle": "Pesquise, aprenda e entenda conceitos de Solana instantaneamente. Alimentado pelo SDK oficial @stbr/solana-glossary com assistência de IA.",
    "btn.copilot": "IA Copilot",
    "btn.explain_code": "Explicar Código",
    "btn.browse_glossary": "Explorar Glossário",
    "nav.glossary": "Glossário",
    "nav.copilot": "Copilot",
    "nav.explain_code": "Explicar Código",
    "tab.copilot": "Copilot",
    "tab.explain_code": "Explicar Código",
    "tab.explain_file": "Explicar Arquivo",
    "category.all": "Todos",
    "category.showing": "Mostrando",
    "category.of": "de",
    "category.load_more": "Carregar mais",
  },
  es: {
    "hero.title.before": "Entiende",
    "hero.title.solana": "Solana",
    "hero.title.after": "al instante — con conocimiento real de protocolo",
    "hero.badge": "términos · 14 categorías · Glosario Oficial Solana",
    "hero.subtitle": "Busca, aprende y comprende conceptos de Solana al instante. Impulsado por el SDK oficial @stbr/solana-glossary con asistencia de IA.",
    "btn.copilot": "IA Copilot",
    "btn.explain_code": "Explicar Código",
    "btn.browse_glossary": "Explorar Glosario",
    "nav.glossary": "Glosario",
    "nav.copilot": "Copilot",
    "nav.explain_code": "Explicar Código",
    "tab.copilot": "Copilot",
    "tab.explain_code": "Explicar Código",
    "tab.explain_file": "Explicar Archivo",
    "category.all": "Todos",
    "category.showing": "Mostrando",
    "category.of": "de",
    "category.load_more": "Cargar más",
  },
} as const;

type TranslationKey = keyof (typeof translations)["en"];

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("locale");
    return (saved as Locale) || "en";
  });

  const handleSetLocale = (l: Locale) => {
    setLocale(l);
    localStorage.setItem("locale", l);
  };

  const t = (key: TranslationKey): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  pt: "PT",
  es: "ES",
};
