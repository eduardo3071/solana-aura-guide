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
    const { term, incorrectTerms, relatedTerms, difficulty, mode, locale = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const languageInstructions: Record<string, string> = {
      en: "Write everything in English.",
      pt: "Write everything in Brazilian Portuguese (pt-BR).",
      es: "Write everything in Spanish (es).",
    };

    const prompt = `You are a senior Solana developer and educator.

The user just completed a learning session about: "${term}"

They struggled with:
${(incorrectTerms || []).join(", ") || "None"}

Related concepts:
${(relatedTerms || []).join(", ")}

Difficulty: ${difficulty}
Quiz mode: ${mode}

${languageInstructions[locale] || languageInstructions.en}

Goal:
Generate a practical, real-world Solana example that helps the user apply what they just learned.

Requirements:
- Use realistic Solana context (Anchor, CLI, or Web3.js)
- Focus on the concepts the user struggled with
- Keep it educational and clear
- Include inline comments explaining the logic
- Avoid overly long code (max ~30 lines)

You MUST return valid JSON with this exact structure:
{
  "title": "Short title describing what this example demonstrates",
  "code": "The full code example with inline comments",
  "language": "rust or typescript or bash",
  "explanation": "2-3 sentences explaining what is happening and why it matters",
  "keyConcepts": ["Term1", "Term2", "Term3"]
}

Return ONLY the JSON, no markdown, no extra text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a Solana expert code generator. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse apply-code JSON:", raw);
      return new Response(JSON.stringify({ error: "Failed to parse response" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("solana-apply-code error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
