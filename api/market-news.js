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
    const feeds = [
      ["ACCOUNTING", "https://www.accountingtoday.com/feed"],
      ["AI", "https://techcrunch.com/tag/artificial-intelligence/feed/"],
      ["FINTECH", "https://www.finextra.com/rss/headlines.aspx"],
      ["BANKING", "https://www.finextra.com/rss/headlines.aspx"],
      ["MARKETS", "https://feeds.marketwatch.com/marketwatch/topstories/"]
    ];

    const fetchFeed = async (tag, url) => {
      const response = await fetch(url, {
        headers: { "Accept": "application/rss+xml, application/xml, text/xml" },
        signal: controller.signal,
        cache: "no-store"
      });
      if (!response.ok) return [];
      const xml = await response.text();
      return parseRss(xml, tag);
    };

    const results = await Promise.all(feeds.map(([tag, url]) => fetchFeed(tag, url)));
    const news = results.flat()
      .filter(article => article?.title && article?.url)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    if (!news.length) {
      return res.status(502).json({ error: "No current news available" });
    }

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

function parseRss(xml, forcedTag) {
  const items = xml.match(/<item[\\s\\S]*?<\\/item>/gi) || [];
  return items.map(item => {
    const title = decodeXml(matchTag(item, "title"));
    const url = decodeXml(matchTag(item, "link"));
    const description = decodeXml(matchTag(item, "description"));
    const publishedAt = matchTag(item, "pubDate") || matchTag(item, "published") || matchTag(item, "updated");
    const source = decodeXml(matchTag(item, "source")) || "NEWS SOURCE";
    if (!title || !url || !publishedAt) return null;
    return {
      tag: forcedTag,
      source,
      time: formatDate(publishedAt),
      title,
      summary: stripHtml(description) || "Latest development in finance, accounting and financial technology.",
      url,
      publishedAt
    };
  }).filter(Boolean).slice(0, 5);
}

function matchTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\\\s\\\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\\[CDATA\\[/g, "")
    .replace(/\\]\\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, "").trim();
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
