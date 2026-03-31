export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  shortDefinition: string;
  category: GlossaryCategory;
  aliases: string[];
  relatedTerms: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export type GlossaryCategory =
  | "core"
  | "consensus"
  | "defi"
  | "development"
  | "networking"
  | "security"
  | "token"
  | "storage";
