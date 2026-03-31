import * as vscode from "vscode";
import { getWordIndex, getTerm } from "./glossary";

let decorationType: vscode.TextEditorDecorationType;
let timeout: ReturnType<typeof setTimeout> | undefined;
let enabled = true;

export function initHighlighting(context: vscode.ExtensionContext): void {
  decorationType = vscode.window.createTextEditorDecorationType({
    textDecoration: "underline dotted",
    overviewRulerColor: new vscode.ThemeColor("editorLink.activeForeground"),
  });

  enabled = vscode.workspace
    .getConfiguration("solanaCopilot")
    .get("enableHighlighting", true);

  // Trigger on active editor change and text change
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) triggerUpdate(editor);
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const editor = vscode.window.activeTextEditor;
      if (editor && event.document === editor.document) {
        triggerUpdate(editor);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeConfiguration(
    (e) => {
      if (e.affectsConfiguration("solanaCopilot.enableHighlighting")) {
        enabled = vscode.workspace
          .getConfiguration("solanaCopilot")
          .get("enableHighlighting", true);
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          if (enabled) {
            triggerUpdate(editor);
          } else {
            editor.setDecorations(decorationType, []);
          }
        }
      }
    },
    null,
    context.subscriptions
  );

  // Initial
  if (vscode.window.activeTextEditor) {
    triggerUpdate(vscode.window.activeTextEditor);
  }
}

function triggerUpdate(editor: vscode.TextEditor): void {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => updateDecorations(editor), 300);
}

function updateDecorations(editor: vscode.TextEditor): void {
  if (!enabled) {
    editor.setDecorations(decorationType, []);
    return;
  }

  const text = editor.document.getText();
  const wordIdx = getWordIndex();
  const decorations: vscode.DecorationOptions[] = [];
  const seen = new Set<string>();

  // Only scan visible ranges for performance
  for (const range of editor.visibleRanges) {
    const startOffset = editor.document.offsetAt(range.start);
    const endOffset = editor.document.offsetAt(range.end);
    const visibleText = text.substring(startOffset, endOffset);

    // Match words 2+ chars
    const regex = /\b[\w-]{2,}\b/g;
    let match;
    while ((match = regex.exec(visibleText)) !== null) {
      const word = match[0].toLowerCase();
      const termId = wordIdx.get(word);
      if (!termId) continue;

      const key = `${termId}-${startOffset + match.index}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const term = getTerm(termId);
      if (!term) continue;

      const startPos = editor.document.positionAt(startOffset + match.index);
      const endPos = editor.document.positionAt(
        startOffset + match.index + match[0].length
      );

      decorations.push({
        range: new vscode.Range(startPos, endPos),
        hoverMessage: new vscode.MarkdownString(
          `**${term.term}** — ${term.definition.slice(0, 100)}…`
        ),
      });
    }
  }

  editor.setDecorations(decorationType, decorations);
}

export function toggleHighlighting(): void {
  enabled = !enabled;
  vscode.workspace
    .getConfiguration("solanaCopilot")
    .update("enableHighlighting", enabled, vscode.ConfigurationTarget.Global);
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    if (enabled) {
      triggerUpdate(editor);
    } else {
      editor.setDecorations(decorationType, []);
    }
  }
  vscode.window.showInformationMessage(
    `Solana term highlighting ${enabled ? "enabled" : "disabled"}`
  );
}
