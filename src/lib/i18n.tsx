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
    "category.categories": "Categories",
    "category.all_terms": "All Terms",
    "category.terms_suffix": "Terms",
    "category.terms_count": "terms",
    "category.remaining": "remaining",
    // Category names
    "cat.core-protocol": "Core Protocol",
    "cat.programming-model": "Programming Model",
    "cat.token-ecosystem": "Token Ecosystem",
    "cat.defi": "DeFi",
    "cat.zk-compression": "ZK Compression",
    "cat.infrastructure": "Infrastructure",
    "cat.security": "Security",
    "cat.dev-tools": "Dev Tools",
    "cat.network": "Network",
    "cat.blockchain-general": "Blockchain General",
    "cat.web3": "Web3",
    "cat.programming-fundamentals": "Programming",
    "cat.ai-ml": "AI / ML",
    "cat.solana-ecosystem": "Solana Ecosystem",
    // Search
    "search.placeholder": "Search 1001 Solana terms…",
    // Chat
    "chat.title": "Solana Dev Copilot",
    "chat.subtitle": "Ask me anything about Solana development. I use the official glossary (1001 terms) + AI to give you accurate, contextual answers.",
    "chat.explain_title": "Explain Solana Code",
    "chat.explain_subtitle": "Paste any Solana/Anchor code and I'll explain every concept using the official glossary with 1001 terms.",
    "chat.placeholder": "Ask about Solana concepts…",
    "chat.explain_placeholder": "Paste Solana code to explain…",
    "chat.thinking": "Thinking…",
    // Chat demo questions
    "chat.demo.pda": "What is PDA in Solana?",
    "chat.demo.accounts": "Explain accounts like I'm a beginner",
    "chat.demo.poh": "How does Proof of History work?",
    "chat.demo.bft": "What's the difference between Tower BFT and traditional PBFT?",
    "chat.demo.amm": "What is an AMM and how does it work on Solana?",
    "chat.demo.zk": "Explain ZK Compression in Solana",
    // Code examples
    "chat.code.pda_label": "Explain PDA derivation",
    "chat.code.transfer_label": "Explain token transfer",
    // Explain file
    "file.paste_title": "Paste Code to Analyze",
    "file.try_example": "Try Example",
    "file.analyzing": "Analyzing file and glossary context…",
    "file.explain_btn": "Explain Entire File",
    "file.paste_placeholder": "Paste your Solana / Anchor / Rust / TypeScript code here...",
    "file.empty_hint": "Paste code above and click \"Explain Entire File\" to get a structured breakdown with glossary-powered insights.",
    "file.upload_btn": "Upload File",
    "file.export_btn": "Export Explanation",
    "file.drop_hint": "Drop a code file here",
    // Term detail
    "term.related": "Related Terms",
    "term.usage": "Used in Context",
    // 404
    "notfound.title": "404",
    "notfound.message": "Oops! Page not found",
    "notfound.link": "Return to Home",
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
    "category.categories": "Categorias",
    "category.all_terms": "Todos os Termos",
    "category.terms_suffix": "Termos",
    "category.terms_count": "termos",
    "category.remaining": "restantes",
    "cat.core-protocol": "Protocolo Central",
    "cat.programming-model": "Modelo de Programação",
    "cat.token-ecosystem": "Ecossistema de Tokens",
    "cat.defi": "DeFi",
    "cat.zk-compression": "Compressão ZK",
    "cat.infrastructure": "Infraestrutura",
    "cat.security": "Segurança",
    "cat.dev-tools": "Ferramentas Dev",
    "cat.network": "Rede",
    "cat.blockchain-general": "Blockchain Geral",
    "cat.web3": "Web3",
    "cat.programming-fundamentals": "Programação",
    "cat.ai-ml": "IA / ML",
    "cat.solana-ecosystem": "Ecossistema Solana",
    "search.placeholder": "Pesquisar 1001 termos Solana…",
    "chat.title": "Solana Dev Copilot",
    "chat.subtitle": "Pergunte qualquer coisa sobre desenvolvimento Solana. Uso o glossário oficial (1001 termos) + IA para respostas precisas e contextuais.",
    "chat.explain_title": "Explicar Código Solana",
    "chat.explain_subtitle": "Cole qualquer código Solana/Anchor e eu explico cada conceito usando o glossário oficial com 1001 termos.",
    "chat.placeholder": "Pergunte sobre conceitos Solana…",
    "chat.explain_placeholder": "Cole código Solana para explicar…",
    "chat.thinking": "Pensando…",
    "chat.demo.pda": "O que é PDA na Solana?",
    "chat.demo.accounts": "Explique accounts como se eu fosse iniciante",
    "chat.demo.poh": "Como funciona o Proof of History?",
    "chat.demo.bft": "Qual a diferença entre Tower BFT e PBFT tradicional?",
    "chat.demo.amm": "O que é um AMM e como funciona na Solana?",
    "chat.demo.zk": "Explique ZK Compression na Solana",
    "chat.code.pda_label": "Explicar derivação de PDA",
    "chat.code.transfer_label": "Explicar transferência de token",
    "file.paste_title": "Cole o Código para Analisar",
    "file.try_example": "Tentar Exemplo",
    "file.analyzing": "Analisando arquivo e contexto do glossário…",
    "file.explain_btn": "Explicar Arquivo Inteiro",
    "file.paste_placeholder": "Cole seu código Solana / Anchor / Rust / TypeScript aqui...",
    "file.empty_hint": "Cole o código acima e clique em \"Explicar Arquivo Inteiro\" para obter uma análise estruturada com insights do glossário.",
    "file.upload_btn": "Enviar Arquivo",
    "file.export_btn": "Exportar Explicação",
    "file.drop_hint": "Solte um arquivo de código aqui",
    "term.related": "Termos Relacionados",
    "term.usage": "Usado em Contexto",
    "notfound.title": "404",
    "notfound.message": "Ops! Página não encontrada",
    "notfound.link": "Voltar para o Início",
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
    "category.categories": "Categorías",
    "category.all_terms": "Todos los Términos",
    "category.terms_suffix": "Términos",
    "category.terms_count": "términos",
    "category.remaining": "restantes",
    "cat.core-protocol": "Protocolo Central",
    "cat.programming-model": "Modelo de Programación",
    "cat.token-ecosystem": "Ecosistema de Tokens",
    "cat.defi": "DeFi",
    "cat.zk-compression": "Compresión ZK",
    "cat.infrastructure": "Infraestructura",
    "cat.security": "Seguridad",
    "cat.dev-tools": "Herramientas Dev",
    "cat.network": "Red",
    "cat.blockchain-general": "Blockchain General",
    "cat.web3": "Web3",
    "cat.programming-fundamentals": "Programación",
    "cat.ai-ml": "IA / ML",
    "cat.solana-ecosystem": "Ecosistema Solana",
    "search.placeholder": "Buscar 1001 términos Solana…",
    "chat.title": "Solana Dev Copilot",
    "chat.subtitle": "Pregúntame lo que sea sobre desarrollo Solana. Uso el glosario oficial (1001 términos) + IA para respuestas precisas y contextuales.",
    "chat.explain_title": "Explicar Código Solana",
    "chat.explain_subtitle": "Pega cualquier código Solana/Anchor y te explico cada concepto usando el glosario oficial con 1001 términos.",
    "chat.placeholder": "Pregunta sobre conceptos Solana…",
    "chat.explain_placeholder": "Pega código Solana para explicar…",
    "chat.thinking": "Pensando…",
    "chat.demo.pda": "¿Qué es PDA en Solana?",
    "chat.demo.accounts": "Explica accounts como si fuera principiante",
    "chat.demo.poh": "¿Cómo funciona Proof of History?",
    "chat.demo.bft": "¿Cuál es la diferencia entre Tower BFT y PBFT tradicional?",
    "chat.demo.amm": "¿Qué es un AMM y cómo funciona en Solana?",
    "chat.demo.zk": "Explica ZK Compression en Solana",
    "chat.code.pda_label": "Explicar derivación de PDA",
    "chat.code.transfer_label": "Explicar transferencia de token",
    "file.paste_title": "Pega el Código para Analizar",
    "file.try_example": "Probar Ejemplo",
    "file.analyzing": "Analizando archivo y contexto del glosario…",
    "file.explain_btn": "Explicar Archivo Completo",
    "file.paste_placeholder": "Pega tu código Solana / Anchor / Rust / TypeScript aquí...",
    "file.empty_hint": "Pega el código arriba y haz clic en \"Explicar Archivo Completo\" para obtener un análisis estructurado con insights del glosario.",
    "file.upload_btn": "Subir Archivo",
    "file.export_btn": "Exportar Explicación",
    "file.drop_hint": "Suelta un archivo de código aquí",
    "term.related": "Términos Relacionados",
    "term.usage": "Usado en Contexto",
    "notfound.title": "404",
    "notfound.message": "¡Ups! Página no encontrada",
    "notfound.link": "Volver al Inicio",
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
