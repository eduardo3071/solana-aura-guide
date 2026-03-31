import { glossaryData } from "./data";
import type { GlossaryTerm, GlossaryCategory } from "./types";

export type { GlossaryTerm, GlossaryCategory };

export function getTerm(id: string): GlossaryTerm | undefined {
  return glossaryData.find((t) => t.id === id);
}

export function searchTerms(query: string): GlossaryTerm[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return glossaryData.filter(
    (t) =>
      t.term.toLowerCase().includes(q) ||
      t.shortDefinition.toLowerCase().includes(q) ||
      t.aliases.some((a) => a.toLowerCase().includes(q)) ||
      t.id.toLowerCase().includes(q)
  );
}

export function getAllTerms(): GlossaryTerm[] {
  return glossaryData;
}

export function getTermsByCategory(category: GlossaryCategory): GlossaryTerm[] {
  return glossaryData.filter((t) => t.category === category);
}

export function getCategories(): GlossaryCategory[] {
  return [...new Set(glossaryData.map((t) => t.category))];
}

export function getRelatedTerms(id: string): GlossaryTerm[] {
  const term = getTerm(id);
  if (!term) return [];
  return term.relatedTerms
    .map((rid) => getTerm(rid))
    .filter(Boolean) as GlossaryTerm[];
}
