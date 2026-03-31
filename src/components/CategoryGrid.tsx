import { getCategories, getTermsByCategory, GlossaryCategory, GlossaryTerm } from "@/lib/solana-glossary";
import { motion } from "framer-motion";
import { Blocks, Shield, Coins, Code2, Globe, Lock, Database, Layers } from "lucide-react";

interface CategoryGridProps {
  onSelectCategory: (category: GlossaryCategory) => void;
  activeCategory: GlossaryCategory | null;
}

const categoryMeta: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  core: { icon: Blocks, label: "Core Concepts", color: "text-primary" },
  consensus: { icon: Layers, label: "Consensus", color: "text-accent" },
  defi: { icon: Coins, label: "DeFi", color: "text-emerald-400" },
  development: { icon: Code2, label: "Development", color: "text-blue-400" },
  networking: { icon: Globe, label: "Networking", color: "text-orange-400" },
  security: { icon: Shield, label: "Security", color: "text-red-400" },
  token: { icon: Lock, label: "Tokens", color: "text-yellow-400" },
  storage: { icon: Database, label: "Storage", color: "text-cyan-400" },
};

export function CategoryGrid({ onSelectCategory, activeCategory }: CategoryGridProps) {
  const categories = getCategories();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {categories.map((cat, i) => {
        const meta = categoryMeta[cat] || { icon: Blocks, label: cat, color: "text-muted-foreground" };
        const Icon = meta.icon;
        const count = getTermsByCategory(cat).length;
        const isActive = activeCategory === cat;

        return (
          <motion.button
            key={cat}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onSelectCategory(isActive ? (null as any) : cat)}
            className={`p-3 rounded-lg border text-left transition-all ${
              isActive
                ? "bg-surface-elevated border-primary/30 glow-primary"
                : "bg-card border-border hover:bg-surface-elevated hover:border-primary/10"
            }`}
          >
            <Icon className={`h-4 w-4 mb-1.5 ${meta.color}`} />
            <p className="text-xs font-medium text-foreground">{meta.label}</p>
            <p className="text-[10px] text-muted-foreground">{count} terms</p>
          </motion.button>
        );
      })}
    </div>
  );
}
