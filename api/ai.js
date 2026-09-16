export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        instructions: "You are LEVEL UP AI, a concise financial intelligence assistant. Answer questions about accounting, finance, fintech, financial technology, AI in finance, audit, markets and related academic topics. Give clear, accurate explanations. When a question asks for current facts you do not have verified data for, say so rather than inventing figures. Keep answers useful for a university student and use headings or bullets only when they improve readability.",
        input: message
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed"
      });
    }

    const answer = data.output_text || data.output?.map(item =>
      item.content?.map(part => part.text || "").join("") || ""
    ).join("").trim();

    return res.status(200).json({ answer: answer || "No answer returned." });
  } catch (error) {
    return res.status(500).json({ error: "AI service error" });
  }
}
