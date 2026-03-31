import { useState, useRef, useEffect, useCallback } from "react";
import { searchTerms, GlossaryTerm, allTerms, getTerm } from "@/lib/solana-glossary";
import { streamChat, buildGlossaryContext } from "@/lib/ai-chat";
import { Send, Bot, User, Sparkles, Loader2, Code2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TermHighlightedMarkdown } from "@/components/TermHighlightedMarkdown";
import { TermInputHighlighter } from "@/components/TermInputHighlighter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatUIProps {
  onTermClick?: (term: GlossaryTerm) => void;
  mode?: "chat" | "explain-code";
}

const DEMO_QUESTIONS = [
  "What is PDA in Solana?",
  "Explain accounts like I'm a beginner",
  "How does Proof of History work?",
  "What's the difference between Tower BFT and traditional PBFT?",
  "What is an AMM and how does it work on Solana?",
  "Explain ZK Compression in Solana",
];

const CODE_EXAMPLES = [
  {
    label: "Explain PDA derivation",
    code: `let (pda, bump) = Pubkey::find_program_address(
  &[b"vault", user.key().as_ref()],
  ctx.program_id
);`,
  },
  {
    label: "Explain token transfer",
    code: `token::transfer(
  CpiContext::new(
    ctx.accounts.token_program.to_account_info(),
    Transfer {
      from: ctx.accounts.from.to_account_info(),
      to: ctx.accounts.to.to_account_info(),
      authority: ctx.accounts.authority.to_account_info(),
    },
  ),
  amount,
)?;`,
  },
];

/** Highlight glossary terms in AI responses by wrapping them in clickable spans */
function TermHighlightedMarkdown({
  content,
  onTermClick,
}: {
  content: string;
  onTermClick?: (term: GlossaryTerm) => void;
}) {
  return (
    <div className="prose prose-sm prose-invert max-w-none [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-0 [&_h2]:mb-2 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:text-xs [&_p]:text-foreground/80 [&_li]:text-xs [&_li]:text-foreground/80 [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_blockquote]:border-primary/30 [&_blockquote]:text-muted-foreground [&_blockquote]:text-[11px] [&_strong]:text-foreground [&_hr]:border-border [&_pre]:bg-secondary [&_pre]:border [&_pre]:border-border">
      <ReactMarkdown
        components={{
          strong: ({ children }) => {
            const text = String(children);
            const foundTerm = getTerm(text) || allTerms.find(
              (t) => t.term.toLowerCase() === text.toLowerCase() ||
                t.aliases?.some((a) => a.toLowerCase() === text.toLowerCase())
            );
            if (foundTerm && onTermClick) {
              return (
                <strong
                  className="text-primary cursor-pointer underline decoration-primary/30 underline-offset-2 hover:decoration-primary transition-colors"
                  onClick={() => onTermClick(foundTerm)}
                  title={foundTerm.definition.slice(0, 100)}
                >
                  {children}
                </strong>
              );
            }
            return <strong>{children}</strong>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function ChatUI({ onTermClick, mode = "chat" }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isStreaming) return;

    setError(null);
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: msgText,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    const glossaryContext = buildGlossaryContext(msgText);
    let assistantContent = "";

    await streamChat({
      messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      glossaryContext,
      mode,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [
            ...prev,
            { id: crypto.randomUUID(), role: "assistant", content: assistantContent },
          ];
        });
      },
      onDone: () => {
        setIsStreaming(false);
      },
      onError: (err) => {
        setError(err);
        setIsStreaming(false);
      },
    });
  }, [input, isStreaming, messages, mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isExplainCode = mode === "explain-code";

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              {isExplainCode ? (
                <Code2 className="h-6 w-6 text-primary" />
              ) : (
                <Sparkles className="h-6 w-6 text-primary" />
              )}
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {isExplainCode ? "Explain Solana Code" : "Solana Dev Copilot"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {isExplainCode
                ? "Paste any Solana/Anchor code and I'll explain every concept using the official glossary with 1001 terms."
                : "Ask me anything about Solana development. I use the official glossary (1001 terms) + AI to give you accurate, contextual answers."
              }
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {isExplainCode
                ? CODE_EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => handleSend(ex.code)}
                      className="text-left px-3 py-2.5 bg-secondary border border-border rounded-lg text-xs text-foreground hover:bg-surface-hover hover:border-primary/20 transition-all"
                    >
                      <span className="text-primary font-medium">{ex.label}</span>
                      <pre className="text-[10px] text-muted-foreground mt-1 font-mono line-clamp-2 whitespace-pre-wrap">{ex.code.slice(0, 60)}…</pre>
                    </button>
                  ))
                : DEMO_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-left px-3 py-2.5 bg-secondary border border-border rounded-lg text-xs text-foreground hover:bg-surface-hover hover:border-primary/20 transition-all"
                    >
                      {q}
                    </button>
                  ))
              }
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <TermHighlightedMarkdown content={msg.content} onTermClick={onTermClick} />
                ) : (
                  <pre className="text-xs whitespace-pre-wrap font-sans">{msg.content}</pre>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-accent" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="bg-secondary rounded-lg px-4 py-3 flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Thinking…</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isExplainCode ? "Paste Solana code to explain…" : "Ask about Solana concepts…"}
            rows={1}
            className="flex-1 resize-none bg-secondary border border-border rounded-lg pl-4 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all min-h-[44px] max-h-32 font-sans"
            style={{ height: "44px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "44px";
              target.style.height = Math.min(target.scrollHeight, 128) + "px";
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="h-11 w-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
