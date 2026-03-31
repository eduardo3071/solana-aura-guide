import * as vscode from "vscode";
import { getTerm, getWordIndex } from "./glossary";

const CATEGORY_ICONS: Record<string, string> = {
  "core-protocol": "🔷",
  "programming-model": "⚙️",
  "token-ecosystem": "🪙",
  defi: "💰",
  "zk-compression": "🔐",
  infrastructure: "🏗️",
  security: "🛡️",
  "dev-tools": "🔧",
  network: "🌐",
  "blockchain-general": "⛓️",
  web3: "🌍",
  "programming-fundamentals": "📐",
  "ai-ml": "🤖",
  "solana-ecosystem": "☀️",
};

export function registerHoverProvider(): vscode.Disposable {
  return vscode.languages.registerHoverProvider(
    [
      "typescript",
      "javascript",
      "typescriptreact",
      "javascriptreact",
      "rust",
      "markdown",
      "json",
      "toml",
      "plaintext",
    ],
    {
      provideHover(document, position) {
        // Try single word first
        let wordRange = document.getWordRangeAtPosition(position, /[\w-]+/);
        if (!wordRange) return;

        const word = document.getText(wordRange);
        let term = getTerm(word);

        // Try multi-word: expand left/right up to 4 words
        if (!term) {
          const line = document.lineAt(position.line).text;
          const col = position.character;
          const wordIdx = getWordIndex();

          for (let len = 4; len >= 2; len--) {
            // Try chunks around cursor
            const words = line.split(/\b/);
            let pos = 0;
            for (let i = 0; i < words.length; i++) {
              const end = pos + words[i].length;
              if (col >= pos && col < end) {
                // Build multi-word from i backwards/forwards
                for (let start = Math.max(0, i - len); start <= i; start++) {
                  const chunk = words
                    .slice(start, start + len * 2 - 1)
                    .join("")
                    .trim();
                  const id = wordIdx.get(chunk.toLowerCase());
                  if (id) {
                    term = getTerm(id);
                    if (term) break;
                  }
                }
                break;
              }
              pos = end;
            }
            if (term) break;
          }
        }

        if (!term) return;

        const icon = CATEGORY_ICONS[term.category] || "📖";
        const md = new vscode.MarkdownString();
        md.isTrusted = true;
        md.supportHtml = true;

        md.appendMarkdown(`### ${icon} ${term.term}\n\n`);
        md.appendMarkdown(`${term.definition}\n\n`);
        md.appendMarkdown(`---\n`);
        md.appendMarkdown(
          `*Category:* \`${term.category}\``
        );

        if (term.aliases && term.aliases.length > 0) {
          md.appendMarkdown(
            ` · *Aliases:* ${term.aliases.map((a) => `\`${a}\``).join(", ")}`
          );
        }

        if (term.related && term.related.length > 0) {
          md.appendMarkdown(`\n\n*Related:* ${term.related.slice(0, 5).map((r) => `\`${r}\``).join(", ")}`);
        }

        md.appendMarkdown(
          `\n\n[Open in Web App](command:solanaCopilot.openInWebApp?${encodeURIComponent(JSON.stringify(term.id))})`
        );

        return new vscode.Hover(md, wordRange);
      },
    }
  );
}
