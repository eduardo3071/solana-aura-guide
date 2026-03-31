import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChatUI } from "@/components/ChatUI";
import { TermDetailPanel } from "@/components/TermDetailPanel";
import { GlossaryTerm } from "@/lib/solana-glossary";
import { AnimatePresence } from "framer-motion";

const Copilot = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "explain-code" ? "explain-code" : "chat";
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex max-w-6xl mx-auto">
      <div className="flex-1 min-w-0">
        <ChatUI mode={mode} onTermClick={setSelectedTerm} />
      </div>
      <AnimatePresence>
        {selectedTerm && (
          <div className="hidden md:block w-80 shrink-0 border-l border-border p-4">
            <TermDetailPanel
              term={selectedTerm}
              onClose={() => setSelectedTerm(null)}
              onNavigate={setSelectedTerm}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Copilot;
