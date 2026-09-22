export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const commercePattern = /\b(accounting|accountancy|finance|financial|fintech|banking|bank|economics|economic|commerce|business|tax|taxation|audit|auditing|investment|investing|stock market|market|capital|credit|debit|insurance|upi|payment|payments|blockchain|cryptocurrency|crypto|budget|budgeting|revenue|profit|loss|balance sheet|income statement|cash flow|ledger|bookkeeping|erp|rpa|regtech|wealthtech|corporate finance|financial accounting|cost accounting|management accounting|microeconomics|macroeconomics|entrepreneurship|supply chain|trade|gst|tally|cma|ca foundation|chartered accountant)\b/i;

    if (!commercePattern.test(message)) {
      return res.status(422).json({
        error: "I’m the LEVEL UP Commerce Desk. Please ask a question related to commerce, accounting, finance, economics, business, taxation, banking, fintech or related fields."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured in this Vercel deployment"
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          instructions: "You are LEVEL UP AI, a commerce and financial intelligence assistant for university students. ONLY answer questions related to commerce: accounting, finance, economics, business, taxation, banking, fintech, audit, investments, markets, payments, insurance, financial technology and closely related academic topics. For unrelated questions, politely refuse. Be accurate, clear, concise and practical. Do not invent current figures or claim live information unless provided by the user.",
          input: message
        }),
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.error?.message || `OpenAI request failed (${response.status})`
        });
      }

      const answer = typeof data.output_text === "string" && data.output_text.trim()
        ? data.output_text.trim()
        : (data.output || [])
            .flatMap(item => Array.isArray(item.content) ? item.content : [])
            .map(part => part?.text || "")
            .join("")
            .trim();

      return res.status(200).json({
        answer: answer || "No answer returned from the AI service."
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return res.status(502).json({
      error: error?.name === "AbortError"
        ? "The AI service took too long to respond. Please try again."
        : (error?.message || "AI service error")
    });
  }
}
