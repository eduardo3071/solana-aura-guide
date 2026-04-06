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
    const { term, category, definition, relatedTerms, difficulty, mode, locale = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const languageInstructions: Record<string, string> = {
      en: "Write questions and explanations in English.",
      pt: "Write questions and explanations in Brazilian Portuguese (pt-BR).",
      es: "Write questions and explanations in Spanish (es).",
    };

    const prompt = `You are a Solana expert educator.

Generate 3 multiple-choice questions based on the concept: "${term}".

Context:
- Category: ${category}
- Definition: ${definition}
- Related terms: ${(relatedTerms || []).join(", ")}
- Difficulty: ${difficulty}
- Mode: ${mode}

${languageInstructions[locale] || languageInstructions.en}

Rules:
- 4 options per question
- Only 1 correct answer
- Avoid obvious answers
- Make questions practical and contextual when possible

Modes:
- concept → definition-based questions
- connections → relationship between terms
- real-world → applied scenarios or code

Difficulty:
- beginner → simple definitions
- intermediate → relationships and how things work
- advanced → application, edge cases, or code

You MUST return valid JSON with this exact structure:
{
  "questions": [
    {
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "...",
      "relatedTerms": ["Term1", "Term2"]
    }
  ]
}

The "correct" field is the 0-based index of the correct option.
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
          { role: "system", content: "You are a Solana expert quiz generator. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (strip markdown fences if present)
    let parsed;
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse quiz JSON:", raw);
      return new Response(JSON.stringify({ error: "Failed to parse quiz", questions: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("solana-quiz error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
