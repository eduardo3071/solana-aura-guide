import { useState, useRef, useEffect } from "react";
import { searchTerms, GlossaryTerm } from "@/lib/solana-glossary";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  glossaryContext?: GlossaryTerm[];
}

interface ChatUIProps {
  onTermClick?: (term: GlossaryTerm) => void;
}

const DEMO_QUESTIONS = [
  "What is PDA in Solana?",
  "Explain accounts like I'm a beginner",
  "How does Proof of History work?",
  "What's the difference between Tower BFT and traditional PBFT?",
];

// Simple local AI that uses glossary context to generate responses
function generateResponse(input: string, context: GlossaryTerm[]): string {
  if (context.length === 0) {
    return `I don't have specific glossary information about that topic. Try asking about Solana concepts like **PDA**, **Proof of History**, **Accounts**, **Staking**, **AMM**, or other blockchain terms.\n\nYou can also browse the glossary using the search bar or category filters above.`;
  }

  const mainTerm = context[0];
  let response = `## ${mainTerm.term}\n\n${mainTerm.definition}\n\n`;

  if (mainTerm.aliases.length > 0) {
    response += `**Also known as:** ${mainTerm.aliases.join(", ")}\n\n`;
  }

  if (mainTerm.relatedTerms.length > 0) {
    response += `**Related concepts:** ${mainTerm.relatedTerms.map(t => `\`${t}\``).join(", ")}\n\n`;
  }

  if (context.length > 1) {
    response += `---\n\n### Related Terms\n\n`;
    context.slice(1, 4).forEach((t) => {
      response += `- **${t.term}**: ${t.shortDefinition}\n`;
    });
  }

  response += `\n> 💡 **Difficulty:** ${mainTerm.difficulty} | **Category:** ${mainTerm.category}`;

  return response;
}

export function ChatUI({ onTermClick }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText) return;

    const glossaryResults = searchTerms(msgText);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: msgText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const response = generateResponse(msgText, glossaryResults);

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response,
      glossaryContext: glossaryResults,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Solana Dev Copilot</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Ask me anything about Solana development. I'll use the glossary to give you accurate, contextual answers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {DEMO_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-left px-3 py-2.5 bg-secondary border border-border rounded-lg text-xs text-foreground hover:bg-surface-hover hover:border-primary/20 transition-all"
                >
                  {q}
                </button>
              ))}
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
                  <div className="prose prose-sm prose-invert max-w-none [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-0 [&_h2]:mb-2 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:text-xs [&_p]:text-foreground/80 [&_li]:text-xs [&_li]:text-foreground/80 [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_blockquote]:border-primary/30 [&_blockquote]:text-muted-foreground [&_blockquote]:text-[11px] [&_strong]:text-foreground [&_hr]:border-border">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="text-xs">{msg.content}</span>
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

        {isTyping && (
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
            placeholder="Ask about Solana concepts…"
            rows={1}
            className="flex-1 resize-none bg-secondary border border-border rounded-lg pl-4 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all min-h-[44px] max-h-32"
            style={{ height: "44px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "44px";
              target.style.height = Math.min(target.scrollHeight, 128) + "px";
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="h-11 w-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
