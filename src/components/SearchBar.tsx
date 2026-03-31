import { useState, useEffect, useRef } from "react";
import { searchTerms, GlossaryTerm } from "@/lib/solana-glossary";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onSelect: (term: GlossaryTerm) => void;
  placeholder?: string;
}

export function SearchBar({ onSelect, placeholder = "Search Solana terms…" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlossaryTerm[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchTerms(query));
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      onSelect(results[selectedIndex]);
      setQuery("");
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const categoryColors: Record<string, string> = {
    core: "bg-primary/20 text-primary",
    consensus: "bg-accent/20 text-accent",
    defi: "bg-emerald-500/20 text-emerald-400",
    development: "bg-blue-500/20 text-blue-400",
    networking: "bg-orange-500/20 text-orange-400",
    security: "bg-red-500/20 text-red-400",
    token: "bg-yellow-500/20 text-yellow-400",
    storage: "bg-cyan-500/20 text-cyan-400",
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-10 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-2 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto scrollbar-thin"
          >
            {results.map((term, i) => (
              <button
                key={term.id}
                onClick={() => {
                  onSelect(term);
                  setQuery("");
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                  i === selectedIndex ? "bg-surface-hover" : "hover:bg-surface-elevated"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{term.term}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${categoryColors[term.category] || "bg-muted text-muted-foreground"}`}>
                      {term.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{term.shortDefinition}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
