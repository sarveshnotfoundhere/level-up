export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" }
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "OPENAI_API_KEY is not configured in this Vercel deployment"
      }), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        instructions: "You are LEVEL UP AI, a financial intelligence and accounting technology assistant for university students. Answer questions about accounting, finance, fintech, AI in finance, audit, financial technology and related academic topics. Be accurate, clear and practical. Do not invent current figures or claim live information unless provided in the prompt. Explain concepts with examples when useful.",
        input: message
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: data?.error?.message || `OpenAI request failed (${response.status})`
      }), {
        status: response.status,
        headers: { "content-type": "application/json" }
      });
    }

    const answer = typeof data.output_text === "string" && data.output_text.trim()
      ? data.output_text.trim()
      : (data.output || [])
          .flatMap(item => Array.isArray(item.content) ? item.content : [])
          .map(part => part?.text || "")
          .join("")
          .trim();

    return new Response(JSON.stringify({
      answer: answer || "No answer returned from OpenAI."
    }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error?.message || "AI service error"
    }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
