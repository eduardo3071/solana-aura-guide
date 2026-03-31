# Solana Dev Copilot

> **ChatGPT + Solana Docs + Developer Tool** — An AI-powered developer assistant built on the official Solana Glossary.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
![Terms](https://img.shields.io/badge/terms-1001-brightgreen)
![Categories](https://img.shields.io/badge/categories-14-blue)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple)

---

## 🎯 What is this?

Solana Dev Copilot is a production-grade developer assistant that helps you understand Solana concepts in real time. It combines:

- **1001 official glossary terms** from `@stbr/solana-glossary`
- **Real AI responses** powered by Lovable AI (Gemini)
- **Instant search** across terms, definitions, and aliases
- **Code explanation** — paste Solana/Anchor code, get concept breakdowns
- **Clickable term highlighting** in AI responses
- **Tooltip system** for hoverable definitions
- **14 category explorer** with grid filtering

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (dark-first, Linear/Vercel aesthetic) |
| Data | `@stbr/solana-glossary` (1001 terms, 14 categories) |
| AI | Lovable AI Gateway (Gemini 3 Flash Preview) |
| Backend | Lovable Cloud (Edge Functions) |
| Animation | Framer Motion |
| Markdown | react-markdown |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│              Frontend (React)           │
│                                         │
│  ┌───────────┐  ┌──────────────────┐   │
│  │ Glossary  │  │   AI Chat UI     │   │
│  │ Browser   │  │   (Streaming)    │   │
│  └─────┬─────┘  └────────┬─────────┘   │
│        │                 │              │
│  ┌─────▼─────────────────▼──────────┐  │
│  │    @stbr/solana-glossary SDK     │  │
│  │    (1001 terms, local data)      │  │
│  └──────────────────────────────────┘  │
└────────────────┬────────────────────────┘
                 │ RAG Context
     ┌───────────▼───────────┐
     │   Edge Function       │
     │   (solana-copilot)    │
     │                       │
     │   Glossary Context    │
     │   + User Message      │
     │   → AI Gateway        │
     │   → Streaming SSE     │
     └───────────────────────┘
```

### RAG Flow (Retrieval-Augmented Generation)

1. User types a question
2. `searchTerms(userInput)` finds relevant glossary terms
3. Top 10 results are formatted as context
4. Context + message sent to AI via edge function
5. AI responds with glossary-grounded answers
6. Bold terms in responses become **clickable** → open term panel

---

## 📦 Glossary SDK Usage

The app uses the official `@stbr/solana-glossary` SDK:

```typescript
import { getTerm, searchTerms, getTermsByCategory, allTerms } from "@stbr/solana-glossary";

// Look up any term by ID or alias
const pda = getTerm("pda");        // by ID
const same = getTerm("PoH");       // by alias

// Search across 1001 terms
const results = searchTerms("account"); // matches name, definition, aliases

// Browse by category (14 categories)
const defiTerms = getTermsByCategory("defi"); // 135 terms

// Total dataset
console.log(allTerms.length); // 1001
```

---

## 🧠 Core Features

### 1. 🔍 Smart Search
- Instant search across 1001 terms
- Debounced for performance
- Results show term, category badge, and definition preview
- Keyboard navigation (↑↓ Enter Esc)

### 2. 📚 Term Detail Panel
- Full definition display
- Aliases with tags
- Related terms (clickable navigation)
- Category badge

### 3. 🤖 AI Copilot (Real AI)
- Streaming responses via SSE
- Glossary-context RAG for accuracy
- Clickable term highlighting in responses
- Error handling (rate limits, credits)
- Demo questions for quick start

### 4. 💻 Explain Code Feature
- Paste Solana/Anchor code
- AI identifies glossary concepts in code
- Structured explanation with concept breakdowns
- Pre-filled code examples

### 5. 🧩 Tooltip System
- Reusable `<TermTooltip termId="pda">` component
- Hover to see definition
- Click to navigate

### 6. 🧭 Category Explorer
- All 14 official categories displayed
- Grid layout with icons and term counts
- Click to filter, click again to deselect

### 7. ⚡ Term Highlighting
- AI responses auto-detect **bold** glossary terms
- Bold terms become clickable links
- Opens term detail panel on click

---

## 🎨 Design

- **Dark mode** by default
- **Linear / Vercel** inspired aesthetic
- Custom CSS tokens for consistent theming
- Smooth Framer Motion animations
- Responsive across all viewports
- Custom scrollbars, gradient effects, glow utilities

---

## 🎥 Demo Mode

Pre-filled questions on the Copilot page:
- "What is PDA in Solana?"
- "Explain accounts like I'm a beginner"
- "How does Proof of History work?"
- "What's the difference between Tower BFT and traditional PBFT?"
- "What is an AMM and how does it work on Solana?"
- "Explain ZK Compression in Solana"

Pre-filled code examples on Explain Code:
- PDA derivation code
- Token transfer CPI code

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AppHeader.tsx          # Navigation with Glossary/Copilot/Explain Code
│   ├── CategoryGrid.tsx       # 14-category grid with icons
│   ├── ChatUI.tsx             # AI chat with streaming + term highlighting
│   ├── SearchBar.tsx          # Debounced search with keyboard nav
│   ├── TermCard.tsx           # Term display card
│   ├── TermDetailPanel.tsx    # Full term detail sidebar
│   └── TermTooltip.tsx        # Hoverable term tooltips
├── lib/
│   ├── ai-chat.ts             # SSE streaming + RAG context builder
│   └── solana-glossary/       # SDK shim with official data
│       ├── index.ts           # API: getTerm, searchTerms, etc.
│       ├── types.ts           # GlossaryTerm, Category types
│       ├── terms/             # 14 JSON files (1001 terms)
│       └── i18n/              # pt.json, es.json translations
├── pages/
│   ├── Index.tsx              # Main glossary dashboard
│   └── Copilot.tsx            # AI chat + Explain Code page
└── integrations/
    └── supabase/              # Auto-generated client

supabase/
└── functions/
    └── solana-copilot/        # AI edge function with RAG
        └── index.ts
```

---

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Open http://localhost:5173

The AI Copilot requires Lovable Cloud to be enabled (provides the AI gateway automatically).

---

## 📄 License

MIT

---

Built with ❤️ for the Solana ecosystem by [Superteam Brazil](https://twitter.com/SuperteamBR).
