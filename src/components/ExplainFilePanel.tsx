import { useState, useCallback } from "react";
import { searchTerms, GlossaryTerm } from "@/lib/solana-glossary";
import { streamChat, buildGlossaryContext } from "@/lib/ai-chat";
import { FileCode2, Loader2, Send, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TermHighlightedMarkdown } from "@/components/TermHighlightedMarkdown";
import { useI18n } from "@/lib/i18n";

interface ExplainFilePanelProps {
  onTermClick?: (term: GlossaryTerm) => void;
}

const EXAMPLE_CODE = `// Anchor program: Initialize a vault PDA
#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", authority.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}`;

export function ExplainFilePanel({ onTermClick }: ExplainFilePanelProps) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useI18n();

  const handleAnalyze = useCallback(async (inputCode?: string) => {
    const codeToAnalyze = inputCode || code;
    if (!codeToAnalyze.trim() || isAnalyzing) return;

    setError(null);
    setResult("");
    setIsAnalyzing(true);

    const glossaryContext = buildGlossaryContext(codeToAnalyze);

    let content = "";
    await streamChat({
      messages: [{ role: "user", content: codeToAnalyze }],
      glossaryContext,
      mode: "explain-file",
      onDelta: (chunk) => {
        content += chunk;
        setResult(content);
      },
      onDone: () => setIsAnalyzing(false),
      onError: (err) => {
        setError(err);
        setIsAnalyzing(false);
      },
    });
  }, [code, isAnalyzing]);

  const detectedTerms = code.trim() ? searchTerms(code).slice(0, 8) : [];

  return (
    <div className="flex flex-col h-full">
      {/* Code input area */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">{t("file.paste_title")}</span>
          </div>
          <div className="flex gap-1.5">
            {code && (
              <button
                onClick={() => { setCode(""); setResult(""); }}
                className="text-[10px] px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={() => { setCode(EXAMPLE_CODE); }}
              className="text-[10px] px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("file.try_example")}
            </button>
          </div>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("file.paste_placeholder")}
          className="w-full h-32 bg-secondary border border-border rounded-lg p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none scrollbar-thin"
        />

        {/* Detected terms chips */}
        <AnimatePresence>
          {detectedTerms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1 mt-2"
            >
              {detectedTerms.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onTermClick?.(t)}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {t.term}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => handleAnalyze()}
          disabled={!code.trim() || isAnalyzing}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("file.analyzing")}
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              {t("file.explain_btn")}
            </>
          )}
        </button>
      </div>

      {/* Result area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-4">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {result ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TermHighlightedMarkdown content={result} onTermClick={onTermClick} />
          </motion.div>
        ) : !isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60">
            <FileCode2 className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-xs text-muted-foreground">
              {t("file.empty_hint")}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
