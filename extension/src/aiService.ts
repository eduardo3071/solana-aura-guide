import * as vscode from "vscode";
import { searchTerms, findTermsInText, buildContext, GlossaryTerm } from "./glossary";

function formatTermExplanation(terms: GlossaryTerm[]): string {
  if (terms.length === 0) return "No Solana-specific terms detected.";

  const grouped = new Map<string, GlossaryTerm[]>();
  for (const t of terms) {
    const cat = t.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(t);
  }

  let md = "";
  for (const [cat, catTerms] of grouped) {
    md += `### 📂 ${cat}\n\n`;
    for (const t of catTerms) {
      md += `**${t.term}**\n${t.definition}\n`;
      if (t.aliases?.length) md += `_Aliases: ${t.aliases.join(", ")}_\n`;
      if (t.related?.length)
        md += `_Related: ${t.related.slice(0, 3).join(", ")}_\n`;
      md += "\n";
    }
  }
  return md;
}

export async function askCopilot(): Promise<void> {
  const input = await vscode.window.showInputBox({
    prompt: "Ask anything about Solana development",
    placeHolder: "e.g. What is a PDA? How does Proof of History work?",
  });

  if (!input) return;

  const panel = vscode.window.createWebviewPanel(
    "solanaCopilot",
    `Copilot: ${input.slice(0, 40)}…`,
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  const context = buildContext(input);
  const matchedTerms = searchTerms(input).slice(0, 15);

  let responseText: string;

  // Try remote AI endpoint
  const aiEndpoint = vscode.workspace
    .getConfiguration("solanaCopilot")
    .get<string>("aiEndpoint", "");

  if (aiEndpoint) {
    try {
      panel.webview.html = getLoadingHtml(input);
      const resp = await fetch(aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
          glossaryContext: context,
          mode: "chat",
        }),
      });
      if (resp.ok) {
        responseText = await resp.text();
      } else {
        responseText = buildLocalResponse(input, matchedTerms, context);
      }
    } catch {
      responseText = buildLocalResponse(input, matchedTerms, context);
    }
  } else {
    responseText = buildLocalResponse(input, matchedTerms, context);
  }

  panel.webview.html = getResponseHtml(input, responseText);
}

export async function explainFile(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("No active file to explain.");
    return;
  }

  const text = editor.document.getText();
  const fileName = editor.document.fileName.split("/").pop() || "file";
  const terms = findTermsInText(text);

  const panel = vscode.window.createWebviewPanel(
    "solanaCopilotExplain",
    `Explain: ${fileName}`,
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  let md = `# 📄 File Analysis: ${fileName}\n\n`;
  md += `**Language:** ${editor.document.languageId}\n`;
  md += `**Lines:** ${editor.document.lineCount}\n`;
  md += `**Solana concepts found:** ${terms.length}\n\n`;
  md += `---\n\n`;

  if (terms.length > 0) {
    md += `## 🧠 Solana Concepts Used\n\n`;
    md += formatTermExplanation(terms);
    md += `\n---\n\n`;
    md += `## 📊 Summary\n\n`;
    md += `This file uses **${terms.length}** Solana-related concepts across `;
    const cats = new Set(terms.map((t) => t.category));
    md += `**${cats.size}** categories: ${[...cats].join(", ")}.\n`;
  } else {
    md += `_No Solana-specific glossary terms were detected in this file._\n`;
  }

  panel.webview.html = getResponseHtml(`Analysis of ${fileName}`, md);
}

export async function explainSelection(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    vscode.window.showWarningMessage("Select some code first.");
    return;
  }

  const text = editor.document.getText(editor.selection);
  const terms = findTermsInText(text);

  const panel = vscode.window.createWebviewPanel(
    "solanaCopilotExplain",
    "Explain Selection",
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  let md = `# 🔍 Code Explanation\n\n`;
  md += "```\n" + text.slice(0, 2000) + "\n```\n\n";

  if (terms.length > 0) {
    md += `## 🧠 Concepts Found\n\n`;
    md += formatTermExplanation(terms);
  } else {
    md += `_No Solana glossary terms detected in selection._\n`;
  }

  panel.webview.html = getResponseHtml("Code Explanation", md);
}

function buildLocalResponse(
  input: string,
  terms: GlossaryTerm[],
  _context: string
): string {
  if (terms.length === 0) {
    return `## 🔍 No exact matches found\n\nI couldn't find glossary terms matching "${input}". Try searching for specific Solana concepts like:\n- PDA (Program Derived Address)\n- Account Model\n- Proof of History\n- Token Program`;
  }

  let md = `## 💡 Answer based on Solana Glossary\n\n`;
  for (const t of terms.slice(0, 5)) {
    md += `### ${t.term}\n\n${t.definition}\n\n`;
    if (t.related?.length) {
      md += `**Related:** ${t.related.slice(0, 4).join(", ")}\n\n`;
    }
  }

  if (terms.length > 5) {
    md += `\n_...and ${terms.length - 5} more related terms._\n`;
  }

  return md;
}

function getLoadingHtml(question: string): string {
  return `<!DOCTYPE html>
<html><head><style>
  body { font-family: var(--vscode-font-family); padding: 20px; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
  .loading { display: flex; align-items: center; gap: 10px; margin-top: 20px; }
  .spinner { width: 20px; height: 20px; border: 2px solid var(--vscode-foreground); border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style></head>
<body>
  <h2>🤖 Solana Dev Copilot</h2>
  <p><strong>Q:</strong> ${escapeHtml(question)}</p>
  <div class="loading"><div class="spinner"></div><span>Thinking...</span></div>
</body></html>`;
}

function getResponseHtml(title: string, content: string): string {
  // Simple markdown-to-html (headers, bold, code blocks, lists)
  let html = escapeHtml(content)
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:var(--vscode-textCodeBlock-background);padding:2px 5px;border-radius:3px;">$1</code>')
    .replace(/```\n([\s\S]*?)```/g, '<pre style="background:var(--vscode-textCodeBlock-background);padding:12px;border-radius:6px;overflow-x:auto;"><code>$1</code></pre>')
    .replace(/^---$/gm, "<hr>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html><head><style>
  body {
    font-family: var(--vscode-font-family);
    padding: 24px;
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    line-height: 1.6;
    max-width: 800px;
  }
  h1, h2, h3 { margin-top: 1.2em; margin-bottom: 0.4em; }
  h1 { font-size: 1.5em; }
  h2 { font-size: 1.3em; }
  h3 { font-size: 1.1em; }
  hr { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 1em 0; }
  code { font-family: var(--vscode-editor-font-family); font-size: 0.9em; }
  pre { margin: 1em 0; }
  p { margin: 0.5em 0; }
  a { color: var(--vscode-textLink-foreground); }
</style></head>
<body>
  <p>${html}</p>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
