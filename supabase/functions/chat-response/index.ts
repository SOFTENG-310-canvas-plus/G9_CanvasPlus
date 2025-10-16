import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import "https://deno.land/x/dotenv/load.ts";

const MODEL = "gpt-5-nano";
const MAX_TOKENS = 1000;

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Replace with frontend URL in prod
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // 1. Check Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify JWT with Supabase secret
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response("Supabase environment not set", { status: 500, headers: corsHeaders });
    }

    // Verify JWT via Supabase REST endpoint
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    if (!verifyRes.ok) {
      return new Response("Unauthorized: invalid token", { status: 401, headers: corsHeaders });
    }

    const user = await verifyRes.json();
    console.log("Authenticated user:", user);

    // 3. Parse request body
    const { prompt, history } = await req.json();
    if (!prompt || prompt.trim() === "") {
      return new Response("Missing prompt", { status: 400, headers: corsHeaders });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response("OpenAI API key not set", { status: 500, headers: corsHeaders });
    }

    const messages = [
      { role: "system", content: "You are a helpful assistant responding concisely to student questions." },
      ...(Array.isArray(history) ? history.slice(-8) : []),
      { role: "user", content: prompt },
    ];

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: MODEL, messages, max_completion_tokens: MAX_TOKENS }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      return new Response(`OpenAI API error: ${errText}`, { status: 500, headers: corsHeaders });
    }

    const data = await openaiResponse.json();
    const assistantText = data.choices?.[0]?.message?.content || "No response";

    return new Response(JSON.stringify({ result: assistantText }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500, headers: corsHeaders });
  }
});
