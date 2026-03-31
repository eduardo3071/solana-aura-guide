import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Terminal, Eye, FileCode, Search, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Eye, title: "Hover Tooltips", desc: "Hover any Solana term for instant definitions with category and related concepts" },
  { icon: Terminal, title: "AI Copilot", desc: "Ask any Solana question via Command Palette — powered by glossary RAG context" },
  { icon: FileCode, title: "Explain File", desc: "Analyze your current file to identify all Solana concepts used" },
  { icon: Search, title: "Sidebar Search", desc: "Browse and search 1000+ terms directly in the VS Code sidebar" },
];

const steps = [
  "Download the extension zip below",
  "Unzip the downloaded file",
  'Open VS Code → Ctrl+Shift+P → "Extensions: Install from VSIX..."',
  "If no .vsix, copy the unzipped folder to your VS Code extensions directory",
  "Reload VS Code — look for ☀️ Solana Copilot in the status bar",
];

export default function VSCodeExtension() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    fetch("/solana-dev-copilot-vscode.zip")
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "solana-dev-copilot-vscode.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message))
      .finally(() => setDownloading(false));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Terminal className="w-4 h-4" />
            VS Code Extension
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Solana Dev Copilot
            <span className="text-primary"> for VS Code</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            1000+ Solana glossary terms with hover tooltips, AI copilot, file analysis, and sidebar search — directly in your editor.
          </p>
          <Button size="lg" onClick={handleDownload} disabled={downloading} className="gap-2">
            <Download className="w-5 h-5" />
            {downloading ? "Downloading..." : "Download Extension"}
          </Button>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <f.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Installation */}
        <div className="p-8 rounded-xl border border-border bg-card mb-16">
          <h2 className="text-2xl font-bold mb-6">Installation</h2>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Commands */}
        <div className="p-8 rounded-xl border border-border bg-card">
          <h2 className="text-2xl font-bold mb-6">Commands</h2>
          <div className="space-y-3 font-mono text-sm">
            {[
              ["Solana Copilot: Ask a Question", "Open AI copilot"],
              ["Solana Copilot: Explain Current File", "Analyze Solana concepts"],
              ["Solana Copilot: Explain Selection", "Right-click to explain code"],
              ["Solana Copilot: Toggle Term Highlighting", "Enable/disable underlines"],
              ["Solana Copilot: Open in Web App", "Deep link to web platform"],
            ].map(([cmd, desc]) => (
              <div key={cmd} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <code className="text-primary">{cmd}</code>
                <span className="text-muted-foreground text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-12">
          <a href="/" className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
            <ExternalLink className="w-4 h-4" />
            Back to Solana Dev Copilot Web App
          </a>
        </div>
      </div>
    </div>
  );
}
