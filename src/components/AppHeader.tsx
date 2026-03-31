import { Link, useLocation } from "react-router-dom";
import { MessageSquare, BookOpen, Sparkles } from "lucide-react";

export function AppHeader() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: BookOpen },
    { path: "/copilot", label: "Copilot", icon: MessageSquare },
  ];

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center gradient-border bg-background">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold gradient-text">Solana Dev Copilot</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
