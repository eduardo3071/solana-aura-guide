import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { terms, targetLang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const langName = targetLang === "pt" ? "Brazilian Portuguese (pt-BR)" : "Spanish (es)";

    const prompt = `Translate the following Solana/blockchain glossary entries to ${langName}.
Translate BOTH the "term" field AND the "definition" field fully.
Keep technical terms like Solana, BPF, eBPF, SVM, SPL, CPI, PDA, PoH, BFT, AMM, NFT, DeFi, SOL, USDC, etc. in English but translate all surrounding text.
Keep code snippets, variable names, and function names in English.

Return ONLY valid JSON with this exact structure:
{"id1": {"term": "translated term", "definition": "translated definition"}, ...}

Entries:
${JSON.stringify(terms)}`;

    const resp = await fetch("https://ai.lovable.dev/api/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 16000,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`AI API error: ${resp.status} ${err}`);
    }

    const data = await resp.json();
    let content = data.choices[0].message.content.trim();
    
    // Strip markdown code blocks
    if (content.startsWith("```")) {
      content = content.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
    }

    const translated = JSON.parse(content);
    return new Response(JSON.stringify(translated), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
