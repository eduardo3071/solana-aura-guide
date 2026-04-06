## Plano de Redesign — Solana Dev Copilot

### Fase 1: Hero Section Inteligente
- Input unificado com placeholder animado (digitando termos automaticamente)
- Auto-detecção: texto → busca termo, código → redireciona para Explain Code
- Glow sutil no input (sensação de IA)
- CTAs: "Explain code" + "Try: PDA, Turbine..."

### Fase 2: Term Detail Page (reformulada)
- Category badge + título + definição curta
- 🧠 AI Insight auto-gerado ("Commonly used with X and Y")
- Explicação completa com termos clicáveis (hover → tooltip)
- Código de exemplo com botões [copy] [explain]
- Related terms como cards clicáveis
- CTAs sempre visíveis: "Explain with AI", "Simplify (ELI5)", "Use in real code", "Compare"

### Fase 3: AI Layer Protagonista
- AI Insight sempre visível nos termos
- Botões de ação: Explain, Simplify, Use in code, Compare
- Respostas estruturadas (conceitos, contexto, aplicação, riscos)

### Fase 4: Code Interaction Avançada
- Bloco de código com [copy] [explain]
- Ao explicar: detectar termos do glossário, mostrar explanation, flow, risks, improvements
- Highlight de termos dentro do código

### Fase 5: Graph View (Knowledge Graph)
- Instalar biblioteca de grafos (e.g. react-force-graph ou similar)
- Nó central = termo atual, conexões = related/dependencies/category
- Zoom, drag, click → abre termo
- Botão "View Knowledge Graph" na term page

### Fase 6: Micro-interações
- Hover com scale + glow
- Skeleton loading
- Framer-motion transitions
- Fade-in progressivo nos cards

---

**Nota:** Implementarei fase por fase para manter qualidade. Cada fase será testável antes de avançar.