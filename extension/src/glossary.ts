import * as fs from "fs";
import * as path from "path";

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  related?: string[];
  aliases?: string[];
}

let allTerms: GlossaryTerm[] = [];
let termMap: Map<string, GlossaryTerm> = new Map();
let aliasMap: Map<string, string> = new Map();
// word → term id, for quick hover/highlight (lowercased term & aliases)
let wordIndex: Map<string, string> = new Map();

export function loadGlossary(extensionPath: string): void {
  const dataDir = path.join(extensionPath, "data");
  allTerms = [];

  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
      const terms: GlossaryTerm[] = JSON.parse(raw);
      allTerms.push(...terms);
    } catch {
      // skip malformed files
    }
  }

  termMap = new Map(allTerms.map((t) => [t.id, t]));
  aliasMap = new Map();
  wordIndex = new Map();

  for (const t of allTerms) {
    const lower = t.term.toLowerCase();
    wordIndex.set(lower, t.id);
    for (const alias of t.aliases ?? []) {
      const al = alias.toLowerCase();
      aliasMap.set(al, t.id);
      wordIndex.set(al, t.id);
    }
  }
}

export function getTerm(idOrWord: string): GlossaryTerm | undefined {
  const lower = idOrWord.toLowerCase();
  const id = termMap.has(idOrWord)
    ? idOrWord
    : wordIndex.get(lower) ?? aliasMap.get(lower);
  return id ? termMap.get(id) : undefined;
}

export function searchTerms(query: string): GlossaryTerm[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return allTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q) ||
      t.id.includes(q) ||
      t.aliases?.some((a) => a.toLowerCase().includes(q))
  );
}

export function findTermsInText(text: string): GlossaryTerm[] {
  const lower = text.toLowerCase();
  const found: GlossaryTerm[] = [];
  const seen = new Set<string>();

  for (const t of allTerms) {
    if (seen.has(t.id)) continue;
    const tl = t.term.toLowerCase();
    if (tl.length >= 2 && lower.includes(tl)) {
      found.push(t);
      seen.add(t.id);
      continue;
    }
    for (const alias of t.aliases ?? []) {
      if (alias.length >= 2 && lower.includes(alias.toLowerCase())) {
        found.push(t);
        seen.add(t.id);
        break;
      }
    }
  }
  return found;
}

export function getAllTerms(): GlossaryTerm[] {
  return allTerms;
}

export function getWordIndex(): Map<string, string> {
  return wordIndex;
}

export function getCategories(): string[] {
  return [...new Set(allTerms.map((t) => t.category))];
}

export function buildContext(input: string): string {
  const results = searchTerms(input);
  if (results.length === 0) return "";
  return results
    .slice(0, 10)
    .map((t) => `${t.term}: ${t.definition}`)
    .join("\n");
}
