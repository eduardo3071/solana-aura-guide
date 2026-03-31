import { getCategories, getTermsByCategory, Category } from "@/lib/solana-glossary";
import { motion } from "framer-motion";
import {
  Blocks, Shield, Coins, Code2, Globe, Lock, Database, Layers,
  Cpu, Network, Brain, Puzzle, Wrench, Boxes
} from "lucide-react";

interface CategoryGridProps {
  onSelectCategory: (category: Category | null) => void;
  activeCategory: Category | null;
}

const categoryMeta: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  "core-protocol": { icon: Blocks, label: "Core Protocol", color: "text-primary" },
  "programming-model": { icon: Code2, label: "Programming Model", color: "text-blue-400" },
  "token-ecosystem": { icon: Coins, label: "Token Ecosystem", color: "text-yellow-400" },
  "defi": { icon: Layers, label: "DeFi", color: "text-emerald-400" },
  "zk-compression": { icon: Cpu, label: "ZK Compression", color: "text-violet-400" },
  "infrastructure": { icon: Network, label: "Infrastructure", color: "text-orange-400" },
  "security": { icon: Shield, label: "Security", color: "text-red-400" },
  "dev-tools": { icon: Wrench, label: "Dev Tools", color: "text-cyan-400" },
  "network": { icon: Globe, label: "Network", color: "text-teal-400" },
  "blockchain-general": { icon: Boxes, label: "Blockchain General", color: "text-slate-400" },
  "web3": { icon: Puzzle, label: "Web3", color: "text-pink-400" },
  "programming-fundamentals": { icon: Database, label: "Programming", color: "text-indigo-400" },
  "ai-ml": { icon: Brain, label: "AI / ML", color: "text-purple-400" },
  "solana-ecosystem": { icon: Lock, label: "Solana Ecosystem", color: "text-accent" },
};

export function CategoryGrid({ onSelectCategory, activeCategory }: CategoryGridProps) {
  const categories = getCategories();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
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
            transition={{ delay: i * 0.02 }}
            onClick={() => onSelectCategory(isActive ? null : cat)}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              isActive
                ? "bg-surface-elevated border-primary/30 glow-primary"
                : "bg-card border-border hover:bg-surface-elevated hover:border-primary/10"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 mb-1 ${meta.color}`} />
            <p className="text-[11px] font-medium text-foreground truncate">{meta.label}</p>
            <p className="text-[10px] text-muted-foreground">{count}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
