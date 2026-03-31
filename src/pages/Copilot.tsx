import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChatUI } from "@/components/ChatUI";
import { ExplainFilePanel } from "@/components/ExplainFilePanel";
import { TermDetailPanel } from "@/components/TermDetailPanel";
import { GlossaryTerm } from "@/lib/solana-glossary";
import { AnimatePresence } from "framer-motion";
import { MessageSquare, Code2, FileCode2 } from "lucide-react";

const TABS = [
  { id: "chat", label: "Copilot", icon: MessageSquare },
  { id: "explain-code", label: "Explain Code", icon: Code2 },
  { id: "explain-file", label: "Explain File", icon: FileCode2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

const Copilot = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("mode") as TabId || "chat";
  const [activeTab, setActiveTab] = useState<TabId>(
    TABS.some((t) => t.id === initialTab) ? initialTab : "chat"
  );
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === "chat") {
      setSearchParams({});
    } else {
      setSearchParams({ mode: tab });
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col max-w-6xl mx-auto">
      {/* Tab bar */}
      <div className="border-b border-border px-4 flex gap-1 pt-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md transition-colors ${
              activeTab === tab.id
                ? "bg-card text-foreground border border-border border-b-transparent -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0">
          {activeTab === "explain-file" ? (
            <ExplainFilePanel onTermClick={setSelectedTerm} />
          ) : (
            <ChatUI
              mode={activeTab === "explain-code" ? "explain-code" : "chat"}
              onTermClick={setSelectedTerm}
            />
          )}
        </div>
        <AnimatePresence>
          {selectedTerm && (
            <div className="hidden md:block w-80 shrink-0 border-l border-border p-4 overflow-y-auto">
              <TermDetailPanel
                term={selectedTerm}
                onClose={() => setSelectedTerm(null)}
                onNavigate={setSelectedTerm}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Copilot;
