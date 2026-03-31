import type { GlossaryTerm, Category } from "./types";

// Import all 14 category JSON files (1001 terms total)
import coreProtocol from "./terms/core-protocol.json";
import programmingModel from "./terms/programming-model.json";
import tokenEcosystem from "./terms/token-ecosystem.json";
import defi from "./terms/defi.json";
import zkCompression from "./terms/zk-compression.json";
import infrastructure from "./terms/infrastructure.json";
import security from "./terms/security.json";
import devTools from "./terms/dev-tools.json";
import network from "./terms/network.json";
import blockchainGeneral from "./terms/blockchain-general.json";
import web3 from "./terms/web3.json";
import programmingFundamentals from "./terms/programming-fundamentals.json";
import aiMl from "./terms/ai-ml.json";
import solanaEcosystem from "./terms/solana-ecosystem.json";

export type { GlossaryTerm, Category };

export const allTerms: GlossaryTerm[] = [
  ...coreProtocol,
  ...programmingModel,
  ...tokenEcosystem,
  ...defi,
  ...zkCompression,
  ...infrastructure,
  ...security,
  ...devTools,
  ...network,
  ...blockchainGeneral,
  ...web3,
  ...programmingFundamentals,
  ...aiMl,
  ...solanaEcosystem,
] as GlossaryTerm[];

// Lookup maps built once at import time
const termMap = new Map<string, GlossaryTerm>(allTerms.map((t) => [t.id, t]));

const aliasMap = new Map<string, string>();
for (const t of allTerms) {
  for (const alias of t.aliases ?? []) {
    aliasMap.set(alias.toLowerCase(), t.id);
  }
}

/** Get a term by its id or any of its aliases */
export function getTerm(idOrAlias: string): GlossaryTerm | undefined {
  const lower = idOrAlias.toLowerCase();
  return termMap.get(idOrAlias) ?? termMap.get(aliasMap.get(lower) ?? "");
}

/** Get all terms in a given category */
export function getTermsByCategory(category: Category): GlossaryTerm[] {
  return allTerms.filter((t) => t.category === category);
}

/** Search terms by query string (matches term name, definition, id, and aliases) */
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

/** Get all 14 categories */
export function getCategories(): Category[] {
  return [
    "core-protocol",
    "programming-model",
    "token-ecosystem",
    "defi",
    "zk-compression",
    "infrastructure",
    "security",
    "dev-tools",
    "network",
    "blockchain-general",
    "web3",
    "programming-fundamentals",
    "ai-ml",
    "solana-ecosystem",
  ];
}

/** Get related terms for a given term */
export function getRelatedTerms(id: string): GlossaryTerm[] {
  const term = getTerm(id);
  if (!term) return [];
  return (term.related ?? [])
    .map((rid) => getTerm(rid))
    .filter(Boolean) as GlossaryTerm[];
}

/** Get all terms */
export function getAllTerms(): GlossaryTerm[] {
  return allTerms;
}
