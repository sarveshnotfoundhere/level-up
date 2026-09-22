export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "NEWS_API_KEY is not configured" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const query = encodeURIComponent(
      'accounting OR fintech OR "artificial intelligence" OR banking OR "digital payments" OR audit'
    );

    const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=20`;

    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
        "Accept": "application/json"
      },
      signal: controller.signal,
      cache: "no-store"
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok || data.status !== "ok") {
      return res.status(upstream.ok ? 502 : upstream.status).json({
        error: data?.message || `NewsAPI request failed (${upstream.status})`
      });
    }

    const news = (data.articles || [])
      .filter(article => article?.title && article?.url && article.title !== "[Removed]")
      .map(article => ({
        tag: classify(`${article.title} ${article.description || ""}`),
        source: article.source?.name || "NEWS SOURCE",
        time: formatDate(article.publishedAt),
        title: String(article.title).trim(),
        summary: article.description || "Latest development in finance, accounting and financial technology.",
        url: article.url
      }))
      .slice(0, 20);

    return res.status(200).setHeader("Cache-Control", "no-store").json({
      updatedAt: new Date().toISOString(),
      news,
      markets: []
    });
  } catch (error) {
    return res.status(502).json({
      error: error?.name === "AbortError" ? "News provider timed out" : (error?.message || "News service error")
    });
  } finally {
    clearTimeout(timeout);
  }
}

function classify(text) {
  const t = text.toLowerCase();
  if (/(ai|artificial intelligence|machine learning|generative|agentic)/.test(t)) return "AI";
  if (/(payment|upi|fintech|digital wallet|embedded finance)/.test(t)) return "FINTECH";
  if (/(bank|banking|lender|credit)/.test(t)) return "BANKING";
  if (/(accounting|audit|reconciliation|financial close|cfo|bookkeeping)/.test(t)) return "ACCOUNTING";
  return "MARKETS";
}

function formatDate(value) {
  if (!value) return "LATEST";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "LATEST";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata"
  }).toUpperCase();
}
