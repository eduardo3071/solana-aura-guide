import { GlossaryTerm } from "@/lib/solana-glossary";
import { motion } from "framer-motion";

interface TermCardProps {
  term: GlossaryTerm;
  onClick: (term: GlossaryTerm) => void;
  index?: number;
}

const categoryColors: Record<string, string> = {
  core: "bg-primary/10 text-primary border-primary/20",
  consensus: "bg-accent/10 text-accent border-accent/20",
  defi: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  development: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  networking: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  security: "bg-red-500/10 text-red-400 border-red-500/20",
  token: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  storage: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const difficultyDots: Record<string, string> = {
  beginner: "bg-primary",
  intermediate: "bg-accent",
  advanced: "bg-destructive",
};

export function TermCard({ term, onClick, index = 0 }: TermCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => onClick(term)}
      className="w-full text-left p-4 bg-card border border-border rounded-lg hover:bg-surface-elevated hover:border-primary/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {term.term}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${difficultyDots[term.difficulty]}`} />
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${categoryColors[term.category]}`}>
            {term.category}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {term.shortDefinition}
      </p>
    </motion.button>
  );
}
