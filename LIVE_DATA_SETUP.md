# LEVEL UP — Live Data Setup

The V5 frontend is ready for live data, but API keys must NOT be placed in browser JavaScript.

## Endpoint contract

Set this in `news.js`:

```js
const LIVE_CONFIG = {
  enabled: true,
  endpoint: "/api/market-news",
  refreshMs: 60000
};
```

Your server endpoint should return:

```json
{
  "news": [
    {
      "tag": "FINTECH",
      "source": "SOURCE",
      "time": "SEP 16, 2026",
      "title": "Headline",
      "summary": "Short factual summary.",
      "url": "https://example.com/article"
    }
  ],
  "markets": [
    ["NIFTY 50", "23118.60", "-279.50", "-1.19%", "down"]
  ]
}
```

## Market data options

For Indian market data, use a provider that explicitly permits website display and obtain credentials on the server. Zerodha Kite Connect, Groww's API, Upstox and other providers offer market-data APIs, while NSE also offers licensed real-time data products.

## Important

- Do not expose API keys in `news.js`.
- Check each provider's display/redistribution terms before publishing data publicly.
- The bundled market numbers are a current snapshot, not a substitute for a live feed.
- The bundled news is a sourced editorial snapshot. A live feed should preserve source attribution and timestamps.
