import { GlossaryTerm, getTerm, allTerms } from "@/lib/solana-glossary";
import ReactMarkdown from "react-markdown";

interface TermHighlightedMarkdownProps {
  content: string;
  onTermClick?: (term: GlossaryTerm) => void;
}

export function TermHighlightedMarkdown({ content, onTermClick }: TermHighlightedMarkdownProps) {
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
