import { GlossaryTerm, getRelatedTerms } from "@/lib/solana-glossary";
import { motion } from "framer-motion";
import { X, ArrowRight, BookOpen } from "lucide-react";

interface TermDetailPanelProps {
  term: GlossaryTerm;
  onClose: () => void;
  onNavigate: (term: GlossaryTerm) => void;
}

const difficultyLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "text-primary bg-primary/10" },
  intermediate: { label: "Intermediate", color: "text-accent bg-accent/10" },
  advanced: { label: "Advanced", color: "text-destructive bg-destructive/10" },
};

export function TermDetailPanel({ term, onClose, onNavigate }: TermDetailPanelProps) {
  const related = getRelatedTerms(term.id);
  const diff = difficultyLabels[term.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-card border border-border rounded-lg p-6 h-full overflow-y-auto scrollbar-thin"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${diff.color}`}>
            {diff.label}
          </span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-1">{term.term}</h2>

      {term.aliases.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {term.aliases.map((a) => (
            <span key={a} className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
              {a}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-foreground/90 leading-relaxed mb-6">{term.definition}</p>

      {related.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Related Terms
          </h3>
          <div className="space-y-1.5">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => onNavigate(r)}
                className="w-full flex items-center gap-2 p-2.5 rounded-md bg-secondary/50 hover:bg-surface-hover text-left transition-colors group"
              >
                <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{r.term}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{r.shortDefinition}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
