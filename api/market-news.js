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
      '(accounting OR fintech OR banking OR audit OR "digital payments" OR "artificial intelligence" OR markets OR finance)'
    );

    const categoryUrls = [
      ["ACCOUNTING", `https://newsapi.org/v2/everything?q=accounting%20OR%20audit%20OR%20bookkeeping%20OR%20CFO&from=${encodeURIComponent(new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())}&language=en&sortBy=publishedAt&pageSize=5`],
      ["AI", `https://newsapi.org/v2/everything?q=artificial%20intelligence%20OR%20generative%20AI%20OR%20machine%20learning%20OR%20AI%20agents&from=${encodeURIComponent(new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())}&language=en&sortBy=publishedAt&pageSize=5`],
      ["FINTECH", `https://newsapi.org/v2/everything?q=fintech%20OR%20digital%20payments%20OR%20UPI%20OR%20neobank%20OR%20embedded%20finance&from=${encodeURIComponent(new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())}&language=en&sortBy=publishedAt&pageSize=5`],
      ["BANKING", `https://newsapi.org/v2/everything?q=banking%20OR%20banks%20OR%20central%20bank%20OR%20lending%20OR%20credit&from=${encodeURIComponent(new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())}&language=en&sortBy=publishedAt&pageSize=5`],
      ["MARKETS", `https://newsapi.org/v2/everything?q=stock%20market%20OR%20markets%20OR%20equities%20OR%20commodities%20OR%20bonds&from=${encodeURIComponent(new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())}&language=en&sortBy=publishedAt&pageSize=5`]
    ];
    const everythingUrl = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=50`;
    const headlinesUrl = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=50`;

    const request = async (url) => {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Api-Key": apiKey,
          "X-No-Cache": "true",
          "Accept": "application/json"
        },
        signal: controller.signal,
        cache: "no-store"
      });
      const body = await response.json().catch(() => ({}));
      return { response, body };
    };

    const results = await Promise.all(categoryUrls.map(async ([tag, url]) => {
      const { response, body } = await request(url);
      if (!response.ok || body.status !== "ok") return [];
      return (body.articles || [])
        .filter(article => article?.title && article?.url && article.title !== "[Removed]")
        .map(article => ({
          tag,
          source: article.source?.name || "NEWS SOURCE",
          time: formatDate(article.publishedAt),
          title: String(article.title).trim(),
          summary: article.description || "Latest development in finance, accounting and financial technology.",
          url: article.url
        }));
    }));

    const news = results
      .flat()
      .sort((a, b) => new Date(b.time) - new Date(a.time));

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
