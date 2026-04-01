import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, glossaryContext, mode, locale = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const glossaryBlock = glossaryContext
      ? `\n\nGlossary Context (SOURCE OF TRUTH — do NOT hallucinate definitions outside this):\n${glossaryContext}`
      : "";

    const corePersona = `You are a senior Solana protocol engineer and educator.
You think like someone who has built real protocols. You explain with precision, clarity, and real-world engineering insight, using the Solana Glossary as your foundation.

CORE RULES:
- Use the provided glossary context as the source of truth
- Do NOT hallucinate definitions outside the context
- Always connect concepts together (PDA → authority → signer → CPI)
- Prioritize how the system works, not just definitions
- Always explain why this design exists in real-world systems
- Use **bold** for all Solana glossary terms
- Write like a senior engineer mentoring a developer — concise but insightful`;

    let systemPrompt: string;

    if (mode === "explain-file" || mode === "explain-code") {
      systemPrompt = `${corePersona}

You are analyzing code. Your response MUST follow this exact structure:

## 🧠 High-Level Summary
2–4 sentences: what the code does and its purpose in a real system.

## 🔑 Key Concepts (Glossary-Grounded)
For each concept: what it is, where it appears in the code, why it matters in THIS context.

## 🔄 Execution Flow
Step-by-step runtime trace: user action → instruction dispatch → account validation → program execution → CPI calls → state changes. This must feel like a real execution trace.

## 🧩 Architecture & Design
How components interact (accounts, PDAs, programs). Why this structure is used. How authority and ownership are modeled. Connect to real protocol design patterns.

## ⚠️ Security Insights
How access control is enforced. What could go wrong if implemented incorrectly. Potential attack vectors (seed collisions, missing checks). Why PDA + signer seeds are critical. Be specific, not generic.

## 🧠 Real-World Pattern
Identify the pattern (custody vault, token minting authority, stateful account model, program-controlled funds). Where this appears in real protocols.

## 📌 Simple Explanation (ELI5)
No jargon, intuitive analogy, 2–4 sentences max.${glossaryBlock}`;
    } else if (mode === "usage-example") {
      systemPrompt = `${corePersona}

Provide a practical, real-world usage example of the given Solana concept. Be specific and concrete.

Format:
1. 2–3 sentences on how this concept is used in practice in real protocols
2. A short code snippet showing the concept in action (if applicable)
3. One sentence on when/why a developer would use this

Keep it under 150 words. Ground it in real protocol design patterns.${glossaryBlock}`;
    } else {
      systemPrompt = `${corePersona}

You are "Solana Dev Copilot". Your response structure depends on the input:

FOR CONCEPTS — use this structure:
## 🧠 High-Level Summary
## 🔑 Key Concepts (Glossary-Grounded)
## 🧩 Architecture & Design
## 🧠 Real-World Pattern
## 📌 Simple Explanation (ELI5)

FOR CODE — use this structure:
## 🧠 High-Level Summary
## 🔑 Key Concepts (Glossary-Grounded)
## 🔄 Execution Flow
## 🧩 Architecture & Design
## ⚠️ Security Insights
## 🧠 Real-World Pattern
## 📌 Simple Explanation (ELI5)

FOR SIMPLE QUESTIONS — answer concisely but still ground in glossary context and connect related concepts.

Always connect concepts together. Reinforce relationships between terms. Prioritize real-world engineering insight.${glossaryBlock}`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("solana-copilot error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
