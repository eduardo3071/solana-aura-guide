import * as vscode from "vscode";
import { loadGlossary } from "./glossary";
import { registerHoverProvider } from "./hoverProvider";
import { initHighlighting, toggleHighlighting } from "./highlightProvider";
import { askCopilot, explainFile, explainSelection } from "./aiService";
import { GlossarySidebarProvider } from "./sidebarProvider";

export function activate(context: vscode.ExtensionContext) {
  // Load glossary data
  loadGlossary(context.extensionPath);

  // Hover tooltips
  context.subscriptions.push(registerHoverProvider());

  // Term highlighting
  initHighlighting(context);

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("solanaCopilot.ask", askCopilot),
    vscode.commands.registerCommand("solanaCopilot.explainFile", explainFile),
    vscode.commands.registerCommand("solanaCopilot.explainSelection", explainSelection),
    vscode.commands.registerCommand("solanaCopilot.searchGlossary", async () => {
      const input = await vscode.window.showInputBox({
        prompt: "Search Solana glossary",
        placeHolder: "e.g. PDA, validator, token...",
      });
      if (input) {
        vscode.commands.executeCommand("solanaCopilot.ask");
      }
    }),
    vscode.commands.registerCommand("solanaCopilot.toggleHighlighting", toggleHighlighting),
    vscode.commands.registerCommand("solanaCopilot.openInWebApp", (termId?: string) => {
      const config = vscode.workspace.getConfiguration("solanaCopilot");
      const webAppUrl = config.get<string>("webAppUrl", "https://solana-aura-guide.lovable.app");
      const url = termId ? `${webAppUrl}/?term=${termId}` : webAppUrl;
      vscode.env.openExternal(vscode.Uri.parse(url));
    })
  );

  // Sidebar
  const sidebarProvider = new GlossarySidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      GlossarySidebarProvider.viewType,
      sidebarProvider
    )
  );

  // Status bar
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.text = "$(symbol-misc) Solana Copilot";
  statusBar.tooltip = "Solana Dev Copilot — Click to ask";
  statusBar.command = "solanaCopilot.ask";
  statusBar.show();
  context.subscriptions.push(statusBar);

  vscode.window.showInformationMessage(
    "☀️ Solana Dev Copilot activated — 1000+ terms loaded!"
  );
}

export function deactivate() {}
