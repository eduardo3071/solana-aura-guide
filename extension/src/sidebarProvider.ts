import * as vscode from "vscode";
import { searchTerms, getAllTerms, getCategories, GlossaryTerm } from "./glossary";

export class GlossarySidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "solanaCopilot.glossary";

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this._getHtml();

    webviewView.webview.onDidReceiveMessage((msg) => {
      if (msg.type === "search") {
        const results = msg.query
          ? searchTerms(msg.query).slice(0, 50)
          : getAllTerms().slice(0, 50);
        webviewView.webview.postMessage({ type: "results", data: results });
      } else if (msg.type === "openTerm") {
        const config = vscode.workspace.getConfiguration("solanaCopilot");
        const webAppUrl = config.get<string>(
          "webAppUrl",
          "https://solana-aura-guide.lovable.app"
        );
        vscode.env.openExternal(
          vscode.Uri.parse(`${webAppUrl}/?term=${msg.termId}`)
        );
      }
    });

    // Send initial data
    const initial = getAllTerms().slice(0, 50);
    const cats = getCategories();
    setTimeout(() => {
      webviewView.webview.postMessage({
        type: "init",
        data: { terms: initial, categories: cats, totalCount: getAllTerms().length },
      });
    }, 100);
  }

  private _getHtml(): string {
    return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--vscode-font-family);
    color: var(--vscode-foreground);
    background: var(--vscode-sideBar-background);
    padding: 8px;
  }
  .search-box {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid var(--vscode-input-border);
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border-radius: 4px;
    font-size: 12px;
    outline: none;
    margin-bottom: 8px;
  }
  .search-box:focus { border-color: var(--vscode-focusBorder); }
  .stats {
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 8px;
    padding: 0 2px;
  }
  .term-list { list-style: none; }
  .term-item {
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 2px;
    border-left: 3px solid transparent;
  }
  .term-item:hover {
    background: var(--vscode-list-hoverBackground);
    border-left-color: var(--vscode-focusBorder);
  }
  .term-name {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .term-def {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .term-cat {
    font-size: 10px;
    color: var(--vscode-textLink-foreground);
    margin-top: 2px;
  }
  .empty {
    text-align: center;
    padding: 20px;
    color: var(--vscode-descriptionForeground);
    font-size: 12px;
  }
</style>
</head>
<body>
  <input class="search-box" id="search" type="text" placeholder="Search 1000+ Solana terms..." />
  <div class="stats" id="stats">Loading glossary...</div>
  <ul class="term-list" id="list"></ul>

  <script>
    const vscode = acquireVsCodeApi();
    const searchInput = document.getElementById('search');
    const listEl = document.getElementById('list');
    const statsEl = document.getElementById('stats');
    let debounce;

    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        vscode.postMessage({ type: 'search', query: searchInput.value });
      }, 200);
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'init') {
        statsEl.textContent = msg.data.totalCount + ' terms · ' + msg.data.categories.length + ' categories';
        renderTerms(msg.data.terms);
      } else if (msg.type === 'results') {
        renderTerms(msg.data);
      }
    });

    function renderTerms(terms) {
      if (!terms.length) {
        listEl.innerHTML = '<li class="empty">No terms found</li>';
        return;
      }
      listEl.innerHTML = terms.map(t =>
        '<li class="term-item" data-id="' + t.id + '">' +
          '<div class="term-name">' + esc(t.term) + '</div>' +
          '<div class="term-def">' + esc(t.definition.slice(0, 120)) + '</div>' +
          '<div class="term-cat">' + esc(t.category) + '</div>' +
        '</li>'
      ).join('');

      listEl.querySelectorAll('.term-item').forEach(el => {
        el.addEventListener('click', () => {
          vscode.postMessage({ type: 'openTerm', termId: el.dataset.id });
        });
      });
    }

    function esc(s) {
      const d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }
  </script>
</body>
</html>`;
  }
}
