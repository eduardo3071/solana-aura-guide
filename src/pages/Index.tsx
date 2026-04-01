import { useState, useMemo } from "react";
import { SearchBar } from "@/components/SearchBar";
import { TermCard } from "@/components/TermCard";
import { CategoryGrid } from "@/components/CategoryGrid";
import { TermDetailPanel } from "@/components/TermDetailPanel";
import { getAllTerms, getTermsByCategory, GlossaryTerm, Category, allTerms } from "@/lib/solana-glossary";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Zap, BookOpen, Search, Code2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ITEMS_PER_PAGE = 60;

const Index = () => {
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const navigate = useNavigate();
  const { t } = useI18n();

  const terms = useMemo(() => {
    return activeCategory ? getTermsByCategory(activeCategory) : getAllTerms();
  }, [activeCategory]);

  const visibleTerms = useMemo(() => terms.slice(0, visibleCount), [terms, visibleCount]);

  // Reset visible count on category change
  const handleCategoryChange = (cat: Category | null) => {
    setActiveCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(162_72%_46%_/_0.08),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6 relative">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium mb-3">
              <Zap className="h-3 w-3" />
              {allTerms.length} terms · 14 categories · Official Solana Glossary
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2.5 tracking-tight">
              Understand <span className="gradient-text">Solana</span> instantly — powered by real protocol knowledge
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Instantly search, learn, and understand Solana concepts. Powered by the official @stbr/solana-glossary SDK with real AI assistance.
            </p>
          </div>

          <div className="max-w-xl mx-auto mb-5">
            <SearchBar onSelect={setSelectedTerm} />
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate("/copilot")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              AI Copilot
            </button>
            <button
              onClick={() => navigate("/copilot?mode=explain-code")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 transition-all"
            >
              <Code2 className="h-3.5 w-3.5" />
              Explain Code
            </button>
            <a
              href="#glossary"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-surface-hover transition-all"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Browse Glossary
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section id="glossary" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-foreground mb-2.5 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-primary" />
            Categories
          </h2>
          <CategoryGrid onSelectCategory={handleCategoryChange} activeCategory={activeCategory} />
        </div>

        <div className="flex gap-6">
          {/* Terms grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">
                {activeCategory
                  ? `${activeCategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Terms`
                  : "All Terms"}
              </h2>
              <span className="text-xs text-muted-foreground">{terms.length} terms</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {visibleTerms.map((term, i) => (
                <TermCard key={term.id} term={term} onClick={setSelectedTerm} index={i} />
              ))}
            </div>
            {visibleCount < terms.length && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                  className="px-6 py-2 rounded-lg bg-secondary border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-all"
                >
                  Load more ({terms.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selectedTerm && (
              <div className="hidden lg:block w-80 shrink-0">
                <div className="sticky top-[4.5rem]">
                  <TermDetailPanel
                    term={selectedTerm}
                    onClose={() => setSelectedTerm(null)}
                    onNavigate={setSelectedTerm}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Index;
