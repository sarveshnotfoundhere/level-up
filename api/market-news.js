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
    const categoryQueries = [
      ["ACCOUNTING", "accounting OR audit OR bookkeeping OR CFO"],
      ["AI", "artificial intelligence OR generative AI OR machine learning OR AI agents"],
      ["FINTECH", "fintech OR digital payments OR UPI OR neobank OR embedded finance"],
      ["BANKING", "banking OR banks OR central bank OR lending OR credit"],
      ["MARKETS", "stock market OR markets OR equities OR commodities OR bonds"]
    ];

    const request = async (url) => {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-Api-Key": apiKey,
          "Accept": "application/json"
        },
        signal: controller.signal,
        cache: "no-store"
      });
      const body = await response.json().catch(() => ({}));
      return { response, body };
    };

    const results = await Promise.all(categoryQueries.map(async ([tag, search]) => {
      const q = encodeURIComponent(search);
      const url = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=10`;
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
        }))
        .slice(0, 5);
    }));

    const news = results.flat();

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
