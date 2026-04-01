import { useMemo } from "react";
import { useI18n, Locale } from "@/lib/i18n";
import {
  allTerms,
  getCategories,
  type GlossaryTerm,
  type Category,
} from "@/lib/solana-glossary";

import ptTranslations from "@/lib/solana-glossary/i18n/pt.json";
import esTranslations from "@/lib/solana-glossary/i18n/es.json";

type I18nMap = Record<string, { term: string; definition: string }>;

const i18nData: Record<string, I18nMap> = {
  pt: ptTranslations as I18nMap,
  es: esTranslations as I18nMap,
};

function localizeTerms(terms: GlossaryTerm[], locale: Locale): GlossaryTerm[] {
  if (locale === "en") return terms;
  const map = i18nData[locale];
  if (!map) return terms;
  return terms.map((t) => {
    const override = map[t.id];
    if (!override) return t;
    return {
      ...t,
      term: override.term || t.term,
      definition: override.definition || t.definition,
    };
  });
}

function localizeTerm(term: GlossaryTerm, locale: Locale): GlossaryTerm {
  if (locale === "en") return term;
  const map = i18nData[locale];
  if (!map) return term;
  const override = map[term.id];
  if (!override) return term;
  return {
    ...term,
    term: override.term || term.term,
    definition: override.definition || term.definition,
  };
}

export function useGlossary() {
  const { locale } = useI18n();

  const localizedAllTerms = useMemo(
    () => localizeTerms(allTerms, locale),
    [locale]
  );

  const termMap = useMemo(
    () => new Map(localizedAllTerms.map((t) => [t.id, t])),
    [localizedAllTerms]
  );

  const getAllTerms = () => localizedAllTerms;

  const getTermsByCategory = (category: Category) =>
    localizedAllTerms.filter((t) => t.category === category);

  const getTerm = (id: string) => termMap.get(id);

  const getRelatedTerms = (id: string): GlossaryTerm[] => {
    const term = termMap.get(id);
    if (!term) return [];
    return (term.related ?? [])
      .map((rid) => termMap.get(rid))
      .filter(Boolean) as GlossaryTerm[];
  };

  const searchTerms = (query: string): GlossaryTerm[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return localizedAllTerms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.id.includes(q) ||
        t.aliases?.some((a) => a.toLowerCase().includes(q))
    );
  };

  return {
    allTerms: localizedAllTerms,
    getAllTerms,
    getTermsByCategory,
    getTerm,
    getRelatedTerms,
    searchTerms,
    getCategories,
    localizeTerm: (term: GlossaryTerm) => localizeTerm(term, locale),
  };
}
