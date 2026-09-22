export default async function handler(request) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" }
    });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "NEWS_API_KEY is not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
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
      return new Response(JSON.stringify({
        error: data?.message || `NewsAPI request failed (${upstream.status})`
      }), {
        status: upstream.ok ? 502 : upstream.status,
        headers: { "content-type": "application/json" }
      });
    }

    const news = (data.articles || [])
      .filter(article => article?.title && article?.url && article.title !== "[Removed]")
      .map(article => ({
        tag: classify(`${article.title} ${article.description || ""}`),
        source: article.source?.name || "NEWS SOURCE",
        time: formatDate(article.publishedAt),
        title: cleanTitle(article.title),
        summary: article.description || "Latest development in finance, accounting and financial technology.",
        url: article.url
      }))
      .slice(0, 20);

    return new Response(JSON.stringify({
      updatedAt: new Date().toISOString(),
      news,
      markets: []
    }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    const message = error?.name === "AbortError"
      ? "News provider timed out"
      : (error?.message || "News service error");

    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "content-type": "application/json" }
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

function cleanTitle(title) {
  return String(title || "").trim();
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
